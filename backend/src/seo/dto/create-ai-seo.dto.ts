import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAiSeoDto {
  @IsUUID()
  videoIdeaId!: string;

  @IsString()
  @MaxLength(200)
  targetKeyword!: string;
}
