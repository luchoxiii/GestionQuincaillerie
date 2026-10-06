import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermissions('products.view')
  findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Get('low-stock')
  @RequirePermissions('products.view')
  findLowStock() {
    return this.productsService.findLowStock();
  }

  @Get('brands')
  @RequirePermissions('products.view')
  findAllBrands() {
    return this.productsService.findAllBrands();
  }

  @Get('units')
  @RequirePermissions('products.view')
  findAllUnits() {
    return this.productsService.findAllUnits();
  }

  @Get('taxes')
  @RequirePermissions('products.view')
  findAllTaxes() {
    return this.productsService.findAllTaxes();
  }

  @Get('barcode/:code')
  @RequirePermissions('products.view')
  findByBarcode(@Param('code') code: string) {
    return this.productsService.findByBarcode(code);
  }

  @Get(':id')
  @RequirePermissions('products.view')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/stock-movements')
  @RequirePermissions('products.view')
  getStockMovements(@Param('id') id: string, @Query() query: any) {
    return this.productsService.getStockMovements(id, query);
  }

  @Get(':id/price-history')
  @RequirePermissions('products.view')
  getPriceHistory(@Param('id') id: string) {
    return this.productsService.getPriceHistory(id);
  }

  @Post('mass-price-update')
  @RequirePermissions('products.edit')
  massPriceUpdate(@Body() data: any) {
    return this.productsService.massPriceUpdate(data);
  }

  @Get('export')
  @RequirePermissions('products.view')
  exportProducts() {
    return this.productsService.exportProducts();
  }

  @Post('import')
  @RequirePermissions('products.create')
  importProducts(@Body() products: any[]) {
    return this.productsService.importProducts(products);
  }

  @Post()
  @RequirePermissions('products.create')
  create(@Body() data: any) {
    return this.productsService.create(data);
  }

  @Put(':id')
  @RequirePermissions('products.edit')
  update(@Param('id') id: string, @Body() data: any) {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('products.delete')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

