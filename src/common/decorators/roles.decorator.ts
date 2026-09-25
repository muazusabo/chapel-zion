import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
/**
 * Attach to a controller or handler to restrict access to specific roles.
 * Enforcement happens in RolesGuard — this is NOT just a frontend hint.
 * Example: @Roles(Role.ADMIN, Role.SUPER_ADMIN)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
