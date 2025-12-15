import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { GoogleSignInDto } from './dto/google-signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company,
      },
    };
  }

  async signup(signupDto: SignupDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Check if company already exists
    const existingCompany = await this.prisma.company.findUnique({
      where: { email: signupDto.companyEmail },
    });

    if (existingCompany) {
      throw new ConflictException('Company already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    // Create company and user in transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      const company = await prisma.company.create({
        data: {
          name: signupDto.companyName,
          email: signupDto.companyEmail,
          phone: signupDto.companyPhone,
          gstin: signupDto.gstin || null,
        },
      });

      const user = await prisma.user.create({
        data: {
          email: signupDto.email,
          password: hashedPassword,
          firstName: signupDto.firstName,
          lastName: signupDto.lastName,
          phone: signupDto.phone,
          role: 'OWNER',
          companyId: company.id,
        },
        include: { company: true },
      });

      return { user, company };
    });

    const payload = {
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
      companyId: result.user.companyId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        company: result.user.company,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      return null;
    }

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async googleSignIn(googleSignInDto: GoogleSignInDto) {
    // Check if user exists with this Google ID or email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: googleSignInDto.email }, { googleId: googleSignInDto.googleId }],
      },
      include: { company: true },
    });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleSignInDto.googleId },
          include: { company: true },
        });
      }
    } else {
      // Create new user and company
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create company
        const company = await prisma.company.create({
          data: {
            name: `${googleSignInDto.firstName}'s Company`,
            email: googleSignInDto.email,
            phone: '', // Optional for Google sign-in
            isActive: true,
          },
        });

        // Create user with random password (won't be used for Google auth)
        const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
        const newUser = await prisma.user.create({
          data: {
            email: googleSignInDto.email,
            password: randomPassword,
            firstName: googleSignInDto.firstName,
            lastName: googleSignInDto.lastName || '',
            googleId: googleSignInDto.googleId,
            role: 'OWNER',
            companyId: company.id,
            isActive: true,
          },
          include: { company: true },
        });

        return newUser;
      });

      user = result;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company,
      },
    };
  }
}
