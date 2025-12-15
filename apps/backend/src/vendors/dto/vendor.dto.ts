import { IsString, IsEmail, IsNotEmpty, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ example: 'Steel Suppliers Pvt Ltd' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'vendor@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+91 9876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '29XXXXX1234X1Z5', required: false })
  @IsString()
  @IsOptional()
  gstin?: string;

  @ApiProperty({ example: '123 Industrial Area', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Mumbai', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Maharashtra', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '400001', required: false })
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiProperty({ example: 'Rajesh Kumar', required: false })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({ example: ['Steel', 'Iron', 'Aluminum'], required: false })
  @IsArray()
  @IsOptional()
  materialsSupplied?: string[];

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateVendorDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gstin?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  materialsSupplied?: string[];

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
