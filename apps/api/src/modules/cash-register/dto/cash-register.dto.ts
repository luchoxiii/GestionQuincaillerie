import { IsString, IsNumber, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { CashMovementType } from '@prisma/client';

export class OpenSessionDto {
  @IsUUID()
  registerId!: string;

  @IsNumber()
  @Type(() => Number)
  openingBalance!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CloseSessionDto {
  @IsUUID()
  sessionId!: string;

  @IsNumber()
  @Type(() => Number)
  closingBalance!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateMovementDto {
  @IsUUID()
  sessionId!: string;

  @IsEnum(CashMovementType)
  type!: CashMovementType;

  @IsNumber()
  @Type(() => Number)
  amount!: number;

  @IsString()
  description!: string;

  @IsUUID()
  @IsOptional()
  methodId?: string;
}

export class CreateRegisterDto {
  @IsString()
  name!: string;
}
