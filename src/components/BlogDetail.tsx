'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  icon: string;
  read_time: string;
  created_at: string;
}

interface BlogDetailProps {
  id: number;
}

export function BlogDetail({ id }: BlogDetailProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // 获取当前文章
        const detailResponse = await fetch(`/api/blog/${id}`);
        const detailResult = await detailResponse.json();
        
        if (!detailResult.success) {
          throw new Error(detailResult.error || '文章不存在');
        }
        
        setPost(detailResult.data);

        // 获取所有文章用于上下篇导航
        const listResponse = await fetch('/api/blog');
        const listResult = await listResponse.json();
        if (listResult.success) {
          setAllPosts(listResult.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || '文章不存在'}</div>
          <Link href="/blog" className="text-pink-500 hover:underline">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = allPosts.findIndex(p => p.id === id);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  // 将内容按段落分割
  const paragraphs = post.content.split('\n\n').filter(p => p.trim());

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 pb-20">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-pink-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors">
            <span>←</span>
            <span>返回列表</span>
          </Link>
          <span className="text-sm text-gray-400">{post.read_time}</span>
        </div>
      </div>

      {/* 文章内容 */}
      <article className="max-w-2xl mx-auto px-4 py-8">
        {/* 标题区域 */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center text-4xl">
              {post.icon}
            </div>
            <div>
              <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full">
                恋爱攻略
              </span>
              <div className="text-xs text-gray-400 mt-1">{formatDate(post.created_at)}</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">
            {post.title}
          </h1>
          <p className="text-gray-500 mt-3 leading-relaxed">
            {post.summary}
          </p>
        </header>

        {/* 正文内容 */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-pink-50">
          <div className="prose prose-pink max-w-none">
            {paragraphs.map((paragraph, index) => {
              // 判断是否是标题行（以 # 开头或包含特定关键词）
              const isTitle = paragraph.startsWith('#') || 
                             paragraph.startsWith('为什么') ||
                             paragraph.startsWith('如何') ||
                             paragraph.startsWith('常见错误') ||
                             paragraph.startsWith('正确') ||
                             paragraph.startsWith('另一个') ||
                             paragraph.startsWith('总结') ||
                             paragraph.startsWith('道歉公式') ||
                             paragraph.startsWith('行动比') ||
                             paragraph.startsWith('最后') ||
                             paragraph.startsWith('有些话');

              // 判断是否是列表项（以 ✅ 或 ❌ 开头）
              const isList = paragraph.startsWith('✅') || paragraph.startsWith('❌') || paragraph.startsWith('🎁') || paragraph.startsWith('📅') || paragraph.startsWith('📱') || paragraph.startsWith('🍽️');

              if (isList) {
                return (
                  <div key={index} className="my-3 p-3 bg-pink-50/50 rounded-xl">
                    <p className="text-gray-700 leading-relaxed m-0 whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  </div>
                );
              }

              if (isTitle && paragraph.length < 30) {
                return (
                  <h3 key={index} className="text-lg font-semibold text-gray-800 mt-6 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-pink-400 rounded-full"></span>
                    {paragraph.replace(/^#+\s*/, '')}
                  </h3>
                );
              }

              return (
                <p key={index} className="text-gray-700 leading-relaxed my-4 whitespace-pre-wrap">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* 底部导航 */}
        <div className="mt-8 space-y-3">
          {prevPost && (
            <Link
              href={`/blog/${prevPost.id}`}
              className="flex items-center gap-3 p-4 bg-white/80 rounded-xl hover:bg-pink-50 transition-colors border border-pink-50"
            >
              <span className="text-gray-400">← 上一篇</span>
              <span className="text-gray-700 font-medium truncate">{prevPost.title}</span>
            </Link>
          )}
          {nextPost && (
            <Link
              href={`/blog/${nextPost.id}`}
              className="flex items-center gap-3 p-4 bg-white/80 rounded-xl hover:bg-pink-50 transition-colors border border-pink-50"
            >
              <span className="text-gray-400">→ 下一篇</span>
              <span className="text-gray-700 font-medium truncate">{nextPost.title}</span>
            </Link>
          )}
        </div>

        {/* 返回列表 */}
        <div className="mt-6 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:from-pink-600 hover:to-rose-600 transition-colors shadow-md"
          >
            <span>📚</span>
            <span>查看全部攻略</span>
          </Link>
        </div>
      </article>
    </div>
  );
}
