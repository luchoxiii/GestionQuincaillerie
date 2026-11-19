import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalePaymentDto {
  @IsUUID()
  methodId!: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount!: number;

  @IsString()
  @IsOptional()
  reference?: string;
}

export class CreateSaleItemDto {
  @IsUUID()
  productId!: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  discount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  taxRate?: number;
}

export class CreateSaleDto {
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  warehouseId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalePaymentDto)
  payments!: CreateSalePaymentDto[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  cashSessionId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  discount?: number;

  @IsString()
  @IsOptional()
  fiscalType?: string;

  @IsString()
  @IsOptional()
  couponCode?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  subtotal?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  taxAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  total?: number;
}
