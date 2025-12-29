import { Transform } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => Number(value) || 1)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => Math.min(Number(value) || 10, 100))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
