import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken library
import { AccessToken } from './schemas/access-token.schema';
import { TokenGenerationDto } from './dto/token-generation.dto';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET = 'your-secret-key';

  constructor(
    @InjectModel(AccessToken.name)
    private accessTokenModel: Model<AccessToken>,
  ) {}

  async generateAccessToken(dto: TokenGenerationDto): Promise<{
    accessToken: string;
    userId: string;
    message?: string;
  }> {
    const existingToken = await this.accessTokenModel.findOne({
      userId: dto.userId,
      expiresAt: { $gt: new Date() },
    });

    if (existingToken) {
      return {
        accessToken: existingToken.token,
        userId: dto.userId,
        message: 'Existing valid token returned',
      };
    }

    const payload = { sub: dto.userId };

    const accessToken = jwt.sign(payload, this.JWT_SECRET);
    const tokenEntity = new this.accessTokenModel({
      userId: dto.userId,
      token: accessToken,
      expiresAt: new Date(Date.now() + 3600000),
      loginResponse: {},
    });

    await tokenEntity.save();

    return {
      accessToken,
      userId: dto.userId,
      message: 'New token generated successfully',
    };
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { sub: string };
      const storedToken = await this.accessTokenModel.findOne({
        token,
        userId: decoded.sub,
        expiresAt: { $gt: new Date() },
      });

      return !!storedToken;
    } catch (error) {
      return false;
    }
  }

  async getAccessToken(userId: string): Promise<AccessToken> {
    const tokenData = await this.accessTokenModel
      .findOne({
        userId,
      })
      .sort({ createdAt: -1 });

    if (!tokenData) {
      throw new NotFoundException('No valid token found for this user');
    }

    return tokenData;
  }

  async deleteAccessToken(userId: string): Promise<{ message: string }> {
    try {
      const result = await this.accessTokenModel.deleteMany({ userId });

      if (result.deletedCount === 0) {
        throw new NotFoundException('No access tokens found for this user');
      }

      return { message: 'Access tokens deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}
