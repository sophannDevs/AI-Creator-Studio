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
import { UpdateScriptDto } from './dto/update-script.dto';
import { ScriptsService } from './scripts.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Get('video-ideas/:ideaId/script')
  getByIdea(
    @CurrentUser() user: JwtPayload,
    @Param('ideaId', new ParseUUIDPipe()) ideaId: string,
  ) {
    return this.scriptsService.getByVideoIdea(ideaId, user.userId);
  }

  @Patch('scripts/:id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateScriptDto,
  ) {
    return this.scriptsService.updateById(id, user.userId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('scripts/:id')
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.scriptsService.deleteById(id, user.userId);
  }
}
