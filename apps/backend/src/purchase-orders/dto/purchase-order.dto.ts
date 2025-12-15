import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class POLineItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty()
  @IsNumber()
  gst: number;

  @ApiProperty()
  @IsNumber()
  gstAmount: number;

  @ApiProperty()
  @IsNumber()
  totalAmount: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  quoteId?: string;

  @ApiProperty({ type: [POLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POLineItemDto)
  lineItems: POLineItemDto[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  terms?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  expectedDeliveryDate?: string;
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  PARTIALLY_DELIVERED = 'PARTIALLY_DELIVERED',
  REJECTED = 'REJECTED',
}

export class UpdateDeliveryStatusDto {
  @ApiProperty({ enum: DeliveryStatus })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  receivedBy?: string;
}

export class UpdatePOStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;
}
