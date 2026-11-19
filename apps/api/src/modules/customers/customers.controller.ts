import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerQueryDto,
  PaymentDto,
  AccountMovementsQueryDto,
} from './dto/customer.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @RequirePermissions('customers.create')
  @ApiOperation({ summary: 'Create a new customer' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @RequirePermissions('customers.view')
  @ApiOperation({ summary: 'Get all customers with pagination and filtering' })
  findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get('debtors')
  @RequirePermissions('customers.view')
  @ApiOperation({ summary: 'Get customers with positive balance' })
  getDebtors() {
    return this.customersService.getDebtors();
  }

  @Get(':id')
  @RequirePermissions('customers.view')
  @ApiOperation({ summary: 'Get a customer by ID with recent activity' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('customers.edit')
  @ApiOperation({ summary: 'Update a customer' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @RequirePermissions('customers.edit')
  @ApiOperation({ summary: 'Soft delete a customer' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }

  @Get(':id/account')
  @RequirePermissions('customers.view')
  @ApiOperation({ summary: 'Get customer account movements history' })
  getAccountMovements(
    @Param('id') id: string,
    @Query() query: AccountMovementsQueryDto,
  ) {
    return this.customersService.getAccountMovements(id, query);
  }

  @Post(':id/payments')
  @RequirePermissions('customers.payments')
  @ApiOperation({ summary: 'Register a payment for a customer' })
  createPayment(
    @Param('id') id: string,
    @Body() paymentDto: PaymentDto,
    @CurrentUser() user: any,
  ) {
    const userId = user?.id;
    return this.customersService.createPayment(id, userId, paymentDto);
  }
}
