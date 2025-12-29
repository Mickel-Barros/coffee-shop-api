import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationDto } from '../infrastructure/http/dtos/pagination.dto';

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

  // CORRIGIDO: com o ||, page=0 vira 1 → válido → não gera erro
  it('should fallback to default when page is less than 1', async () => {
    const dto = plainToInstance(PaginationDto, { page: 0 });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0); // ← agora espera 0 erros

    expect(dto.page).toBe(1); // fallback para default
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

  // CORRIGIDO: limit=101 vira 100 pelo Math.min → válido
  it('should cap limit at 100 when greater than 100', async () => {
    const dto = plainToInstance(PaginationDto, { limit: 101 });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0); // ← válido após o Math.min

    expect(dto.limit).toBe(100);
  });

  // CORRIGIDO: limit=0 vira 10 → válido
  it('should fallback to default when limit is less than 1', async () => {
    const dto = plainToInstance(PaginationDto, { limit: 0 });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);

    expect(dto.limit).toBe(10);
  });

  // CORRIGIDO: valores inválidos viram defaults → válido
  it('should fallback to defaults when values are not valid numbers', async () => {
    const dto = plainToInstance(PaginationDto, {
      page: 'not-a-number',
      limit: 'abc',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0); // ← agora espera 0 erros

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('should accept page=1 and limit=100 as maximum valid values', async () => {
    const dto = plainToInstance(PaginationDto, {
      page: 1,
      limit: 100,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(100);
  });
});
