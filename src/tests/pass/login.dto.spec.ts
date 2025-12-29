import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '../../infrastructure/http/dtos/login.dto';

describe('LoginDto validation', () => {
  it('should pass validation with valid email and password', async () => {
    const payload = {
      email: 'customer@coffee.com',
      password: 'secure123',
    };

    const dto = plainToInstance(LoginDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail when email is missing', async () => {
    const payload = {
      password: 'secure123',
    };

    const dto = plainToInstance(LoginDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    const error = errors[0];
    expect(error.property).toBe('email');
    expect(error.constraints).toHaveProperty('isNotEmpty', 'Email is required');
  });

  it('should fail when email is empty string', async () => {
    const payload = {
      email: '',
      password: 'secure123',
    };

    const dto = plainToInstance(LoginDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    const error = errors[0];
    expect(error.property).toBe('email');
    expect(error.constraints).toHaveProperty('isNotEmpty', 'Email is required');
    expect(error.constraints).toHaveProperty(
      'isEmail',
      'Please provide a valid email',
    );
  });

  it('should fail when email is invalid format', async () => {
    const payload = {
      email: 'invalid-email',
      password: 'secure123',
    };

    const dto = plainToInstance(LoginDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    const error = errors[0];
    expect(error.property).toBe('email');
    expect(error.constraints).toHaveProperty(
      'isEmail',
      'Please provide a valid email',
    );
  });

  it('should fail when password is missing', async () => {
    const payload = {
      email: 'customer@coffee.com',
    };

    const dto = plainToInstance(LoginDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    const error = errors[0];
    expect(error.property).toBe('password');
    expect(error.constraints).toHaveProperty(
      'isNotEmpty',
      'Password is required',
    );
  });

  it('should fail when password is empty string', async () => {
    const payload = {
      email: 'customer@coffee.com',
      password: '',
    };

    const dto = plainToInstance(LoginDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    const error = errors[0];
    expect(error.property).toBe('password');
    expect(error.constraints).toHaveProperty(
      'isNotEmpty',
      'Password is required',
    );
  });

  it('should fail when password is too short (less than 6 characters)', async () => {
    const payload = {
      email: 'customer@coffee.com',
      password: '12345',
    };

    const dto = plainToInstance(LoginDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    const error = errors[0];
    expect(error.property).toBe('password');
    expect(error.constraints).toHaveProperty(
      'minLength',
      'Password must be at least 6 characters long',
    );
  });

  it('should fail with multiple errors when both fields are invalid', async () => {
    const payload = {
      email: 'not-an-email',
      password: '123',
    };

    const dto = plainToInstance(LoginDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(2);

    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
    expect(emailError?.constraints).toHaveProperty(
      'isEmail',
      'Please provide a valid email',
    );

    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError).toBeDefined();
    expect(passwordError?.constraints).toHaveProperty(
      'minLength',
      'Password must be at least 6 characters long',
    );
  });
});
