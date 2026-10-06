import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CashRegisterService } from './cash-register.service';
import { OpenSessionDto, CloseSessionDto, CreateMovementDto, CreateRegisterDto } from './dto/cash-register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cash')
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @Get('registers')
  listRegisters() {
    return this.cashRegisterService.listRegisters();
  }

  @Post('registers')
  createRegister(@Body() data: CreateRegisterDto) {
    return this.cashRegisterService.createRegister(data);
  }

  @Get('sessions/current')
  getCurrentSession(@Request() req: any) {
    return this.cashRegisterService.getCurrentSession(req.user.id);
  }

  @Get('sessions')
  listSessions(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.cashRegisterService.listSessions(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string) {
    return this.cashRegisterService.getSession(id);
  }

  @Post('sessions/open')
  openSession(@Request() req: any, @Body() data: OpenSessionDto) {
    return this.cashRegisterService.openSession(req.user.id, data);
  }

  @Post('sessions/close')
  closeSession(@Request() req: any, @Body() data: CloseSessionDto) {
    return this.cashRegisterService.closeSession(req.user.id, data);
  }

  @Post('movements')
  createMovement(@Body() data: CreateMovementDto) {
    return this.cashRegisterService.createMovement(data);
  }
}
