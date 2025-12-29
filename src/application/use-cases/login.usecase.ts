import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaUserRepository } from '../../infrastructure/prisma/prisma-user.repository.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(PrismaUserRepository)
    private readonly usersRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: { email: string; password: string }) {
    const user = await this.usersRepository.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    return {
      accessToken: token,
    };
  }
}
