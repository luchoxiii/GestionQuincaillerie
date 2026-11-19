import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CashRegisterService } from './cash-register.service';
import { OpenSessionDto, CloseSessionDto, CreateMovementDto, CreateRegisterDto } from './dto/cash-register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cash')
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @Get('registers')
  @RequirePermissions('cash.open')
  listRegisters() {
    return this.cashRegisterService.listRegisters();
  }

  @Post('registers')
  @RequirePermissions('settings.edit')
  createRegister(@Body() data: CreateRegisterDto) {
    return this.cashRegisterService.createRegister(data);
  }

  @Get('sessions/current')
  @RequirePermissions('cash.open')
  getCurrentSession(@Request() req: any) {
    return this.cashRegisterService.getCurrentSession(req.user.id);
  }

  @Get('sessions')
  @RequirePermissions('cash.view_all')
  listSessions(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.cashRegisterService.listSessions(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  @Get('sessions/:id')
  @RequirePermissions('cash.open')
  getSession(@Param('id') id: string) {
    return this.cashRegisterService.getSession(id);
  }

  @Post('sessions/open')
  @RequirePermissions('cash.open')
  openSession(@Request() req: any, @Body() data: OpenSessionDto) {
    return this.cashRegisterService.openSession(req.user.id, data);
  }

  @Post('sessions/close')
  @RequirePermissions('cash.close')
  closeSession(@Request() req: any, @Body() data: CloseSessionDto) {
    return this.cashRegisterService.closeSession(req.user.id, data, req.user);
  }

  @Post('movements')
  @RequirePermissions('cash.movement')
  createMovement(@Request() req: any, @Body() data: CreateMovementDto) {
    return this.cashRegisterService.createMovement(data, req.user);
  }
}
