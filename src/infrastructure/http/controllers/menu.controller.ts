import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProduces,
} from '@nestjs/swagger';
import { MENU } from '../../../shared/catalog/menu.js';

/**
 * Menu Controller
 *
 * Public read-only endpoint.
 * No authentication or authorization required.
 *
 * The menu is served from an in-memory structure (MENU constant).
 * In a real production environment, this would typically come from a database or CMS.
 */
@ApiTags('menu')
@Controller('menu')
export class MenuController {
  @Get()
  @ApiOperation({
    summary: 'Get the full coffee shop menu',
    description:
      'Returns the complete menu organized by categories (hot drinks, food, etc.). This is a public endpoint — no authentication required.',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Menu successfully returned',
    schema: {
      example: {
        categories: [
          {
            name: 'Hot Drinks',
            items: [
              {
                id: 'espresso',
                name: 'Espresso',
                description: 'Strong and bold pure coffee',
                price: 8.5,
                available: true,
              },
              {
                id: 'cappuccino',
                name: 'Cappuccino',
                description: 'Espresso with steamed milk and foam',
                price: 12.9,
                available: true,
              },
            ],
          },
          {
            name: 'Pastries & Sweets',
            items: [
              {
                id: 'croissant',
                name: 'Croissant',
                description: 'Buttery, freshly baked layered pastry',
                price: 14.9,
                available: true,
              },
            ],
          },
        ],
      },
    },
  })
  findAll() {
    return MENU;
  }
}
