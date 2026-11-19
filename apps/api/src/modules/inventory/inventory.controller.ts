import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock')
  @RequirePermissions('inventory.view')
  getStock(@Query('lowStock') lowStock?: string, @Query('warehouseId') warehouseId?: string) {
    const isLowStock = lowStock === 'true';
    return this.inventoryService.getStock(isLowStock, warehouseId);
  }

  @Get('movements')
  @RequirePermissions('inventory.view')
  getMovements(@Query() query: any) {
    return this.inventoryService.getMovements(query);
  }

  @Post('adjust')
  @RequirePermissions('inventory.adjust')
  adjustStock(@Body() data: any, @CurrentUser() user?: any) {
    return this.inventoryService.adjustStock({
      ...data,
      userId: user?.id || data.userId,
    });
  }

  @Get('transfers')
  @RequirePermissions('inventory.view')
  getTransfers() {
    return this.inventoryService.getTransfers();
  }

  @Post('transfers')
  @RequirePermissions('inventory.transfer')
  createTransfer(@Body() data: any, @CurrentUser() user?: any) {
    return this.inventoryService.createTransfer({
      ...data,
      createdById: user?.id || data.createdById,
    });
  }

  @Get('counts')
  @RequirePermissions('inventory.view')
  getCounts() {
    return this.inventoryService.getCounts();
  }

  @Post('counts')
  @RequirePermissions('inventory.count')
  createCount(@Body() data: { warehouseId: string, userId?: string, productIds?: string[] }, @CurrentUser() user?: any) {
    return this.inventoryService.createCount({
      ...data,
      userId: user?.id || data.userId,
    });
  }

  @Put('counts/:id')
  @RequirePermissions('inventory.count')
  updateCountItem(@Param('id') id: string, @Body() data: { productId: string, countedQty: number }) {
    return this.inventoryService.updateCountItem(id, data);
  }

  @Post('counts/:id/apply')
  @RequirePermissions('inventory.count')
  applyCount(@Param('id') id: string, @Body('userId') userId?: string, @CurrentUser() user?: any) {
    return this.inventoryService.applyCount(id, user?.id || userId);
  }
}
