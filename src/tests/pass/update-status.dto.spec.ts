import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateStatusDto } from '../../infrastructure/http/dtos/update-status.dto';
import { OrderStatus } from '../../domain/enums/order-status.enum';

describe('UpdateStatusDto validation', () => {
  const validStatuses = Object.values(OrderStatus);

  it('should pass validation with a valid status', async () => {
    for (const status of validStatuses) {
      const dto = plainToInstance(UpdateStatusDto, { status });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.status).toBe(status);
    }
  });

  it('should fail when status is missing', async () => {
    const dto = plainToInstance(UpdateStatusDto, {});

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);

    const error = errors[0];
    expect(error.property).toBe('status');
    expect(error.constraints).toHaveProperty(
      'isEnum',
      `Status must be one of: ${validStatuses.join(', ')}`,
    );
  });

  it('should fail when status is null or undefined', async () => {
    const payload1 = { status: null };
    const payload2 = { status: undefined };

    for (const payload of [payload1, payload2]) {
      const dto = plainToInstance(UpdateStatusDto, payload);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      const error = errors[0];
      expect(error.property).toBe('status');
      expect(error.constraints?.isEnum).toContain('Status must be one of:');
    }
  });

  it('should fail when status is an invalid enum value', async () => {
    const invalidValues = ['INVALID', 'pending', 123, true, {}, []];

    for (const invalid of invalidValues) {
      const dto = plainToInstance(UpdateStatusDto, { status: invalid });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);

      const error = errors[0];
      expect(error.property).toBe('status');
      expect(error.constraints?.isEnum).toBe(
        `Status must be one of: ${validStatuses.join(', ')}`,
      );
    }
  });

  it('should fail when status is a string that looks similar but is not exact match', async () => {
    // Exemplo: se o enum tem 'PREPARATION', testar 'preparation' (case sensitive)
    const caseVariants = validStatuses.map((s: string) => s.toLowerCase());

    for (const variant of caseVariants) {
      if (variant.toUpperCase() === variant) continue; // pula se for tudo maiúsculo já

      const dto = plainToInstance(UpdateStatusDto, { status: variant });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isEnum).toContain('Status must be one of:');
    }
  });
});
