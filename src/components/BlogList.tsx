'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  icon: string;
  read_time: string;
  created_at: string;
}

export function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/blog');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '获取文章失败');
      }
      
      setPosts(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取文章失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化时迁移数据并获取文章
  useEffect(() => {
    const init = async () => {
      // 先尝试迁移数据
      try {
        await fetch('/api/blog/migrate', { method: 'POST' });
      } catch {
        // 迁移失败不影响，可能已有数据
      }
      // 获取文章列表
      await fetchPosts();
    };
    init();
  }, [fetchPosts]);

  const handleGenerateArticle = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/blog/generate', { method: 'POST' });
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '生成文章失败');
      }
      
      // 刷新文章列表
      await fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : '生成文章失败');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 pb-20">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-pink-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors">
            <span>←</span>
            <span>返回首页</span>
          </Link>
          <span className="text-sm text-gray-400">💕 恋爱攻略</span>
        </div>
      </div>

      {/* 标题区域 */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full mb-4">
            <span className="text-2xl">📚</span>
            <span className="text-pink-600 font-medium">恋爱攻略</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            哄女朋友必备技能
          </h1>
          <p className="text-gray-500">
            学会这些，再也不用跪搓衣板了
          </p>
        </div>

        {/* 生成新文章按钮 */}
        <div className="mb-6 text-center">
          <button
            onClick={handleGenerateArticle}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <span className="animate-spin">✨</span>
                <span>AI 正在生成...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>AI 生成新文章</span>
              </>
            )}
          </button>
        </div>

        {/* 文章列表 */}
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无文章，点击上方按钮生成第一篇吧！
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="block bg-white/80 backdrop-blur rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] border border-pink-50"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center text-3xl">
                    {post.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full">
                        第 {posts.length - index} 篇
                      </span>
                      <span className="text-xs text-gray-400">{post.read_time}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {post.summary}
                    </p>
                  </div>
                  <div className="flex-shrink-0 self-center">
                    <span className="text-gray-300 text-xl">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            💡 点击上方按钮让 AI 为你生成更多恋爱攻略
          </p>
        </div>
      </div>
    </div>
  );
}
