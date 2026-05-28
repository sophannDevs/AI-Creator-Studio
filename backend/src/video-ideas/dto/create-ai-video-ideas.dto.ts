import { Type } from 'class-transformer';
import { IsInt, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateAiVideoIdeasDto {
  @IsUUID()
  projectId!: string;

  @IsString()
  @MaxLength(100)
  tone!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  count: number = 5;
}
