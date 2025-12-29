import { PrismaUserRepository } from '../infrastructure/prisma/prisma-user.repository';
import { Role } from '../domain/enums/role.enum';
import { User } from '../domain/entities/user.entity';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  const mockPrismaUser = {
    id: 'user-123',
    email: 'john@coffee.com',
    passwordHash: 'hashed-password-123',
    role: 'customer' as const,
  };

  beforeEach(() => {
    // Mock manual com jest.Mock para evitar problemas de tipagem do Prisma
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    repository = new PrismaUserRepository(prismaService as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return a User entity when user is found', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByEmail('john@coffee.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@coffee.com' },
      });

      expect(result).toBeInstanceOf(User);
      expect(result).toEqual({
        id: 'user-123',
        email: 'john@coffee.com',
        passwordHash: 'hashed-password-123',
        role: Role.CUSTOMER,
      });
    });

    it('should return null when user is not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('notfound@coffee.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'notfound@coffee.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a user with the provided data', async () => {
      prismaService.user.create.mockResolvedValue(undefined);

      const input = {
        email: 'newuser@coffee.com',
        passwordHash: 'new-hashed-password',
        role: Role.MANAGER,
      };

      await repository.create(input);

      expect(prismaService.user.create).toHaveBeenCalledTimes(1);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: input,
      });
    });

    it('should handle creation with customer role', async () => {
      prismaService.user.create.mockResolvedValue(undefined);

      await repository.create({
        email: 'customer@coffee.com',
        passwordHash: 'hash123',
        role: Role.CUSTOMER,
      });

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'customer@coffee.com',
          passwordHash: 'hash123',
          role: Role.CUSTOMER,
        },
      });
    });
  });
});
