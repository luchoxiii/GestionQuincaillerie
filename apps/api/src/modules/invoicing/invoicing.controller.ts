import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InvoicingService } from './invoicing.service';
import { CreateDirectInvoiceDto, CreateCreditNoteDto } from './dto/invoicing.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('invoicing')
export class InvoicingController {
  constructor(private readonly invoicingService: InvoicingService) {}

  @Get('summary')
  getFiscalSummary(
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    return this.invoicingService.getFiscalSummary(
      month ? parseInt(month, 10) : undefined,
      year ? parseInt(year, 10) : undefined
    );
  }

  @Get('sale-points')
  getSalePoints() {
    return this.invoicingService.getSalePoints();
  }

  @Get('types')
  getInvoiceTypes() {
    return this.invoicingService.getInvoiceTypes();
  }

  @Get()
  findAll(@Query() query: any) {
    return this.invoicingService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicingService.findOne(id);
  }

  @Post('from-sale/:saleId')
  createFromSale(
    @Param('saleId') saleId: string,
    @Body('salePointId') salePointId?: string
  ) {
    return this.invoicingService.createFromSale(saleId, { salePointId });
  }

  @Post('direct')
  createDirectInvoice(@Body() data: CreateDirectInvoiceDto) {
    return this.invoicingService.createDirectInvoice(data);
  }

  @Post(':id/credit-note')
  createCreditNote(
    @Param('id') id: string,
    @Body() data: CreateCreditNoteDto
  ) {
    return this.invoicingService.createCreditNote(id, data.reason);
  }
}
