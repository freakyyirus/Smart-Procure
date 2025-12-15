import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@smartprocure.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password: string;
}

export class SignupDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'First name contains invalid characters' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Last name contains invalid characters' })
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @ApiProperty({ example: 'SecurePass@123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)' }
  )
  password: string;

  @ApiProperty({ example: '+91 9876543210', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^[+]?[\d\s-]{10,20}$/, { message: 'Please provide a valid phone number' })
  phone?: string;

  @ApiProperty({ example: 'ABC Pvt Ltd' })
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  @MaxLength(200, { message: 'Company name must not exceed 200 characters' })
  companyName: string;

  @ApiProperty({ example: 'company@example.com' })
  @IsEmail({}, { message: 'Please provide a valid company email' })
  @IsNotEmpty({ message: 'Company email is required' })
  @MaxLength(255, { message: 'Company email must not exceed 255 characters' })
  companyEmail: string;

  @ApiProperty({ example: '+91 9876543210' })
  @IsString()
  @IsNotEmpty({ message: 'Company phone is required' })
  @Matches(/^[+]?[\d\s-]{10,20}$/, { message: 'Please provide a valid company phone number' })
  companyPhone: string;

  @ApiProperty({ example: '29XXXXX1234X1Z5', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { message: 'Please provide a valid GSTIN' })
  gstin?: string;
}
