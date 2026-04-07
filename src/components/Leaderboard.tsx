'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface LeaderboardProps {
  onClose?: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
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
        setError('网络错误');
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
    } else {
      return `${Math.floor(diffDays / 30)}个月前`;
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <span>🏆</span>
            <span>排行榜</span>
          </CardTitle>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin text-3xl mb-3">⏳</div>
            <p className="text-sm">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 text-sm">
            <p>{error}</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🎮</div>
            <p className="text-sm">暂无记录</p>
            <p className="text-xs mt-1">快来挑战吧！</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* 表头 */}
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 pb-2 border-b font-medium">
              <span className="text-center">排名</span>
              <span className="text-center">用户</span>
              <span className="text-center">分数</span>
              <span className="text-center">时间</span>
            </div>
            {/* 数据行 */}
            {entries.slice(0, 10).map((entry) => (
              <div
                key={entry.rank}
                className={`grid grid-cols-4 gap-2 py-2 px-3 rounded text-sm transition-all ${
                  entry.isCurrentUser
                    ? 'bg-gradient-to-r from-pink-100 to-rose-100 border border-pink-300 shadow-sm'
                    : entry.rank <= 3
                    ? 'bg-purple-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-center text-lg">
                  {getRankBadge(entry.rank)}
                </span>
                <span className="text-center font-medium text-gray-800 truncate flex items-center justify-center gap-1">
                  {entry.username}
                  {entry.isCurrentUser && (
                    <Badge className="bg-pink-500 text-white text-xs px-1.5 py-0.5">你</Badge>
                  )}
                </span>
                <span className="text-center font-bold text-purple-600">
                  {entry.maxScore}
                </span>
                <span className="text-center text-xs text-gray-500 flex items-center justify-center">
                  {formatDate(entry.achievedAt)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 查看更多按钮 */}
        {!isLoading && !error && entries.length > 0 && (
          <button
            onClick={() => router.push('/leaderboard')}
            className="w-full mt-4 text-center text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            查看完整排行榜 →
          </button>
        )}
      </CardContent>
    </Card>
  );
}

// 删除旧的 saveToLeaderboard 函数，因为现在成绩会自动保存到数据库
