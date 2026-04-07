import { NextRequest } from 'next/server';
import { db } from '@/storage/database/db';
import { gameRecords } from '@/storage/database/shared/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// 获取当前用户的游戏记录
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    // 获取分页参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // 查询游戏记录
    const records = await db
      .select()
      .from(gameRecords)
      .where(eq(gameRecords.user_id, user.userId))
      .orderBy(desc(gameRecords.played_at))
      .limit(limit)
      .offset(offset);

    // 获取总数
    const totalCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(gameRecords)
      .where(eq(gameRecords.user_id, user.userId));

    return Response.json({
      success: true,
      data: {
        records: records || [],
        total: totalCount[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error('获取游戏记录失败:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : '获取游戏记录失败' },
      { status: 500 }
    );
  }
}
