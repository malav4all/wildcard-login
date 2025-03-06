import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AccessToken extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  token: string;

  @Prop({ type: Object, default: {} })s
  loginResponse: Record<string, any>;

  @Prop({ required: true })
  expiresAt: Date;
}

export const AccessTokenSchema = SchemaFactory.createForClass(AccessToken);
