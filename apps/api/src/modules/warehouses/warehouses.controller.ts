import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Warehouses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @RequirePermissions('inventory.view')
  findAll() {
    return this.warehousesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('inventory.view')
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(id);
  }

  @Post()
  @RequirePermissions('inventory.adjust')
  create(@Body() data: any) {
    return this.warehousesService.create(data);
  }

  @Put(':id')
  @RequirePermissions('inventory.adjust')
  update(@Param('id') id: string, @Body() data: any) {
    return this.warehousesService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('inventory.adjust')
  remove(@Param('id') id: string) {
    return this.warehousesService.remove(id);
  }
}
