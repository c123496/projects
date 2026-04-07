'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PERSONALITIES, SCENARIOS, SEVERITY_LEVELS, ANGER_REASONS, USER_LEVELS, GAME_CONFIG, type RoundHistory } from '@/lib/game-config';

interface GameScreenProps {
  personality: typeof PERSONALITIES[number];
  initialScenario: typeof SCENARIOS[number];
  severity: typeof SEVERITY_LEVELS[number];
  angerReason: typeof ANGER_REASONS[number];
  userLevel: typeof USER_LEVELS[number];
  onEnd: (result: {
    isWin: boolean;
    finalScore: number;
    totalRounds: number;
    totalTime: number;
    history: RoundHistory[];
    completedScenarios: string[];
  }) => void;
  onChangeScenario: () => void;
}

interface ChatResponse {
  girlfriendResponse: string;
  options: string[];
  correctIndex: number;
}

// 每个场景需要答对的次数才能过关
const CORRECT_COUNT_TO_PASS = 3;

// 根据脾气值获取表情和状态
const getMoodEmoji = (score: number): { emoji: string; text: string; color: string } => {
  if (score < 20) return { emoji: '🤬', text: '暴怒中', color: 'text-red-600' };
  if (score < 35) return { emoji: '😠', text: '非常生气', color: 'text-red-500' };
  if (score < 50) return { emoji: '😤', text: '有点生气', color: 'text-orange-500' };
  if (score < 65) return { emoji: '😐', text: '情绪缓和', color: 'text-yellow-500' };
  if (score < 80) return { emoji: '🙂', text: '心情好转', color: 'text-green-400' };
  if (score < 95) return { emoji: '😊', text: '心情不错', color: 'text-green-500' };
  return { emoji: '🥰', text: '很开心', color: 'text-pink-500' };
};

// 预设的情绪状态短语（不依赖AI生成）
const MOOD_PHRASES: Record<string, string[]> = {
  very_angry: [
    '她看起来还是很生气...',
    '感觉她火气还没消...',
    '她好像更生气了...',
    '气氛还是很紧张...',
  ],
  angry: [
    '她似乎有点动摇了...',
    '感觉她冷静了一点...',
    '她的情绪好像稳定了些...',
    '看来还需要继续努力...',
  ],
  neutral: [
    '她似乎没那么生气了...',
    '感觉有机会了...',
    '她的态度好像软化了...',
    '继续加油！',
  ],
  happy: [
    '她看起来心情不错！',
    '感觉快成功了！',
    '她好像原谅你了！',
    '再接再厉！',
  ],
  very_happy: [
    '她看起来很开心！',
    '感觉她完全原谅你了！',
    '太棒了！继续保持！',
    '她好像很喜欢你这样说！',
  ],
};

// 根据分数获取情绪短语
const getMoodPhrase = (score: number): string => {
  let category: string;
  if (score < 30) category = 'very_angry';
  else if (score < 50) category = 'angry';
  else if (score < 70) category = 'neutral';
  else if (score < 90) category = 'happy';
  else category = 'very_happy';
  
  const phrases = MOOD_PHRASES[category];
  return phrases[Math.floor(Math.random() * phrases.length)];
};

// 等待时的俏皮文案
const WAITING_TEXTS = [
  '她在生闷气中...',
  '正在酝酿情绪...',
  '思考人生中...',
  '整理心情中...',
  '酝酿台词中...',
];

// 选项对应的情绪图标
const OPTION_ICONS = ['😊', '😐', '😤'];

