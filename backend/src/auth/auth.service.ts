import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthUserResponse } from './types/auth-user-response.type';
import { JwtPayload } from './types/jwt-payload.type';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthUserResponse> {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name?.trim() ? dto.name.trim() : null;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.usersService.createUser({
        email,
        password: passwordHash,
        name,
      });

      return this.toAuthUserResponse(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already in use.');
      }

      throw new InternalServerErrorException('Unable to register user.');
    }
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }

  async me(payload: JwtPayload): Promise<AuthUserResponse> {
    const user = await this.usersService.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return this.toAuthUserResponse(user);
  }

  private toAuthUserResponse(user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
