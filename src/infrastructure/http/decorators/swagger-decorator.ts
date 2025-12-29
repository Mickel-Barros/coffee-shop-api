import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiAuthResponses() {
  return applyDecorators(
    ApiBearerAuth('jwt'),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
