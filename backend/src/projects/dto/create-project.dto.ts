import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @MaxLength(100)
  niche!: string;

  @IsString()
  @MaxLength(100)
  language!: string;

  @IsString()
  @MaxLength(200)
  targetAudience!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
