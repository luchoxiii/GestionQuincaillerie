import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock')
  getStock(@Query('lowStock') lowStock?: string, @Query('warehouseId') warehouseId?: string) {
    const isLowStock = lowStock === 'true';
    return this.inventoryService.getStock(isLowStock, warehouseId);
  }

  @Get('movements')
  getMovements(@Query() query: any) {
    return this.inventoryService.getMovements(query);
  }

  @Post('adjust')
  adjustStock(@Body() data: any) {
    return this.inventoryService.adjustStock(data);
  }

  @Get('transfers')
  getTransfers() {
    return this.inventoryService.getTransfers();
  }

  @Post('transfers')
  createTransfer(@Body() data: any) {
    return this.inventoryService.createTransfer(data);
  }

  @Get('counts')
  getCounts() {
    return this.inventoryService.getCounts();
  }

  @Post('counts')
  createCount(@Body() data: { warehouseId: string, userId: string, productIds?: string[] }) {
    return this.inventoryService.createCount(data);
  }

  @Put('counts/:id')
  updateCountItem(@Param('id') id: string, @Body() data: { productId: string, countedQty: number }) {
    return this.inventoryService.updateCountItem(id, data);
  }

  @Post('counts/:id/apply')
  applyCount(@Param('id') id: string, @Body('userId') userId: string) {
    return this.inventoryService.applyCount(id, userId);
  }
}
