import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsUUID, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '@prisma/client';

export class InvoiceItemDto {
  @IsUUID()
  productId!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  discount?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxRate!: number;
}

export class CreateDirectInvoiceDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  salePointId!: string;

  @IsUUID()
  invoiceTypeId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];
}

export class CreateCreditNoteDto {
  @IsString()
  reason!: string;
}
