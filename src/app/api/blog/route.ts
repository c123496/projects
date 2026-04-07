import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database/db';
import { blogPosts } from '@/storage/database/shared/schema';
import { desc } from 'drizzle-orm';

// 博客文章接口
interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  icon: string;
  read_time: string;
  created_at: string;
}

// 获取所有博客文章
export async function GET() {
  try {
    const data = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.created_at));

    return NextResponse.json({ success: true, data: data as BlogPost[] });
  } catch (error) {
    console.error('获取博客文章失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取失败' },
      { status: 500 }
    );
  }
}

// 创建新博客文章
export async function POST(request: NextRequest) {
  try {
    const { title, summary, content, icon, read_time } = await request.json();

    if (!title || !summary || !content) {
      return NextResponse.json(
        { success: false, error: '标题、摘要和内容不能为空' },
        { status: 400 }
      );
    }

    const data = await db
      .insert(blogPosts)
      .values({
        title,
        summary,
        content,
        icon: icon || '📝',
        read_time: read_time || '3分钟',
      })
      .returning();

    return NextResponse.json({ success: true, data: data[0] as BlogPost });
  } catch (error) {
    console.error('创建博客文章失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '创建失败' },
      { status: 500 }
    );
  }
}
