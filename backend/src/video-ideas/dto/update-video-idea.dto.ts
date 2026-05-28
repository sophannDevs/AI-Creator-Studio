import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateVideoIdeaDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  hook?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;
}
