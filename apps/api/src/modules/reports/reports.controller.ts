import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  getSalesReport(@Query() query: any) {
    return this.reportsService.getSalesReport(query);
  }

  @Get('top-products')
  getTopProducts(@Query() query: any) {
    return this.reportsService.getTopProducts(query);
  }

  @Get('profitability')
  getProfitability(@Query() query: any) {
    return this.reportsService.getProfitability(query);
  }

  @Get('iva-ventas')
  getIvaVentas(@Query() query: any) {
    return this.reportsService.getIvaVentas(query);
  }

  @Get('iva-compras')
  getIvaCompras(@Query() query: any) {
    return this.reportsService.getIvaCompras(query);
  }

  @Get('inventory-valuation')
  getInventoryValuation() {
    return this.reportsService.getInventoryValuation();
  }
}
