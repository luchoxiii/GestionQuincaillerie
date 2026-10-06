import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Purchases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get('orders')
  getOrders(@Query() query: any) {
    return this.purchasesService.getOrders(query);
  }

  @Post('orders')
  createOrder(@Body() data: any) {
    return this.purchasesService.createOrder(data);
  }

  @Put('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.purchasesService.updateOrderStatus(id, status);
  }

  @Get()
  getPurchases(@Query() query: any) {
    return this.purchasesService.getPurchases(query);
  }

  @Get(':id')
  getPurchaseById(@Param('id') id: string) {
    return this.purchasesService.getPurchaseById(id);
  }

  @Post()
  createPurchase(@Body() data: any) {
    return this.purchasesService.createPurchase(data);
  }
}
