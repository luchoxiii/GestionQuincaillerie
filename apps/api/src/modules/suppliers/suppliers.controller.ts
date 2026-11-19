import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @RequirePermissions('suppliers.view')
  findAll(@Query() query: any) {
    return this.suppliersService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('suppliers.view')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @RequirePermissions('suppliers.create')
  create(@Body() data: any) {
    return this.suppliersService.create(data);
  }

  @Put(':id')
  @RequirePermissions('suppliers.edit')
  update(@Param('id') id: string, @Body() data: any) {
    return this.suppliersService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('suppliers.edit')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }

  @Get(':id/account')
  @RequirePermissions('suppliers.view')
  getAccountMoves(@Param('id') id: string) {
    return this.suppliersService.getAccountMoves(id);
  }

  @Post(':id/payments')
  @RequirePermissions('suppliers.payments')
  createPayment(@Param('id') id: string, @Body() data: any) {
    return this.suppliersService.createPayment(id, data);
  }
}
