import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SignupDto } from '../infrastructure/http/dtos/signup.dto';
import { Role } from '../domain/enums/role.enum';

describe('SignupDto validation', () => {
  const validPayload = {
    email: 'customer@coffee.com',
    name: 'John Coffee',
    password: 'strongPassword123',
    role: Role.CUSTOMER,
  };

  it('should pass validation with valid required fields and no role', async () => {
    const dto = plainToInstance(SignupDto, validPayload);

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);

    expect(dto.role).toBe(Role.CUSTOMER);
  });

  it('should pass validation with valid role provided', async () => {
    const payloadWithManager = {
      ...validPayload,
      role: Role.MANAGER,
    };

    const dto = plainToInstance(SignupDto, payloadWithManager);

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.role).toBe(Role.MANAGER);
  });

  it('should fail when email is missing', async () => {
    const payload = { ...validPayload, email: undefined };

    const dto = plainToInstance(SignupDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);

    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
    expect(emailError?.constraints).toHaveProperty(
      'isEmail',
      'Invalid email address',
    );
  });

  it('should fail when email is invalid format', async () => {
    const payload = { ...validPayload, email: 'invalid-email' };

    const dto = plainToInstance(SignupDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);

    const error = errors[0];
    expect(error.property).toBe('email');
    expect(error.constraints).toHaveProperty(
      'isEmail',
      'Invalid email address',
    );
  });

  it('should fail when name is missing', async () => {
    const payload = { ...validPayload, name: undefined };

    const dto = plainToInstance(SignupDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);

    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError?.constraints).toHaveProperty(
      'isString',
      'Name must be a string',
    );
  });

  it('should fail when name is too short', async () => {
    const payload = { ...validPayload, name: 'Ab' };

    const dto = plainToInstance(SignupDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);

    const error = errors[0];
    expect(error.property).toBe('name');
    expect(error.constraints).toHaveProperty(
      'minLength',
      'Name must have at least 3 characters',
    );
  });

  it('should fail when password is missing', async () => {
    const payload = { ...validPayload, password: undefined };

    const dto = plainToInstance(SignupDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);

    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError?.constraints).toHaveProperty(
      'isString',
      'Password must be a string',
    );
  });

  it('should fail when password is too short', async () => {
    const payload = { ...validPayload, password: '12345' };

    const dto = plainToInstance(SignupDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1); // só password (role válido)

    const error = errors[0];
    expect(error.property).toBe('password');
    expect(error.constraints).toHaveProperty(
      'minLength',
      'Password must have at least 6 characters',
    );
  });

  it('should fail when role is invalid enum value', async () => {
    const payload = { ...validPayload, role: 'INVALID_ROLE' };

    const dto = plainToInstance(SignupDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);

    const error = errors[0];
    expect(error.property).toBe('role');
    expect(error.constraints).toHaveProperty(
      'isEnum',
      `Role must be one of: ${Object.values(Role).join(', ')}`,
    );
  });

  it('should fail with multiple errors when several fields are invalid', async () => {
    const payload = {
      email: 'not-an-email',
      name: 'A',
      password: '123',
      role: 999,
    };

    const dto = plainToInstance(SignupDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(4);

    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError?.constraints?.isEmail).toBe('Invalid email address');

    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError?.constraints?.minLength).toBe(
      'Name must have at least 3 characters',
    );

    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError?.constraints?.minLength).toBe(
      'Password must have at least 6 characters',
    );

    const roleError = errors.find((e) => e.property === 'role');
    expect(roleError?.constraints?.isEnum).toContain('Role must be one of:');
  });
});
