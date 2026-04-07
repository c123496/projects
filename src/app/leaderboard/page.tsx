'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface LeaderboardEntry {
  rank: number;
  username: string;
  maxScore: number;
  achievedAt: string;
  isCurrentUser: boolean;
}

interface LeaderboardResponse {
  success: boolean;
  data?: LeaderboardEntry[];
  error?: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const result: LeaderboardResponse = await response.json();

        if (result.success && result.data) {
          setEntries(result.data);
        } else {
          setError(result.error || '加载排行榜失败');
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
        setError('网络错误，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}周前`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)}个月前`;
    } else {
      return `${Math.floor(diffDays / 365)}年前`;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">排行榜</h1>
          <p className="text-gray-600">看看谁是最强哄人高手！</p>
        </div>

        {/* 返回按钮 */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回游戏
          </Button>
        </div>

        {/* 排行榜卡片 */}
        <Card className="bg-white/90 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2 text-2xl">
              <span>👑</span>
              <span>前20名</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p>加载中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-500">
                <div className="text-4xl mb-4">❌</div>
                <p>{error}</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-lg">暂无记录</p>
                <p className="text-sm mt-2">快来挑战成为第一名吧！</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* 表头 */}
                <div className="grid grid-cols-4 gap-4 text-sm text-gray-500 pb-3 border-b-2 border-gray-200 font-medium">
                  <span className="text-center">排名</span>
                  <span className="text-center">用户名</span>
                  <span className="text-center">最高分数</span>
                  <span className="text-center">达成时间</span>
                </div>
                {/* 数据行 */}
                {entries.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`grid grid-cols-4 gap-4 py-3 px-4 rounded-lg transition-all ${
                      entry.isCurrentUser
                        ? 'bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-300 shadow-md'
                        : entry.rank <= 3
                        ? 'bg-purple-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-center text-2xl">
                      {getRankBadge(entry.rank)}
                    </span>
                    <span className="text-center font-medium text-gray-800 flex items-center justify-center gap-2">
                      {entry.username}
                      {entry.isCurrentUser && (
                        <Badge className="bg-pink-500 text-white">你</Badge>
                      )}
                    </span>
                    <span className="text-center font-bold text-purple-600 text-lg">
                      {entry.maxScore}
                    </span>
                    <span className="text-center text-sm text-gray-500 flex items-center justify-center">
                      {formatDate(entry.achievedAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 提示信息 */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>💡 只有登录用户的成绩才会被记录到排行榜</p>
          <p className="mt-1">🎯 完成游戏并获得胜利即可上榜</p>
        </div>
      </div>
    </main>
  );
}
