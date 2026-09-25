"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const notifications_service_1 = require("../notifications/notifications.service");
let AuthService = class AuthService {
    constructor(usersService, prisma, jwtService, config, notifications) {
        this.usersService = usersService;
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
        this.notifications = notifications;
    }
    async register(dto) {
        const user = await this.usersService.create(dto);
        await this.notifications.sendWelcomeEmail(user.email, user.fullName);
        const tokens = this.issueTokens(user.id, user.email, user.role);
        return { user, ...tokens };
    }
    async login(email, password) {
        const user = await this.usersService.findByEmailWithPassword(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.status === 'SUSPENDED') {
            throw new common_1.UnauthorizedException('Your account has been suspended. Contact an administrator.');
        }
        const passwordValid = await argon2.verify(user.passwordHash, password);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        await this.usersService.updateLastLogin(user.id);
        const { passwordHash, ...safeUser } = user;
        const tokens = this.issueTokens(user.id, user.email, user.role);
        return { user: safeUser, ...tokens };
    }
    async getMe(userId) {
        return this.usersService.findById(userId);
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByEmailWithPassword(email);
        const genericResponse = {
            message: 'If an account with that email exists, a password reset link has been sent.',
        };
        if (!user) {
            return genericResponse;
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.passwordResetToken.create({
            data: { userId: user.id, tokenHash, expiresAt },
        });
        const clientUrl = this.config.get('CLIENT_URL');
        const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;
        await this.notifications.sendPasswordResetEmail(user.email, resetUrl);
        return genericResponse;
    }
    async resetPassword(token, newPassword) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash },
        });
        if (!resetToken ||
            resetToken.usedAt ||
            resetToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('This reset link is invalid or has expired');
        }
        await this.usersService.setPassword(resetToken.userId, newPassword);
        await this.prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { usedAt: new Date() },
        });
        return { message: 'Password has been reset successfully. You can now log in.' };
    }
    issueTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '7d',
        });
        return { accessToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map