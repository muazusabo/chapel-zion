import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * Marks a route as publicly accessible, bypassing the global JwtAuthGuard.
 * Use for register/login/public read endpoints (news, announcements, etc.)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
