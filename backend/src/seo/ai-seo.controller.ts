import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateAiSeoDto } from './dto/create-ai-seo.dto';
import { SeoService } from './seo.service';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiSeoController {
  constructor(private readonly seoService: SeoService) {}

  @Post('seo')
  generate(@CurrentUser() user: JwtPayload, @Body() dto: CreateAiSeoDto) {
    return this.seoService.generateAndSave(user.userId, dto);
  }
}
