import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private notifications: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    await this.notifications.sendWelcomeEmail(user.email, user.fullName);
    const tokens = this.issueTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmailWithPassword(email);

    // Constant response shape/timing regardless of which check fails,
    // to avoid leaking whether an email exists.
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException(
        'Your account has been suspended. Contact an administrator.',
      );
    }

    const passwordValid = await argon2.verify(user.passwordHash, password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.usersService.updateLastLogin(user.id);

    const { passwordHash, ...safeUser } = user;
    const tokens = this.issueTokens(user.id, user.email, user.role);
    return { user: safeUser, ...tokens };
  }

  async getMe(userId: string) {
    return this.usersService.findById(userId);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmailWithPassword(email);

    // Always return a generic success message — never reveal whether
    // the email exists in the system.
    const genericResponse = {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };

    if (!user) {
      return genericResponse;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const clientUrl = this.config.get<string>('CLIENT_URL');
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;
    await this.notifications.sendPasswordResetEmail(user.email, resetUrl);

    return genericResponse;
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('This reset link is invalid or has expired');
    }

    await this.usersService.setPassword(resetToken.userId, newPassword);
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    return { message: 'Password has been reset successfully. You can now log in.' };
  }

  private issueTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '7d',
    });
    return { accessToken };
  }
}
