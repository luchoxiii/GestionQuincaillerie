import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    if (
      user.roles?.some((r: string) => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'ADMINISTRADOR') ||
      user.role?.toUpperCase() === 'ADMIN' ||
      user.role?.toUpperCase() === 'ADMINISTRADOR'
    ) {
      return true;
    }

    if (!Array.isArray(user.permissions)) {
      return false;
    }

    const normalizedUserPerms = new Set<string>(
      user.permissions.map((p: string) => String(p).replace(/:/g, '.')),
    );
    
    // Check if user has all required permissions or is Admin
    if (normalizedUserPerms.has('ALL') || normalizedUserPerms.has('*')) {
      return true; // Super admin
    }
    
    return requiredPermissions.every(permission => {
      const normRequired = String(permission).replace(/:/g, '.');
      if (normalizedUserPerms.has(normRequired)) return true;
      const [module] = normRequired.split('.');
      if (module && normalizedUserPerms.has(`${module}.*`)) return true;
      return false;
    });
  }
}
