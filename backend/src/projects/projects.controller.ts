import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.projectsService.findAllByUser(user.userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.projectsService.findOwnedById(id, user.userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateOwnedById(id, user.userId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.projectsService.deleteOwnedById(id, user.userId);
  }
}
