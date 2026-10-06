import { Module } from '@nestjs/common';
import { InvoicingController } from './invoicing.controller';
import { InvoicingService } from './invoicing.service';
import { AfipService } from './afip.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InvoicingController],
  providers: [InvoicingService, AfipService],
  exports: [InvoicingService, AfipService],
})
export class InvoicingModule {}
