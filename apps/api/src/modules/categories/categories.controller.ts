import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public() // Typically categories are public
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('tree')
  @Public()
  findTree() {
    return this.categoriesService.findTree();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @RequirePermissions('products.create')
  create(@Body() data: any) {
    return this.categoriesService.create(data);
  }

  @Put(':id')
  @RequirePermissions('products.edit')
  update(@Param('id') id: string, @Body() data: any) {
    return this.categoriesService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('products.delete')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
