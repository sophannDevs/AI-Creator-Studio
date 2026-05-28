import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateThumbnailDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  text?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  backgroundIdea?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  mainObject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  style?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  prompt?: string;
}
