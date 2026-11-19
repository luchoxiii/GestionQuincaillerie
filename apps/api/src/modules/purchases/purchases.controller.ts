import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Purchases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get('orders')
  @RequirePermissions('purchases.view')
  getOrders(@Query() query: any) {
    return this.purchasesService.getOrders(query);
  }

  @Post('orders')
  @RequirePermissions('purchases.create')
  createOrder(@Body() data: any) {
    return this.purchasesService.createOrder(data);
  }

  @Put('orders/:id/status')
  @RequirePermissions('purchases.create')
  updateOrderStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.purchasesService.updateOrderStatus(id, status);
  }

  @Get()
  @RequirePermissions('purchases.view')
  getPurchases(@Query() query: any) {
    return this.purchasesService.getPurchases(query);
  }

  @Get(':id')
  @RequirePermissions('purchases.view')
  getPurchaseById(@Param('id') id: string) {
    return this.purchasesService.getPurchaseById(id);
  }

  @Post()
  @RequirePermissions('purchases.create')
  createPurchase(@Body() data: any, @CurrentUser() user?: any) {
    return this.purchasesService.createPurchase({
      ...data,
      userId: user?.id || data.userId,
    });
  }
}
