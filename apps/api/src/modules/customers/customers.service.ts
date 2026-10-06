import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto, PaymentDto, AccountMovementsQueryDto } from './dto/customer.dto';
import { Prisma } from '@prisma/client';
import { extractSearchTokens, normalizeText, stemSpanishWord } from '@ferreteria/shared';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: CustomerQueryDto) {
    const { search, taxCondition, isActive, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
      where.isActive = true;
    }

    if (taxCondition) {
      where.taxCondition = taxCondition;
    }

    if (search) {
      const rawSearch = String(search).trim();
      const normSearch = normalizeText(rawSearch);

      // Debtor intent
      const isDebtorIntent = /(?:con\s+deuda|deudores|deudor|moroso|morosos|debe|saldo\s+pendiente)/i.test(normSearch);
      if (isDebtorIntent) {
        where.balance = { gt: 0 };
      }

      const isNoDebtIntent = /(?:sin\s+deuda|al\s+dia|saldo\s+cero)/i.test(normSearch);
      if (isNoDebtIntent) {
        where.balance = { lte: 0 };
      }

      // Clean intent phrases
      const cleaned = normSearch
        .replace(/(?:con\s+deuda|deudores|deudor|moroso|morosos|debe|saldo\s+pendiente)/gi, ' ')
        .replace(/(?:sin\s+deuda|al\s+dia|saldo\s+cero)/gi, ' ')
        .trim();

      const tokens = extractSearchTokens(cleaned);
      if (tokens.length > 0) {
        where.AND = tokens.map((token) => {
          const stem = stemSpanishWord(token);
          const conditions: Prisma.CustomerWhereInput[] = [
            { name: { contains: token, mode: 'insensitive' } },
            { documentNum: { contains: token, mode: 'insensitive' } },
            { phone: { contains: token, mode: 'insensitive' } },
            { email: { contains: token, mode: 'insensitive' } },
            { address: { contains: token, mode: 'insensitive' } },
            { city: { contains: token, mode: 'insensitive' } },
          ];
          if (stem !== token && stem.length > 2) {
            conditions.push({ name: { contains: stem, mode: 'insensitive' } });
          }
          return { OR: conditions };
        });
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    const mappedItems = items.map((customer) => {
      const creditLimit = customer.creditLimit ? Number(customer.creditLimit) : 0;
      const balance = Number(customer.balance);
      const availableCredit = creditLimit - balance;

      return {
        ...customer,
        creditLimit,
        balance,
        availableCredit,
      };
    });

    return {
      data: mappedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDebtors() {
    const items = await this.prisma.customer.findMany({
      where: {
        balance: { gt: 0 },
        isActive: true,
      },
      orderBy: { balance: 'desc' },
    });

    let totalDebt = 0;
    let exceedingCreditLimitCount = 0;

    const mappedItems = items.map((customer) => {
      const creditLimit = customer.creditLimit ? Number(customer.creditLimit) : 0;
      const balance = Number(customer.balance);
      
      totalDebt += balance;
      if (creditLimit > 0 && balance > creditLimit) {
        exceedingCreditLimitCount++;
      }

      return {
        ...customer,
        creditLimit,
        balance,
      };
    });

    return {
      data: mappedItems,
      meta: {
        totalDebt,
        debtorsCount: items.length,
        exceedingCreditLimitCount,
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        priceList: true,
        sales: {
          take: 5,
          orderBy: { date: 'desc' },
        },
        accountMoves: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto) {
    const { documentNum } = createCustomerDto;

    const existing = await this.prisma.customer.findFirst({
      where: { documentNum },
    });

    if (existing) {
      throw new BadRequestException(`Customer with document ${documentNum} already exists`);
    }

    return this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        balance: 0,
        isActive: true,
      },
    });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    if (updateCustomerDto.documentNum && updateCustomerDto.documentNum !== customer.documentNum) {
      const existing = await this.prisma.customer.findFirst({
        where: { documentNum: updateCustomerDto.documentNum },
      });
      if (existing) {
        throw new BadRequestException(`Customer with document ${updateCustomerDto.documentNum} already exists`);
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getAccountMovements(id: string, query: AccountMovementsQueryDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.prisma.customerAccountMove.count({ where: { customerId: id } }),
      this.prisma.customerAccountMove.findMany({
        where: { customerId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: items,
      totalBalance: Number(customer.balance),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createPayment(id: string, userId: string, paymentDto: PaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id } });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }

      const method = await tx.paymentMethod.findUnique({
        where: { id: paymentDto.methodId },
      });
      if (!method) {
        throw new NotFoundException(`Payment method not found`);
      }

      const payment = await tx.customerPayment.create({
        data: {
          customerId: id,
          amount: paymentDto.amount,
          methodId: paymentDto.methodId,
          reference: paymentDto.reference,
          notes: paymentDto.notes,
        },
      });

      const updatedCustomer = await tx.customer.update({
        where: { id },
        data: {
          balance: {
            decrement: paymentDto.amount,
          },
        },
      });

      await tx.customerAccountMove.create({
        data: {
          customerId: id,
          type: 'PAYMENT',
          amount: -paymentDto.amount,
          referenceId: payment.id,
          notes: paymentDto.notes,
        },
      });

      if (method.code === 'CASH') {
        const openSession = await tx.cashSession.findFirst({
          where: {
            userId,
            status: 'OPEN',
          },
        });

        if (openSession) {
          await tx.cashMovement.create({
            data: {
              sessionId: openSession.id,
              type: 'INCOME',
              amount: paymentDto.amount,
              description: `Cobranza Cliente: ${customer.name}`,
              methodId: method.id,
              referenceId: payment.id,
            },
          });
        }
      }

      return {
        customer: updatedCustomer,
        payment,
      };
    });
  }
}
