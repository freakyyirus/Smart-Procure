import { IsString, IsNotEmpty, IsNumber, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuoteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rfqId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  basePrice: number;

  @ApiProperty({ example: 18 })
  @IsNumber()
  gst: number;

  @ApiProperty({ example: 2000, required: false })
  @IsNumber()
  @IsOptional()
  transportCost?: number;

  @ApiProperty({ example: 7, required: false })
  @IsInt()
  @IsOptional()
  deliveryDays?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  terms?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ApproveQuoteDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
