import { NextRequest } from 'next/server';
import { db } from '@/storage/database/db';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, generateToken, createAuthResponse } from '@/lib/auth';

// 用户注册
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

    if (username.length < 2 || username.length > 50) {
      return Response.json(
        { success: false, error: '用户名长度应为 2-50 个字符' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { success: false, error: '密码长度至少 6 个字符' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return Response.json(
        { success: false, error: '用户名已存在' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const newUser = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
      })
      .returning();

    // 生成 JWT Token
    const token = await generateToken({
      userId: newUser[0].id,
      username: newUser[0].username,
    });

    // 返回带认证 Cookie 的响应
    return createAuthResponse(token, {
      id: newUser[0].id,
      username: newUser[0].username,
    });
  } catch (error) {
    console.error('注册失败:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : '注册失败' },
      { status: 500 }
    );
  }
}
