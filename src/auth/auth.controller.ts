import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  InternalServerErrorException,
  BadRequestException,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenGenerationDto } from './dto/token-generation.dto';
import { AccessToken } from './schemas/access-token.schema';

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

  @Post('token')
  async getAccessToken(@Body('userId') userId: string): Promise<AccessToken> {
    try {
      if (!userId) {
        throw new NotFoundException('User ID is required');
      }
      return await this.authService.getAccessToken(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('No valid token found for this user');
      }
      throw new InternalServerErrorException(
        'Something went wrong while fetching the token',
      );
    }
  }
}
