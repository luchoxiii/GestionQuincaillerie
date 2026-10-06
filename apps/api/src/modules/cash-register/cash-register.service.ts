import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenSessionDto, CloseSessionDto, CreateMovementDto, CreateRegisterDto } from './dto/cash-register.dto';
import { CashSessionStatus, CashMovementType } from '@prisma/client';

@Injectable()
export class CashRegisterService {
  constructor(private readonly prisma: PrismaService) {}

  async listRegisters() {
    return this.prisma.cashRegister.findMany({
      where: { isActive: true },
    });
  }

  async createRegister(data: CreateRegisterDto) {
    return this.prisma.cashRegister.create({
      data,
    });
  }

  async getCurrentSession(userId: string) {
    return this.prisma.cashSession.findFirst({
      where: {
        userId,
        status: CashSessionStatus.OPEN,
      },
      include: {
        register: true,
      }
    });
  }

  async openSession(userId: string, data: OpenSessionDto) {
    // Validate register exists
    const register = await this.prisma.cashRegister.findUnique({
      where: { id: data.registerId },
    });
    if (!register) throw new NotFoundException(`Caja no encontrada`);

    // Validate no open session exists for this register
    const existingSession = await this.prisma.cashSession.findFirst({
      where: { registerId: data.registerId, status: CashSessionStatus.OPEN },
    });
    if (existingSession) {
      throw new BadRequestException('La caja ya tiene una sesión abierta');
    }

    // Validate no open session exists for this user
    const existingUserSession = await this.prisma.cashSession.findFirst({
      where: { userId, status: CashSessionStatus.OPEN },
    });
    if (existingUserSession) {
      throw new BadRequestException('El usuario ya tiene una sesión abierta');
    }

    return this.prisma.$transaction(async (tx) => {
      const session = await tx.cashSession.create({
        data: {
          registerId: data.registerId,
          userId,
          status: CashSessionStatus.OPEN,
          openingBalance: data.openingBalance,
          notes: data.notes,
        },
      });

      await tx.cashMovement.create({
        data: {
          sessionId: session.id,
          type: CashMovementType.OPENING,
          amount: data.openingBalance,
          description: 'Apertura de caja',
        },
      });

      return session;
    });
  }

  async closeSession(userId: string, data: CloseSessionDto) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id: data.sessionId },
      include: { movements: true },
    });

    if (!session) throw new NotFoundException('Sesión no encontrada');
    if (session.status === CashSessionStatus.CLOSED) {
      throw new BadRequestException('La sesión ya está cerrada');
    }

    let inflows = 0;
    let outflows = 0;

    for (const mov of session.movements) {
      // Opening balance is already a movement, wait, the opening balance is added as a movement.
      // So if we just sum incomes and subtract expenses, we might double count if we add openingBalance.
      // Actually, opening balance movement shouldn't be double counted.
      const amount = Number(mov.amount);
      if (mov.type === CashMovementType.INCOME || mov.type === CashMovementType.SALE) {
        inflows += amount;
      } else if (mov.type === CashMovementType.EXPENSE || mov.type === CashMovementType.WITHDRAWAL || mov.type === CashMovementType.REFUND) {
        outflows += amount;
      }
    }

    const expectedBalance = Number(session.openingBalance) + inflows - outflows;
    const difference = data.closingBalance - expectedBalance;

    return this.prisma.cashSession.update({
      where: { id: data.sessionId },
      data: {
        status: CashSessionStatus.CLOSED,
        closedAt: new Date(),
        closingBalance: data.closingBalance,
        expectedBalance,
        difference,
        notes: data.notes ? (session.notes ? session.notes + '\\n' + data.notes : data.notes) : session.notes,
      },
    });
  }

  async getSession(id: string) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id },
      include: {
        movements: { orderBy: { createdAt: 'desc' } },
        sales: { include: { payments: true } },
        register: true,
        user: true,
      },
    });
    if (!session) throw new NotFoundException('Sesión no encontrada');
    return session;
  }

  async listSessions(skip: number = 0, take: number = 20) {
    return this.prisma.cashSession.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { register: true, user: { select: { firstName: true, lastName: true } } },
    });
  }

  async createMovement(data: CreateMovementDto) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id: data.sessionId },
    });
    if (!session) throw new NotFoundException('Sesión no encontrada');
    if (session.status !== CashSessionStatus.OPEN) {
      throw new BadRequestException('La sesión de caja está cerrada');
    }

    return this.prisma.cashMovement.create({
      data: {
        sessionId: data.sessionId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        methodId: data.methodId,
      },
    });
  }
}
