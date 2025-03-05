import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TokenGenerationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
