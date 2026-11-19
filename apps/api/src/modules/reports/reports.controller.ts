import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @RequirePermissions('reports.sales')
  getSalesReport(@Query() query: any) {
    return this.reportsService.getSalesReport(query);
  }

  @Get('top-products')
  @RequirePermissions('reports.sales')
  getTopProducts(@Query() query: any) {
    return this.reportsService.getTopProducts(query);
  }

  @Get('profitability')
  @RequirePermissions('reports.financial')
  getProfitability(@Query() query: any) {
    return this.reportsService.getProfitability(query);
  }

  @Get('iva-ventas')
  @RequirePermissions('reports.fiscal')
  getIvaVentas(@Query() query: any) {
    return this.reportsService.getIvaVentas(query);
  }

  @Get('iva-compras')
  @RequirePermissions('reports.fiscal')
  getIvaCompras(@Query() query: any) {
    return this.reportsService.getIvaCompras(query);
  }

  @Get('inventory-valuation')
  @RequirePermissions('reports.inventory')
  getInventoryValuation() {
    return this.reportsService.getInventoryValuation();
  }
}
