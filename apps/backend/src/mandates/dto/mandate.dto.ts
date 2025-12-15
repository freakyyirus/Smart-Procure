import { IsString, IsNotEmpty, IsNumber, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMandateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  poId: string;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ example: '2024-01-31' })
  @IsString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ example: 1, default: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  installments?: number;

  @ApiProperty({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  autoDeductEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  terms?: string;

  @ApiProperty({ required: false, description: 'JSON string with bank/UPI details' })
  @IsString()
  @IsOptional()
  bankDetails?: string;
}

export class SignMandateDto {
  @ApiProperty({ description: 'Digital signature (URL or base64)' })
  @IsString()
  @IsNotEmpty()
  signature: string;
}

export class ExecuteMandateDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
