import { NextRequest } from 'next/server';
import { db } from '@/storage/database/db';
import { gameRecords } from '@/storage/database/shared/schema';
import { getCurrentUser } from '@/lib/auth';

// 保存游戏记录
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const { scenario, finalScore, result, rounds } = await request.json();

    // 参数验证
    if (!scenario || finalScore === undefined || !result || rounds === undefined) {
      return Response.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    // 保存游戏记录
    const record = await db
      .insert(gameRecords)
      .values({
        user_id: user.userId,
        scenario,
        final_score: finalScore,
        result,
        rounds,
      })
      .returning();

    return Response.json({
      success: true,
      data: record[0],
    });
  } catch (error) {
    console.error('保存游戏记录失败:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : '保存游戏记录失败' },
      { status: 500 }
    );
  }
}
