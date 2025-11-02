import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserStatus, UserRole } from '../../database/entities';
import { RegisterDto, LoginDto } from './dto';
import { ProfilesService } from '../profiles/profiles.service';
import { CreateProfileDto } from '../profiles/dto/create-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private profilesService: ProfilesService, // nova dependência
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, role, first_name, last_name } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      role,
      first_name,
      last_name,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.usersRepository.save(user);

    // Only create profile for ESCORT users
    if (role === UserRole.ESCORT) {
      const display_name = first_name || email;
      await this.profilesService.createProfile(savedUser.id, { display_name } as CreateProfileDto);
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      savedUser.id,
      savedUser.email,
      savedUser.role,
    );

    return {
      user: this.sanitizeUser(savedUser),
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    // Update last login
    user.last_login = new Date();
    await this.usersRepository.save(user);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
      user.role,
    );

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(user.id, user.email, user.role);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: Number(process.env.JWT_EXPIRATION) || 3600,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: Number(process.env.JWT_REFRESH_EXPIRATION) || 604800,
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: UserEntity) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
