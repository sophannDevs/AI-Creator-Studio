import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAiThumbnailDto {
  @IsUUID()
  videoIdeaId!: string;

  @IsString()
  @MaxLength(200)
  style!: string;
}
