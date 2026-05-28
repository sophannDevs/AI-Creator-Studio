import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  niche?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  targetAudience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;
}
