import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateScriptDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  hook?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  intro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  mainContent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  conclusion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cta?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  duration?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tone?: string;
}
