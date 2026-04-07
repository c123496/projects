'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SetupScreen } from '@/components/SetupScreen';
import { GameScreen } from '@/components/GameScreen';
import { ResultScreen } from '@/components/ResultScreen';
import { TutorialScreen } from '@/components/TutorialScreen';
import { Leaderboard } from '@/components/Leaderboard';
import { Navbar } from '@/components/Navbar';
import { PERSONALITIES, SCENARIOS, SEVERITY_LEVELS, ANGER_REASONS, USER_LEVELS, type RoundHistory } from '@/lib/game-config';

type GamePhase = 'setup' | 'playing' | 'result';

interface GameSettings {
  personality: typeof PERSONALITIES[number];
  scenario: typeof SCENARIOS[number];
  severity: typeof SEVERITY_LEVELS[number];
  angerReason: typeof ANGER_REASONS[number];
  userLevel: typeof USER_LEVELS[number];
}

interface SaveRecordMessage {
  type: 'success' | 'login';
  message: string;
}

export default function Home() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [saveRecordMessage, setSaveRecordMessage] = useState<SaveRecordMessage | null>(null);
  const [pendingLogout, setPendingLogout] = useState(false);
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [gameResult, setGameResult] = useState<{
    isWin: boolean;
    finalScore: number;
    totalRounds: number;
    totalTime: number;
    history: RoundHistory[];
    completedScenarios?: string[];
  } | null>(null);

  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/auth/me', { headers });
        const result = await response.json();
        if (result.success) {
          setIsLoggedIn(true);
          setUsername(result.data.username);
          setUserId(result.data.userId);
        } else {
          setIsLoggedIn(false);
          setUserId(null);
          router.push('/login');
          return;
        }
      } catch {
        setIsLoggedIn(false);
        setUserId(null);
        router.push('/login');
        return;
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [router]);

  // 检查是否首次访问，显示教程
  useEffect(() => {
    if (authChecked && isLoggedIn) {
      const hasSeenTutorial = localStorage.getItem('girlfriend_game_tutorial_seen');
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    }
  }, [authChecked, isLoggedIn]);

  const handleStart = (newSettings: GameSettings) => {
    setSettings(newSettings);
    setPhase('playing');
  };

  const handleGameEnd = async (result: {
    isWin: boolean;
    finalScore: number;
    totalRounds: number;
    totalTime: number;
    history: RoundHistory[];
    completedScenarios?: string[];
  }) => {
    setGameResult(result);
    setPhase('result');

    // 解锁成就
    unlockAchievements(result);

    // 保存游戏记录
    if (settings) {
      const token = localStorage.getItem('auth_token');
      if (token && userId) {
        try {
          const response = await fetch('/api/game-records', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              scenario: settings.scenario.id,
              finalScore: result.finalScore,
              result: result.isWin ? 'win' : 'lose',
              rounds: result.totalRounds,
            }),
          });
          const saveResult = await response.json();
          if (saveResult.success) {
            setSaveRecordMessage({ type: 'success', message: '您的游戏记录已经保存' });
          } else {
            setSaveRecordMessage({ type: 'login', message: '登录后可保存你的游戏记录' });
          }
        } catch {
          setSaveRecordMessage({ type: 'login', message: '登录后可保存你的游戏记录' });
        }
      } else {
        setSaveRecordMessage({ type: 'login', message: '登录后可保存你的游戏记录' });
      }
    }
  };

  const handleRestart = () => {
    setPhase('playing');
    setGameResult(null);
  };

  const handleChangeSettings = () => {
    setPhase('setup');
    setGameResult(null);
    setSettings(null);
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    localStorage.setItem('girlfriend_game_tutorial_seen', 'true');
  };

  // 解锁成就
  const unlockAchievements = (result: {
    isWin: boolean;
    finalScore: number;
    totalRounds: number;
    totalTime: number;
    history: RoundHistory[];
    completedScenarios?: string[];
  }) => {
    try {
      const stored = localStorage.getItem('girlfriend_game_achievements');
      const achievements = stored ? JSON.parse(stored) : [];
      const newAchievements = [...achievements];
      const stats = getGameStats();

      // 首次胜利
      if (result.isWin && !achievements.includes('first_win')) {
        newAchievements.push('first_win');
      }

      // 累计胜利次数
      if (result.isWin) {
        const winCount = (stats.totalWins || 0) + 1;
        if (winCount >= 10 && !achievements.includes('win_10')) {
          newAchievements.push('win_10');
        }
        if (winCount >= 50 && !achievements.includes('win_50')) {
          newAchievements.push('win_50');
        }
        if (winCount >= 100 && !achievements.includes('win_100')) {
          newAchievements.push('win_100');
        }
      }

      // 完美发挥（全部答对）
      if (result.isWin && result.history.every(h => h.isCorrect)) {
        if (!achievements.includes('perfect_game')) {
          newAchievements.push('perfect_game');
        }
      }

      // 绝地翻盘（从10分以下成功）
      if (result.isWin && result.history.some(h => {
        const score = 20 + result.history.slice(0, result.history.indexOf(h)).reduce((acc, h) => acc + h.scoreChange, 0);
        return score <= 10;
      })) {
        if (!achievements.includes('comeback')) {
          newAchievements.push('comeback');
        }
      }

      // 光速哄好（5轮内）
      if (result.isWin && result.totalRounds <= 5) {
        if (!achievements.includes('speed_demon')) {
          newAchievements.push('speed_demon');
        }
      }

      // 地狱难度
      if (result.isWin && settings) {
        if (settings.severity.id === 'serious' && 
            settings.personality.id === 'queen' && 
            settings.userLevel.id === 'novice') {
          if (!achievements.includes('hard_mode')) {
            newAchievements.push('hard_mode');
          }
        }
      }

      // 全能男友（完成所有场景）
      if (result.completedScenarios && result.completedScenarios.length >= SCENARIOS.length) {
        if (!achievements.includes('all_scenarios')) {
          newAchievements.push('all_scenarios');
        }
      }

      localStorage.setItem('girlfriend_game_achievements', JSON.stringify(newAchievements));

      // 更新统计
      const newStats = {
        ...stats,
        totalGames: (stats.totalGames || 0) + 1,
        totalWins: result.isWin ? (stats.totalWins || 0) + 1 : stats.totalWins,
        totalRounds: (stats.totalRounds || 0) + result.totalRounds,
        personalities: [...new Set([...(stats.personalities || []), settings?.personality.id])],
        scenarios: [...new Set([...(stats.scenarios || []), ...(result.completedScenarios || [])])],
      };
      localStorage.setItem('girlfriend_game_stats', JSON.stringify(newStats));

    } catch (error) {
      console.error('Failed to unlock achievements:', error);
    }
  };

  // 获取游戏统计
  const getGameStats = () => {
    try {
      const stored = localStorage.getItem('girlfriend_game_stats');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const handleLogoutToastClose = () => {
    setSaveRecordMessage(null);
    if (pendingLogout) {
      setPendingLogout(false);
      window.location.href = '/login';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50">
      <Navbar 
        hasSaveMessage={!!saveRecordMessage}
        onConfirmLogout={() => setPendingLogout(true)}
      />
      
      {/* 未认证时显示加载 */}
      {!authChecked && (
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
          <div className="text-gray-500">加载中...</div>
        </div>
      )}
      
      {/* 已认证时显示游戏内容 */}
      {authChecked && isLoggedIn && (
        <>
          {phase === 'setup' && (
            <div>
              <SetupScreen
                onStart={handleStart}
                onShowTutorial={() => setShowTutorial(true)}
              />
              {/* 排行榜入口 */}
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="fixed bottom-4 right-4 bg-white/90 backdrop-blur rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow z-50"
              >
                🏆
              </button>
              {/* 排行榜弹窗 */}
              {showLeaderboard && (
                <div className="fixed bottom-20 right-4 w-80 z-50">
                  <Leaderboard onClose={() => setShowLeaderboard(false)} />
                </div>
              )}
            </div>
          )}

          {phase === 'playing' && settings && (
            <GameScreen
              personality={settings.personality}
              initialScenario={settings.scenario}
              severity={settings.severity}
              angerReason={settings.angerReason}
              userLevel={settings.userLevel}
              onEnd={handleGameEnd}
              onChangeScenario={handleChangeSettings}
            />
          )}

          {phase === 'result' && gameResult && settings && (
            <ResultScreen
              isWin={gameResult.isWin}
              finalScore={gameResult.finalScore}
              totalRounds={gameResult.totalRounds}
              totalTime={gameResult.totalTime}
              history={gameResult.history}
              personality={settings.personality}
              scenario={settings.scenario}
              completedScenarios={gameResult.completedScenarios}
              onRestart={handleRestart}
              onChangeSettings={handleChangeSettings}
            />
          )}

          {/* 新手教程 */}
          {showTutorial && <TutorialScreen onClose={handleTutorialClose} />}

          {/* 游戏记录保存提示 Toast */}
          {(saveRecordMessage || pendingLogout) && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50" style={{ animation: 'slideDown 0.3s ease-out' }}>
              <div className={`px-6 py-3 rounded-full shadow-lg flex items-center gap-3 ${
                saveRecordMessage?.type === 'success' || pendingLogout
                  ? 'bg-green-500 text-white' 
                  : 'bg-orange-500 text-white'
              }`}>
                <span className="text-xl">
                  {saveRecordMessage?.type === 'success' || pendingLogout ? '✅' : '💡'}
                </span>
                <span className="font-medium">
                  {saveRecordMessage?.message || (pendingLogout ? '您的游戏记录已经保存' : '')}
                </span>
                <button 
                  onClick={handleLogoutToastClose}
                  className="ml-2 hover:opacity-80"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* 动画样式 */}
          <style jsx>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
              }
            }
          `}</style>
        </>
      )}
    </main>
  );
}
