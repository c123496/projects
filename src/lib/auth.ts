import bcrypt from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// JWT 密钥（在生产环境中应该使用环境变量）
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'honghong-simulator-secret-key-2024';
  return new TextEncoder().encode(secret);
};

// 密码加密
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// 密码验证
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// 生成 JWT Token
export async function generateToken(payload: { userId: number; username: string }): Promise<string> {
  const secretKey = getSecretKey();
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 天过期
    .sign(secretKey);
  return token;
}

// 验证 JWT Token
export async function verifyToken(token: string): Promise<{ userId: number; username: string } | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { userId: number; username: string };
  } catch {
    return null;
  }
}

// 创建成功响应（返回 token 给前端存储）
export function createAuthResponse(token: string, data: object): NextResponse {
  return NextResponse.json({ 
    success: true, 
    data: {
      ...data,
      token // 返回 token 给前端
    }
  });
}

// 创建登出响应
export function createLogoutResponse(): NextResponse {
  return NextResponse.json({ success: true, message: '已退出登录' });
}

// 获取当前登录用户 - 支持 Cookie 或 Authorization Header
export async function getCurrentUser(request?: Request): Promise<{ userId: number; username: string } | null> {
  let token: string | undefined;
  
  // 优先从 Authorization Header 获取
  const authHeader = request?.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  // 如果没有 Header，从 Cookie 获取
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('auth_token')?.value;
  }
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}
