import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

const SAFE_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  studentId: true,
  department: true,
  faculty: true,
  level: true,
  profilePicture: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    studentId?: string;
    department?: string;
    faculty?: string;
    level?: string;
    role?: Role;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    if (data.studentId) {
      const existingStudent = await this.prisma.user.findUnique({
        where: { studentId: data.studentId },
      });
      if (existingStudent) {
        throw new ConflictException(
          'An account with this student/matric number already exists',
        );
      }
    }

    const passwordHash = await argon2.hash(data.password);

    return this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        passwordHash,
        phoneNumber: data.phoneNumber,
        studentId: data.studentId,
        department: data.department,
        faculty: data.faculty,
        level: data.level,
        role: data.role ?? Role.USER,
      },
      select: SAFE_USER_SELECT,
    });
  }

  findByEmailWithPassword(email: string) {
    return this.prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async updateProfile(
    id: string,
    data: Partial<{
      fullName: string;
      phoneNumber: string;
      department: string;
      faculty: string;
      level: string;
      studentId: string;
      profilePicture: string;
    }>,
  ) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data,
      select: SAFE_USER_SELECT,
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await argon2.verify(user.passwordHash, currentPassword);
    if (!valid) {
      throw new ConflictException('Current password is incorrect');
    }

    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { message: 'Password updated successfully' };
  }

  async setPassword(id: string, newPassword: string) {
    const passwordHash = await argon2.hash(newPassword);
    return this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: UserStatus;
    role?: Role;
  }) {
    const { page, limit, search, status, role } = params;
    const where: Prisma.UserWhereInput = {
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search } },
              { email: { contains: search } },
              { studentId: { contains: search } },
              { department: { contains: search } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: SAFE_USER_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async setStatus(id: string, status: UserStatus) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: SAFE_USER_SELECT,
    });
  }

  async setRole(id: string, role: Role) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: SAFE_USER_SELECT,
    });
  }

  async getDashboardStats(userId: string) {
    const [donationsAgg, offeringsAgg, receiptCount] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { userId, status: 'SUCCESSFUL', givingType: { in: ['DONATION', 'SPECIAL_CONTRIBUTION', 'BUILDING_PROJECT', 'OTHER'] } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, status: 'SUCCESSFUL', givingType: { in: ['OFFERING', 'TITHE'] } },
        _sum: { amount: true },
      }),
      this.prisma.receipt.count({ where: { userId } }),
    ]);

    return {
      totalDonations: donationsAgg._sum.amount ?? 0,
      totalOfferings: offeringsAgg._sum.amount ?? 0,
      totalReceipts: receiptCount,
      totalGiving:
        Number(donationsAgg._sum.amount ?? 0) + Number(offeringsAgg._sum.amount ?? 0),
    };
  }
}
