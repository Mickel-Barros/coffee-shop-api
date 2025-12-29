// src/tests/login.usecase.spec.ts

import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Role } from '../../domain/enums/role.enum';
import * as bcrypt from 'bcrypt';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  // Objeto mock do usuário - o passwordHash será preenchido no beforeAll
  const mockUser = {
    id: 'user-123',
    email: 'john@coffee.com',
    name: 'John Coffee',
    passwordHash: '', // será sobrescrito com hash real
    role: Role.CUSTOMER,
  };

  // Calcula o hash de forma assíncrona antes de todos os testes
  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('correct-password', 10);
  });

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn(),
    } as any;

    loginUseCase = new LoginUseCase(userRepository, jwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully login and return access token', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    jwtService.sign.mockReturnValue('fake-jwt-token');

    const result = await loginUseCase.execute({
      email: 'john@coffee.com',
      password: 'correct-password',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('john@coffee.com');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-123',
      role: Role.CUSTOMER,
    });
    expect(result).toEqual({
      accessToken: 'fake-jwt-token',
    });
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      loginUseCase.execute({
        email: 'unknown@coffee.com',
        password: 'any-password',
      }),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      loginUseCase.execute({
        email: 'unknown@coffee.com',
        password: 'any-password',
      }),
    ).rejects.toThrow('Invalid credentials');

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'unknown@coffee.com',
    );
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when password is incorrect', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);

    await expect(
      loginUseCase.execute({
        email: 'john@coffee.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      loginUseCase.execute({
        email: 'john@coffee.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow('Invalid credentials');

    expect(userRepository.findByEmail).toHaveBeenCalledWith('john@coffee.com');
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should include role in JWT payload for different roles', async () => {
    const managerPasswordHash = await bcrypt.hash('manager-pass', 10);

    const managerUser = {
      ...mockUser,
      id: 'manager-456',
      email: 'manager@coffee.com',
      role: Role.MANAGER,
      passwordHash: managerPasswordHash,
    };

    userRepository.findByEmail.mockResolvedValue(managerUser);
    jwtService.sign.mockReturnValue('manager-token');

    await loginUseCase.execute({
      email: 'manager@coffee.com',
      password: 'manager-pass',
    });

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'manager-456',
      role: Role.MANAGER,
    });
  });
});
