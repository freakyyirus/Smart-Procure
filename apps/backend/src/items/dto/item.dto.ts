import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({ example: 'MS Steel Plates' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'High-quality mild steel plates', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Steel' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: '7214', required: false })
  @IsString()
  @IsOptional()
  hsn?: string;

  @ApiProperty({ example: 18 })
  @IsNumber()
  @IsOptional()
  defaultGst?: number;
}

export class UpdateItemDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  hsn?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  defaultGst?: number;
}
