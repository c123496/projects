import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database/db';
import { gameRecords, users } from '@/storage/database/shared/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// 获取排行榜
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户（如果已登录）
    const currentUser = await getCurrentUser(request);

    // 查询每个用户的最高分记录
    const userHighScores = await db
      .select({
        userId: users.id,
        username: users.username,
        maxScore: sql<number>`max(${gameRecords.final_score})`,
        firstAchievedAt: sql<string>`min(${gameRecords.played_at})`,
      })
      .from(gameRecords)
      .innerJoin(users, eq(gameRecords.user_id, users.id))
      .groupBy(users.id, users.username)
      .orderBy(desc(sql`max(${gameRecords.final_score})`))
      .limit(20);

    // 转换为排行榜格式
    const leaderboard = userHighScores.map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      maxScore: entry.maxScore,
      achievedAt: entry.firstAchievedAt,
      isCurrentUser: currentUser ? entry.userId === currentUser.userId : false,
    }));

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取排行榜失败' },
      { status: 500 }
    );
  }
}
