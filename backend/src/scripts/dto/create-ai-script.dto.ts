import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAiScriptDto {
  @IsUUID()
  videoIdeaId!: string;

  @IsString()
  @MaxLength(100)
  duration!: string;

  @IsString()
  @MaxLength(100)
  tone!: string;

  @IsString()
  @MaxLength(100)
  language!: string;
}
