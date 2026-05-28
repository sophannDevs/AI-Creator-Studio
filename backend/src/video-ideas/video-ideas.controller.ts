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
import { CreateAiVideoIdeasDto } from './dto/create-ai-video-ideas.dto';
import { UpdateVideoIdeaDto } from './dto/update-video-idea.dto';
import { VideoIdeasService } from './video-ideas.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class VideoIdeasController {
  constructor(private readonly videoIdeasService: VideoIdeasService) {}

  @Post('ai/video-ideas')
  generate(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAiVideoIdeasDto,
  ) {
    return this.videoIdeasService.generateAndSave(user.userId, dto);
  }

  @Get('projects/:projectId/video-ideas')
  listByProject(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    return this.videoIdeasService.listByProject(projectId, user.userId);
  }

  @Patch('video-ideas/:id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateVideoIdeaDto,
  ) {
    return this.videoIdeasService.updateById(id, user.userId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('video-ideas/:id')
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.videoIdeasService.deleteById(id, user.userId);
  }
}
