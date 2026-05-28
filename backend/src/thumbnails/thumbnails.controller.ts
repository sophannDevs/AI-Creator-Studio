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
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UpdateThumbnailDto } from './dto/update-thumbnail.dto';
import { ThumbnailsService } from './thumbnails.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ThumbnailsController {
  constructor(private readonly thumbnailsService: ThumbnailsService) {}

  @Get('video-ideas/:ideaId/thumbnail')
  getByIdea(
    @CurrentUser() user: JwtPayload,
    @Param('ideaId', new ParseUUIDPipe()) ideaId: string,
  ) {
    return this.thumbnailsService.getByVideoIdea(ideaId, user.userId);
  }

  @Patch('thumbnails/:id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateThumbnailDto,
  ) {
    return this.thumbnailsService.updateById(id, user.userId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('thumbnails/:id')
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.thumbnailsService.deleteById(id, user.userId);
  }
}
