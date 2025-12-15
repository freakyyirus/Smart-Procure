import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class RfqItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateRfqDto {
  @ApiProperty({ example: 'Steel Purchase Q1 2024' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ type: [RfqItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RfqItemDto)
  items: RfqItemDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  vendorIds: string[];
}

export class SendRfqDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  sendEmail: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  sendWhatsapp: boolean;
}
