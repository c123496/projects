'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

interface GameRecord {
  id: number;
  scenario: string;
  final_score: number;
  result: string;
  rounds: number;
  played_at: string;
}

interface UserInfo {
  userId: number;
  username: string;
}

// 场景名称映射
const SCENARIO_NAMES: Record<string, string> = {
  forgot_cooking: '忘记做饭',
  forgot_anniversary: '忘记纪念日',
  forgot_laundry: '忘记洗衣服',
  forgot_gift: '忘记买礼物',
};

export default function ProfilePage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    avgScore: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // 获取用户信息
        const userResponse = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userResult = await userResponse.json();
        if (!userResult.success) {
          router.push('/login');
          return;
        }
        setUserInfo(userResult.data);

        // 获取游戏记录
        const recordsResponse = await fetch('/api/game-records/my?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const recordsResult = await recordsResponse.json();
        if (recordsResult.success) {
          setRecords(recordsResult.data.records);
          setTotal(recordsResult.data.total);

          // 计算统计
          const recs = recordsResult.data.records;
          const wins = recs.filter((r: GameRecord) => r.result === 'win').length;
          const losses = recs.filter((r: GameRecord) => r.result === 'lose').length;
          const totalScore = recs.reduce((sum: number, r: GameRecord) => sum + r.final_score, 0);
          
          setStats({
            totalGames: recordsResult.data.total,
            wins,
            losses,
            winRate: recordsResult.data.total > 0 ? Math.round((wins / recordsResult.data.total) * 100) : 0,
            avgScore: recordsResult.data.total > 0 ? Math.round(totalScore / recordsResult.data.total) : 0,
          });
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto p-4 pt-8">
        {/* 用户信息 */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white text-2xl">
              {userInfo?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{userInfo?.username}</h1>
              <p className="text-gray-500 text-sm">游戏记录</p>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-md text-center">
            <div className="text-3xl font-bold text-pink-500">{stats.totalGames}</div>
            <div className="text-sm text-gray-500">总场次</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-md text-center">
            <div className="text-3xl font-bold text-green-500">{stats.wins}</div>
            <div className="text-sm text-gray-500">胜利</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-md text-center">
            <div className="text-3xl font-bold text-red-400">{stats.losses}</div>
            <div className="text-sm text-gray-500">失败</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-md text-center">
            <div className="text-3xl font-bold text-orange-500">{stats.winRate}%</div>
            <div className="text-sm text-gray-500">胜率</div>
          </div>
        </div>

        {/* 游戏记录列表 */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-pink-100">
            <h2 className="text-lg font-semibold text-gray-800">历史记录</h2>
            <p className="text-sm text-gray-500">共 {total} 场游戏</p>
          </div>
          
          {records.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-gray-500 mb-4">还没有游戏记录</p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:shadow-lg transition-shadow"
              >
                开始游戏
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-pink-50">
              {records.map((record) => (
                <div key={record.id} className="p-4 hover:bg-pink-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        record.result === 'win' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-400'
                      }`}>
                        {record.result === 'win' ? '🎉' : '😢'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {SCENARIO_NAMES[record.scenario] || record.scenario}
                        </p>
                        <p className="text-sm text-gray-500">
                          {record.rounds} 回合 · {formatDate(record.played_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        record.final_score >= 50 ? 'text-green-600' : 
                        record.final_score >= 20 ? 'text-orange-500' : 'text-red-400'
                      }`}>
                        {record.final_score}
                      </div>
                      <div className="text-xs text-gray-400">好感度</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 返回按钮 */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-2 text-pink-500 hover:text-pink-600"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
