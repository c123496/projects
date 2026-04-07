import { NextRequest } from 'next/server';
import { db } from '@/storage/database/db';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, generateToken, createAuthResponse } from '@/lib/auth';

// 用户登录
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 参数验证
    if (!username || !password) {
      return Response.json(
        { success: false, error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 查询用户
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (user.length === 0) {
      return Response.json(
        { success: false, error: '用户名或密码错误' },
        { status: 400 }
      );
    }

    // 验证密码
    const isValid = await verifyPassword(password, user[0].password);

    if (!isValid) {
      return Response.json(
        { success: false, error: '用户名或密码错误' },
        { status: 400 }
      );
    }

    // 生成 JWT Token
    const token = await generateToken({
      userId: user[0].id,
      username: user[0].username,
    });

    // 返回带认证 Cookie 的响应
    return createAuthResponse(token, {
      id: user[0].id,
      username: user[0].username,
    });
  } catch (error) {
    console.error('登录失败:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : '登录失败' },
      { status: 500 }
    );
  }
}
