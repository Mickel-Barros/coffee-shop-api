import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationDto } from '../../infrastructure/http/dtos/pagination.dto';

describe('PaginationDto validation', () => {
  it('should use default values when no params are provided', async () => {
    const dto = plainToInstance(PaginationDto, {});

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('should accept valid page and limit', async () => {
    const dto = plainToInstance(PaginationDto, {
      page: 5,
      limit: 25,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);

    expect(dto.page).toBe(5);
    expect(dto.limit).toBe(25);
  });

  it('should transform string numbers to actual numbers', async () => {
    const dto = plainToInstance(PaginationDto, {
      page: '3',
      limit: '40',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);

    expect(dto.page).toBe(3);
    expect(typeof dto.page).toBe('number');

    expect(dto.limit).toBe(40);
    expect(typeof dto.limit).toBe('number');
  });

  it('should fail when page is less than 1', async () => {
    const dto = plainToInstance(PaginationDto, { page: 0 });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);

    const error = errors[0];
    expect(error.property).toBe('page');
    expect(error.constraints).toHaveProperty(
      'min',
      'page must not be less than 1',
    );
  });

  it('should fail when page is not an integer', async () => {
    const dto = plainToInstance(PaginationDto, { page: 1.5 });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);

    const error = errors[0];
    expect(error.property).toBe('page');
    expect(error.constraints).toHaveProperty(
      'isInt',
      'page must be an integer number',
    );
  });

  it('should fail when limit is greater than 50', async () => {
    const dto = plainToInstance(PaginationDto, { limit: 51 });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);

    const error = errors[0];
    expect(error.property).toBe('limit');
    expect(error.constraints).toHaveProperty(
      'max',
      'limit must not be greater than 50',
    );
  });

  it('should fail when limit is less than 1', async () => {
    const dto = plainToInstance(PaginationDto, { limit: 0 });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);

    const error = errors[0];
    expect(error.property).toBe('limit');
    expect(error.constraints).toHaveProperty(
      'min',
      'limit must not be less than 1',
    );
  });

  it('should fail when values are not numbers (even after transformation)', async () => {
    const dto = plainToInstance(PaginationDto, {
      page: 'not-a-number',
      limit: 'abc',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(2);

    const pageError = errors.find((e) => e.property === 'page');
    expect(pageError?.constraints).toHaveProperty('isInt');

    const limitError = errors.find((e) => e.property === 'limit');
    expect(limitError?.constraints).toHaveProperty('isInt');
  });

  it('should accept page=1 and limit=50 as maximum valid values', async () => {
    const dto = plainToInstance(PaginationDto, {
      page: 1,
      limit: 50,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(50);
  });
});
