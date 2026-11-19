import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sales.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('payment-methods')
  @RequirePermissions('sales.view')
  getPaymentMethods() {
    return this.salesService.getPaymentMethods();
  }

  @Get()
  @RequirePermissions('sales.view')
  listSales(
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.salesService.listSales(
      { customerId, status },
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  @Get(':id')
  @RequirePermissions('sales.view')
  getSale(@Param('id') id: string) {
    return this.salesService.getSale(id);
  }

  @Post()
  @RequirePermissions('pos.create_sale')
  createSale(@Request() req: any, @Body() data: CreateSaleDto) {
    return this.salesService.createSale(req.user.id, data);
  }

  @Post(':id/void')
  @RequirePermissions('pos.void_sale')
  voidSale(@Request() req: any, @Param('id') id: string) {
    return this.salesService.voidSale(id, req.user.id);
  }
}
