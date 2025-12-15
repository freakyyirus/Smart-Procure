import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  RFQ_RECEIVED = 'RFQ_RECEIVED',
  QUOTE_SUBMITTED = 'QUOTE_SUBMITTED',
  QUOTE_APPROVED = 'QUOTE_APPROVED',
  PO_SENT = 'PO_SENT',
  PO_ACKNOWLEDGED = 'PO_ACKNOWLEDGED',
  DELIVERY_UPDATE = 'DELIVERY_UPDATE',
  PAYMENT_DUE = 'PAYMENT_DUE',
  MANDATE_SIGNED = 'MANDATE_SIGNED',
  AI_INSIGHT = 'AI_INSIGHT',
  PRICE_ALERT = 'PRICE_ALERT',
  SYSTEM = 'SYSTEM',
}

export class CreateNotificationDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Link to related resource' })
  @IsOptional()
  @IsString()
  link?: string;
}

export class MarkNotificationsReadDto {
  @ApiProperty({ description: 'Notification IDs to mark as read' })
  @IsUUID('4', { each: true })
  ids: string[];
}
