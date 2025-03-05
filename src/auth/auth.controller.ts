import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenGenerationDto } from './dto/token-generation.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('generate-token')
  @HttpCode(HttpStatus.OK)
  async generateToken(@Body(new ValidationPipe()) dto: TokenGenerationDto) {
    try {
      return await this.authService.generateAccessToken(dto);
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Invalid input data');
      }
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }
}
