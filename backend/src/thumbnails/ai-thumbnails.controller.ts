import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateAiThumbnailDto } from './dto/create-ai-thumbnail.dto';
import { ThumbnailsService } from './thumbnails.service';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiThumbnailsController {
  constructor(private readonly thumbnailsService: ThumbnailsService) {}

  @Post('thumbnail')
  generate(@CurrentUser() user: JwtPayload, @Body() dto: CreateAiThumbnailDto) {
    return this.thumbnailsService.generateAndSave(user.userId, dto);
  }
}
