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
import { UpdateSeoDto } from './dto/update-seo.dto';
import { SeoService } from './seo.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('video-ideas/:ideaId/seo')
  getByIdea(
    @CurrentUser() user: JwtPayload,
    @Param('ideaId', new ParseUUIDPipe()) ideaId: string,
  ) {
    return this.seoService.getByVideoIdea(ideaId, user.userId);
  }

  @Patch('seo/:id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSeoDto,
  ) {
    return this.seoService.updateById(id, user.userId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('seo/:id')
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.seoService.deleteById(id, user.userId);
  }
}
