import { createLogoutResponse } from '@/lib/auth';

// 用户登出
export async function POST() {
  return createLogoutResponse();
}
