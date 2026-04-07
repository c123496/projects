import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database/db';
import { blogPosts } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

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

// 获取单篇博客文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: '无效的文章ID' },
        { status: 400 }
      );
    }

    const data = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (data.length === 0) {
      return NextResponse.json(
        { success: false, error: '文章不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: data[0] as BlogPost });
  } catch (error) {
    console.error('获取博客文章失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取失败' },
      { status: 500 }
    );
  }
}

// 删除博客文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: '无效的文章ID' },
        { status: 400 }
      );
    }

    await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, postId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除博客文章失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '删除失败' },
      { status: 500 }
    );
  }
}
