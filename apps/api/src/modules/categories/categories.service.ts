import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        _count: { select: { products: true, children: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findTree() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });

    const map = new Map<string, any>();
    categories.forEach((item) =>
      map.set(item.id, { ...item, children: [] }),
    );

    const tree: any[] = [];
    categories.forEach((item) => {
      if (item.parentId) {
        map.get(item.parentId)?.children.push(map.get(item.id));
      } else {
        tree.push(map.get(item.id));
      }
    });

    return tree;
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async create(data: any) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId || null,
      },
      include: {
        parent: true,
        _count: { select: { products: true } },
      },
    });
  }

  async update(id: string, data: any) {
    // Prevent setting parent to self
    if (data.parentId === id) {
      throw new BadRequestException('Una categoría no puede ser su propio padre');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
      },
      include: {
        parent: true,
        _count: { select: { products: true } },
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });

    if (!category) throw new NotFoundException('Categoría no encontrada');

    if (category._count.products > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría con productos asociados',
      );
    }

    if (category._count.children > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría con subcategorías',
      );
    }

    return this.prisma.category.delete({ where: { id } });
  }
}
