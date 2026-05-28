import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateProjectDto): Promise<Project> {
    return this.prisma.project.create({
      data: {
        userId,
        name: dto.name.trim(),
        niche: dto.niche.trim(),
        language: dto.language.trim(),
        targetAudience: dto.targetAudience.trim(),
        description: dto.description?.trim() ? dto.description.trim() : null,
      },
    });
  }

  findAllByUser(userId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOwnedById(id: string, userId: string): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }

  async updateOwnedById(
    id: string,
    userId: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    await this.ensureExists(id, userId);

    const data: Prisma.ProjectUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.niche !== undefined) {
      data.niche = dto.niche.trim();
    }
    if (dto.language !== undefined) {
      data.language = dto.language.trim();
    }
    if (dto.targetAudience !== undefined) {
      data.targetAudience = dto.targetAudience.trim();
    }
    if (dto.description !== undefined) {
      data.description =
        dto.description === null ? null : dto.description.trim();
    }

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async deleteOwnedById(id: string, userId: string): Promise<void> {
    await this.ensureExists(id, userId);
    await this.prisma.project.delete({ where: { id } });
  }

  private async ensureExists(id: string, userId: string): Promise<void> {
    const existing = await this.prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Project not found.');
    }
  }
}
