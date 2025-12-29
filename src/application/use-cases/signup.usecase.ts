import {
  Injectable,
  ConflictException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { Role } from '../../domain/enums/role.enum.js';
import { PrismaUserRepository } from '../../infrastructure/prisma/prisma-user.repository.js';

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject(PrismaUserRepository)
    private readonly usersRepository: UserRepository,
  ) {}

  private readonly ALLOWED_SIGNUP_ROLES = [Role.CUSTOMER];
  async execute(input: { email: string; password: string; role?: string }) {
    const email = input.email.toLowerCase().trim();

    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const role = input.role
      ? (input.role.toLowerCase() as Role)
      : Role.CUSTOMER;

    if (!Object.values(Role).includes(role)) {
      throw new BadRequestException('Invalid role value');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    await this.usersRepository.create({
      email,
      passwordHash,
      role,
    });
  }
}
