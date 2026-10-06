import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalePaymentDto {
  @IsUUID()
  methodId!: string;

  @IsNumber()
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
  @Type(() => Number)
  quantity!: number;
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
}
