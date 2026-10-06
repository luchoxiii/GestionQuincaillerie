import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sales.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('payment-methods')
  getPaymentMethods() {
    return this.salesService.getPaymentMethods();
  }

  @Get()
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
  getSale(@Param('id') id: string) {
    return this.salesService.getSale(id);
  }

  @Post()
  createSale(@Request() req: any, @Body() data: CreateSaleDto) {
    return this.salesService.createSale(req.user.id, data);
  }

  @Post(':id/void')
  voidSale(@Request() req: any, @Param('id') id: string) {
    return this.salesService.voidSale(id, req.user.id);
  }
}
