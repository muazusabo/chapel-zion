import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExecutiveDto, ReorderExecutivesDto, UpdateExecutiveDto } from './dto/executive.dto';

@Injectable()
export class ExecutivesService {
  constructor(private prisma: PrismaService) {}

  async findPublished() {
    const executives = await this.prisma.executive.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return executives.sort((first, second) => {
      const firstPosition = first.position.toLowerCase();
      const secondPosition = second.position.toLowerCase();
      const firstPriority = firstPosition.includes('vice president')
        ? 1
        : firstPosition.includes('president')
          ? 0
          : 2;
      const secondPriority = secondPosition.includes('vice president')
        ? 1
        : secondPosition.includes('president')
          ? 0
          : 2;

      return firstPriority - secondPriority || first.order - second.order;
    });
  }

  findAllAdmin() {
    return this.prisma.executive.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const exec = await this.prisma.executive.findUnique({ where: { id } });
    if (!exec) throw new NotFoundException('Executive not found');
    return exec;
  }

  async create(dto: CreateExecutiveDto) {
    const maxOrder = await this.prisma.executive.aggregate({ _max: { order: true } });
    return this.prisma.executive.create({
      data: { ...dto, order: dto.order ?? (maxOrder._max.order ?? 0) + 1 },
    });
  }

  async update(id: string, dto: UpdateExecutiveDto) {
    await this.findOne(id);
    return this.prisma.executive.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.executive.delete({ where: { id } });
    return { message: 'Executive removed' };
  }

  async reorder(dto: ReorderExecutivesDto) {
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.executive.update({ where: { id: item.id }, data: { order: item.order } }),
      ),
    );
    return this.findAllAdmin();
  }
}
