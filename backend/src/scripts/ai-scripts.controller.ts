import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateAiScriptDto } from './dto/create-ai-script.dto';
import { ScriptsService } from './scripts.service';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Post('script')
  generate(@CurrentUser() user: JwtPayload, @Body() dto: CreateAiScriptDto) {
    return this.scriptsService.generateAndSave(user.userId, dto);
  }
}