export function GameScreen({
  personality,
  initialScenario,
  severity,
  angerReason,
  userLevel,
  onEnd,
  onChangeScenario,
}: GameScreenProps) {
  const [score, setScore] = useState<number>(GAME_CONFIG.initialScore);
  const [rounds, setRounds] = useState(0);
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [currentResponse, setCurrentResponse] = useState<ChatResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime] = useState(Date.now());
  const audioRef = useRef<HTMLAudioElement>(null);
  const playingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [waitingTextIndex, setWaitingTextIndex] = useState(0);
  const [currentMoodPhrase, setCurrentMoodPhrase] = useState('');
  
  // 退出确认弹窗
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // 场景相关状态
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(() => 
    SCENARIOS.findIndex(s => s.id === initialScenario.id)
  );
  const [currentScenario, setCurrentScenario] = useState(initialScenario);
  const [scenarioCorrectCount, setScenarioCorrectCount] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [showScenarioTransition, setShowScenarioTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');

  // 退出游戏
  const handleExit = () => {
    // 停止语音播放
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (playingTimeoutRef.current) {
      clearTimeout(playingTimeoutRef.current);
    }
    onChangeScenario();
  };

  // 等待时动态切换文案
  useEffect(() => {
    if (isLoading && !isPlaying) {
      const interval = setInterval(() => {
        setWaitingTextIndex(prev => (prev + 1) % WAITING_TEXTS.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isLoading, isPlaying]);

  // 强力清理函数：移除所有异常内容
  const cleanText = (text: string): string => {
    return text
      .replace(/\b(undefined|null|nan|none|NaN)\b/gi, '')
      .replace(/[\[\]【】]/g, '')
      .replace(/[a-zA-Z]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // 获取当前场景的对话
  const fetchChat = useCallback(async (scenarioId: string, newScore: number, currentHistory: RoundHistory[]) => {
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentResponse(null);
    setCurrentMoodPhrase('');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personality: personality.id,
          scenario: scenarioId,
          severity: severity.id,
          angerReason: angerReason.id,
          userLevel: userLevel.id,
          currentScore: newScore,
          history: currentHistory,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const filteredText = cleanText(data.data.girlfriendResponse);
        const filteredOptions = data.data.options.map((opt: string) => cleanText(opt)).filter((opt: string) => opt.length > 0);
        
        setCurrentResponse({
          girlfriendResponse: filteredText,
          options: filteredOptions,
          correctIndex: data.data.correctIndex,
        });
        playTTS(filteredText, newScore);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      setIsLoading(false);
    }
  }, [personality, severity, angerReason, userLevel]);

  // 初始加载
  useEffect(() => {
    fetchChat(currentScenario.id, score, []);
  }, []);

  // 清理超时定时器
  useEffect(() => {
    return () => {
      if (playingTimeoutRef.current) {
        clearTimeout(playingTimeoutRef.current);
      }
    };
  }, []);

  // TTS语音播放
  const playTTS = async (text: string, currentScore: number) => {
    setIsPlaying(true);
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: personality.voiceId,
          speechRate: currentScore < 40 ? 20 : currentScore < 70 ? 30 : 40,
        }),
      });
      const data = await response.json();
      if (data.success && audioRef.current) {
        audioRef.current.src = data.data.audioUri;
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
          // 播放失败也显示情绪短语
          setCurrentMoodPhrase(getMoodPhrase(currentScore));
        });
        
        // 设置超时保护
        playingTimeoutRef.current = setTimeout(() => {
          setIsPlaying(false);
          setIsLoading(false);
          setCurrentMoodPhrase(getMoodPhrase(currentScore));
        }, 15000);
      } else {
        setIsPlaying(false);
        setIsLoading(false);
        setCurrentMoodPhrase(getMoodPhrase(currentScore));
      }
    } catch (error) {
      console.error('Failed to play TTS:', error);
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentMoodPhrase(getMoodPhrase(currentScore));
    }
  };

  // 音频播放结束
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentMoodPhrase(getMoodPhrase(score));
    if (playingTimeoutRef.current) {
      clearTimeout(playingTimeoutRef.current);
      playingTimeoutRef.current = null;
    }
  };

  // 切换到下一个场景
  const switchToNextScenario = useCallback((newScore: number, newHistory: RoundHistory[]) => {
    const nextIndex = SCENARIOS.findIndex((s, idx) => 
      idx > currentScenarioIndex && !completedScenarios.includes(s.id)
    );

    if (nextIndex === -1) {
      onEnd({
        isWin: true,
        finalScore: newScore,
        totalRounds: rounds + 1,
        totalTime: Date.now() - startTime,
        history: newHistory,
        completedScenarios: [...completedScenarios, currentScenario.id],
      });
      return;
    }

    const nextScenario = SCENARIOS[nextIndex];
    setTransitionMessage(`太棒了！${currentScenario.name}哄好了！\n即将进入：${nextScenario.icon} ${nextScenario.name}`);
    setShowScenarioTransition(true);

    setTimeout(() => {
      setShowScenarioTransition(false);
      setCompletedScenarios(prev => [...prev, currentScenario.id]);
      setCurrentScenarioIndex(nextIndex);
      setCurrentScenario(nextScenario);
      setScenarioCorrectCount(0);
      fetchChat(nextScenario.id, newScore, newHistory);
    }, 800);
  }, [currentScenarioIndex, currentScenario, completedScenarios, rounds, startTime, onEnd, fetchChat]);

  // 选择选项
  const handleSelectOption = async (index: number) => {
    if (!currentResponse || isLoading || isPlaying) return;

    const isCorrect = index === currentResponse.correctIndex;
    const scoreChange = isCorrect ? GAME_CONFIG.correctPoints : GAME_CONFIG.wrongPoints;
    const newScore = Math.max(GAME_CONFIG.minScore, Math.min(GAME_CONFIG.maxScore, score + scoreChange));
    
    const roundHistory: RoundHistory = {
      round: rounds + 1,
      scenarioId: currentScenario.id,
      options: currentResponse.options,
      selectedIndex: index,
      isCorrect,
      girlfriendResponse: currentResponse.girlfriendResponse,
      scoreChange,
    };

    const newHistory = [...history, roundHistory];
    setHistory(newHistory);
    setScore(newScore);
    setRounds(rounds + 1);

    if (newScore <= GAME_CONFIG.loseScore) {
      setTimeout(() => {
        onEnd({
          isWin: false,
          finalScore: newScore,
          totalRounds: rounds + 1,
          totalTime: Date.now() - startTime,
          history: newHistory,
          completedScenarios,
        });
      }, 1000);
      return;
    }

    if (isCorrect) {
      const newCorrectCount = scenarioCorrectCount + 1;
      setScenarioCorrectCount(newCorrectCount);

      if (newCorrectCount >= CORRECT_COUNT_TO_PASS) {
        switchToNextScenario(newScore, newHistory);
        return;
      }
    }

    // 继续下一轮
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentResponse(null);
    setCurrentMoodPhrase('');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personality: personality.id,
          scenario: currentScenario.id,
          severity: severity.id,
          angerReason: angerReason.id,
          userLevel: userLevel.id,
          currentScore: newScore,
          history: newHistory,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const filteredText = cleanText(data.data.girlfriendResponse);
        const filteredOptions = data.data.options.map((opt: string) => cleanText(opt)).filter((opt: string) => opt.length > 0);
        
        setCurrentResponse({
          girlfriendResponse: filteredText,
          options: filteredOptions,
          correctIndex: data.data.correctIndex,
        });
        playTTS(filteredText, newScore);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch next chat:', error);
      setIsLoading(false);
    }
  };

  const mood = getMoodEmoji(score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 p-4">
      <audio ref={audioRef} onEnded={handleAudioEnded} onError={handleAudioEnded} />
      
      <div className="max-w-2xl mx-auto">
        {/* 固定退出按钮 */}
        <button
          onClick={() => setShowExitConfirm(true)}
          className="fixed top-4 right-4 z-40 flex items-center gap-1 px-3 py-2 bg-white/90 hover:bg-white backdrop-blur rounded-full shadow-md hover:shadow-lg transition-all text-gray-600 hover:text-gray-800"
        >
          <span className="text-lg">🚪</span>
          <span className="text-sm font-medium">退出</span>
        </button>

        {/* 退出确认弹窗 */}
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <div className="text-5xl mb-4">😢</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">确定要退出吗？</h3>
                <p className="text-gray-500 mb-6">当前进度将不会保存</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 font-medium transition-colors"
                  >
                    继续游戏
                  </button>
                  <button
                    onClick={handleExit}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full font-medium transition-colors"
                  >
                    确认退出
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 场景切换提示 */}
        {showScenarioTransition && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
              <div className="text-5xl mb-4">🎉</div>
              <p className="text-xl font-medium text-gray-800 whitespace-pre-line">
                {transitionMessage}
              </p>
            </div>
          </div>
        )}

        {/* 顶部状态栏 */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{personality.emoji}</span>
              <span className="font-medium">{personality.name}</span>
              <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                {currentScenario.icon} {currentScenario.name}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg ${mood.color}`}>{mood.emoji}</span>
              <span className={`text-sm font-medium ${mood.color}`}>{mood.text}</span>
            </div>
          </div>
          
          {/* 脾气值进度条 */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">💕 脾气值</span>
              <span className="font-medium text-pink-600">{score}/100</span>
            </div>
            <Progress 
              value={score} 
              className={`h-3 ${score < 30 ? 'bg-red-100' : score < 70 ? 'bg-yellow-100' : 'bg-green-100'}`}
            />
          </div>

          {/* 场景进度 */}
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">📍 场景进度</span>
              <span className="font-medium text-rose-600">{scenarioCorrectCount}/{CORRECT_COUNT_TO_PASS}</span>
            </div>
            <Progress 
              value={(scenarioCorrectCount / CORRECT_COUNT_TO_PASS) * 100} 
              className="h-2 bg-rose-100"
            />
            <p className="text-xs text-gray-400 mt-1">答对 {CORRECT_COUNT_TO_PASS} 次进入下一场景</p>
          </div>

          {/* 游戏统计 */}
          <div className="flex justify-between mt-3 text-sm text-gray-500">
            <span>🎮 回合: {rounds}</span>
            <span>✅ 已完成: {completedScenarios.length}/{SCENARIOS.length}</span>
          </div>
        </div>

        {/* 已完成场景显示 */}
        {completedScenarios.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {completedScenarios.map(id => {
              const s = SCENARIOS.find(sc => sc.id === id);
              return s ? (
                <Badge key={id} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                  ✓ {s.icon} {s.name}
                </Badge>
              ) : null;
            })}
          </div>
        )}

        {/* 表情显示区域 */}
        <Card className="mb-4 bg-white/90 backdrop-blur shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-64 flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
              {isLoading && !currentResponse ? (
                // 加载等待状态
                <div className="text-center">
                  <div className="text-7xl mb-3 animate-pulse">
                    {mood.emoji}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                  <p className="text-gray-500 animate-pulse" key={waitingTextIndex}>
                    {WAITING_TEXTS[waitingTextIndex]}
                  </p>
                </div>
              ) : isPlaying ? (
                // 说话中状态
                <div className="text-center">
                  <div className="relative">
                    <div className="text-8xl animate-bounce">
                      {mood.emoji}
                    </div>
                    <div className="absolute -top-2 -right-2 text-4xl animate-ping">
                      💬
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-pink-500">正在说话...</span>
                  </div>
                </div>
              ) : currentResponse ? (
                // 显示状态
                <div className="text-center">
                  <div className="text-8xl mb-3">{mood.emoji}</div>
                  {/* 固定情绪短语 */}
                  <p className={`text-lg font-medium ${mood.color} mb-1`}>
                    {currentMoodPhrase || getMoodPhrase(score)}
                  </p>
                  <p className="text-sm text-gray-400">点击下方选项回应她</p>
                </div>
              ) : null}
              
              {/* 装饰性背景 */}
              <div className="absolute top-4 right-4 text-4xl opacity-20">
                {personality.emoji}
              </div>
              <div className="absolute bottom-4 left-4 text-3xl opacity-20">
                💕
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 选项区域 */}
        {currentResponse && currentResponse.options.length >= 3 && !isPlaying && !showScenarioTransition && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center mb-2">💭 选择你的回应：</p>
            {currentResponse.options.slice(0, 3).map((option, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 text-left h-auto py-4 px-4 bg-white/90 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 border border-gray-200 hover:border-pink-300 rounded-xl transition-all hover:shadow-md"
                onClick={() => handleSelectOption(index)}
              >
                {/* 情绪图标 */}
                <span className="text-2xl flex-shrink-0">
                  {OPTION_ICONS[index]}
                </span>
                {/* 选项字母 */}
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 font-medium flex-shrink-0 text-sm">
                  {String.fromCharCode(65 + index)}
                </span>
                {/* 选项文字 */}
                <span className="flex-1 text-gray-700 leading-relaxed break-words">{option}</span>
              </button>
            ))}
          </div>
        )}

        {/* 历史记录提示 */}
        {history.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-400">
            已答对 <span className="text-green-500 font-medium">{history.filter(h => h.isCorrect).length}</span> / {history.length} 题
          </div>
        )}
      </div>
    </div>
  );
}
