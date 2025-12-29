import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { User } from '../../domain/entities/user.entity.js';
import { Role } from '../../domain/enums/role.enum.js';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return new User(user.id, user.email, user.passwordHash, user.role as Role);
  }

  async create(input: { email: string; passwordHash: string; role: Role }) {
    await this.prisma.user.create({
      data: input,
    });
  }
}
