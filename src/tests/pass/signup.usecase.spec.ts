// src/tests/signup.usecase.spec.ts

import { SignupUseCase } from '../../application/use-cases/signup.usecase';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Role } from '../../domain/enums/role.enum';
import { ConflictException, BadRequestException } from '@nestjs/common';

// Mock manual do bcrypt no topo do arquivo
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password-from-mock'),
}));

// Importe APÓS o mock
import * as bcrypt from 'bcrypt';

describe('SignupUseCase', () => {
  let signupUseCase: SignupUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  // Cast do mock para acessar as funções
  const bcryptHashMock = bcrypt.hash as jest.Mock;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as any;

    signupUseCase = new SignupUseCase(userRepository);

    // Limpa chamadas anteriores, mas mantém o mock
    bcryptHashMock.mockClear();
    bcryptHashMock.mockResolvedValue('hashed-password-from-mock');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create a customer user without explicit role', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await signupUseCase.execute({
      email: '  NewUser@Coffee.com  ',
      password: 'strongPass123',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'newuser@coffee.com',
    );
    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'newuser@coffee.com',
      passwordHash: 'hashed-password-from-mock',
      role: Role.CUSTOMER,
    });
    expect(bcryptHashMock).toHaveBeenCalledWith('strongPass123', 10);
  });

  it('should successfully create a customer user with explicit CUSTOMER role', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await signupUseCase.execute({
      email: 'customer@coffee.com',
      password: 'pass123',
      role: 'Customer',
    });

    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'customer@coffee.com',
      passwordHash: 'hashed-password-from-mock',
      role: Role.CUSTOMER,
    });
  });

  it('should throw ConflictException when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing-id' } as any);

    await expect(
      signupUseCase.execute({
        email: 'Existing@Coffee.com',
        password: 'any',
      }),
    ).rejects.toThrow(ConflictException);

    await expect(
      signupUseCase.execute({
        email: 'Existing@Coffee.com',
        password: 'any',
      }),
    ).rejects.toThrow('Email already in use');

    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when role is invalid (not in enum)', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      signupUseCase.execute({
        email: 'test@coffee.com',
        password: 'pass123',
        role: 'SUPER_ADMIN',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('should accept valid roles from enum (including MANAGER)', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await signupUseCase.execute({
      email: 'manager@coffee.com',
      password: 'pass123',
      role: 'manager',
    });

    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'manager@coffee.com',
      passwordHash: 'hashed-password-from-mock',
      role: Role.MANAGER,
    });
  });

  it('should normalize email: trim and lowercase', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await signupUseCase.execute({
      email: '  MixedCase@Coffee.com  ',
      password: 'pass123',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'mixedcase@coffee.com',
    );
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'mixedcase@coffee.com',
      }),
    );
  });

  it('should call bcrypt.hash with password and salt rounds 10', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await signupUseCase.execute({
      email: 'test@coffee.com',
      password: 'mypassword',
    });

    expect(bcryptHashMock).toHaveBeenCalledWith('mypassword', 10);
  });
});
