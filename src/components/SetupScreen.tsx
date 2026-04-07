'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PERSONALITIES, SCENARIOS, SEVERITY_LEVELS, ANGER_REASONS, USER_LEVELS } from '@/lib/game-config';

interface SetupScreenProps {
  onStart: (settings: {
    personality: typeof PERSONALITIES[number];
    scenario: typeof SCENARIOS[number];
    severity: typeof SEVERITY_LEVELS[number];
    angerReason: typeof ANGER_REASONS[number];
    userLevel: typeof USER_LEVELS[number];
  }) => void;
  onShowTutorial: () => void;
}

// 动态引导语
const GUIDE_TEXTS = [
  { text: '你敢挑战吗？', emoji: '😏' },
  { text: '准备好了吗？', emoji: '💕' },
  { text: '来试试吧！', emoji: '😊' },
];

// 场景描述文案
const SCENARIO_DESCRIPTIONS: Record<string, string> = {
  forgot_cooking: '你答应给她做饭，结果完全忘记了...',
  forgot_anniversary: '今天是你们的纪念日，你竟然完全忘记了...',
  forgot_laundry: '你答应帮她洗衣服，结果忘了...',
  forgot_gift: '你承诺要给她买礼物，结果忘了...',
};

export function SetupScreen({ onStart, onShowTutorial }: SetupScreenProps) {
  const [step, setStep] = useState(1);
  const [selectedPersonality, setSelectedPersonality] = useState<typeof PERSONALITIES[number] | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[number] | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<typeof SEVERITY_LEVELS[number] | null>(null);
  const [selectedAngerReason, setSelectedAngerReason] = useState<typeof ANGER_REASONS[number] | null>(null);
  const [selectedUserLevel, setSelectedUserLevel] = useState<typeof USER_LEVELS[number] | null>(null);
  const [guideIndex, setGuideIndex] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  // 动态切换引导语
  useEffect(() => {
    const interval = setInterval(() => {
      setGuideIndex(prev => (prev + 1) % GUIDE_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 选中性格后显示确认提示
  useEffect(() => {
    if (selectedPersonality && step === 1) {
      const timer = setTimeout(() => setShowConfirm(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowConfirm(false);
    }
  }, [selectedPersonality, step]);

  const handleStart = () => {
    if (selectedPersonality && selectedScenario && selectedSeverity && selectedAngerReason && selectedUserLevel) {
      onStart({
        personality: selectedPersonality,
        scenario: selectedScenario,
        severity: selectedSeverity,
        angerReason: selectedAngerReason,
        userLevel: selectedUserLevel,
      });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedPersonality !== null;
      case 2:
        return selectedScenario !== null && selectedSeverity !== null && selectedAngerReason !== null && selectedUserLevel !== null;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* 标题 + 动态引导语 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 bg-clip-text text-transparent mb-2">
            哄女朋友神器
          </h1>
          <p className="text-gray-500 text-lg mb-4">
            学会正确哄女朋友，让爱情更甜蜜
          </p>
          
          {/* 动态引导语 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur rounded-full shadow-sm">
            <span className="text-2xl animate-bounce" key={guideIndex}>
              {GUIDE_TEXTS[guideIndex].emoji}
            </span>
            <span className="text-gray-700 font-medium animate-pulse" key={`text-${guideIndex}`}>
              {GUIDE_TEXTS[guideIndex].text}
            </span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-8">
          <Progress value={step === 1 ? 50 : 100} className="h-2 bg-pink-100" />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span className={`flex items-center gap-1 ${step === 1 ? 'text-pink-600 font-medium' : ''}`}>
              <span>{step === 1 ? '👉' : '✓'}</span> 选择女朋友性格
            </span>
            <span className={`flex items-center gap-1 ${step === 2 ? 'text-pink-600 font-medium' : ''}`}>
              <span>{step === 2 ? '👉' : ''}</span> 选择吵架场景
            </span>
          </div>
        </div>

        {/* 步骤1：选择女朋友性格 */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              她是哪种类型的女朋友？
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {PERSONALITIES.map((p) => {
                const isSelected = selectedPersonality?.id === p.id;
                return (
                  <Card
                    key={p.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'ring-2 ring-pink-400 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg scale-105'
                        : selectedPersonality
                          ? 'opacity-50 hover:opacity-80 hover:shadow-md'
                          : 'hover:shadow-md hover:bg-pink-50/50'
                    }`}
                    onClick={() => setSelectedPersonality(p)}
                  >
                    <CardHeader className="p-3">
                      <div className={`text-3xl text-center mb-1 transition-transform ${isSelected ? 'scale-125' : ''}`}>
                        {p.emoji}
                      </div>
                      <CardTitle className={`text-center text-base ${isSelected ? 'text-pink-600' : ''}`}>
                        {p.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <CardDescription className="text-center text-xs">
                        {p.description}
                      </CardDescription>
                      {isSelected && (
                        <div className="mt-2 text-center">
                          <span className="text-pink-500 text-xs">✓ 已选择</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 选中后的确认提示 */}
            {showConfirm && selectedPersonality && (
              <div className="fixed bottom-20 left-0 right-0 px-4 animate-slide-up">
                <div className="max-w-md mx-auto bg-white/95 backdrop-blur rounded-xl shadow-lg p-4 border border-pink-100">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedPersonality.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{selectedPersonality.name}</p>
                      <p className="text-sm text-gray-500">{selectedPersonality.description}</p>
                    </div>
                    <Button
                      onClick={() => setStep(2)}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                    >
                      下一步
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 步骤2：选择吵架场景 */}
        {step === 2 && (
          <div className="space-y-6">
            {/* 场景选择 */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                刚吵完架，因为...
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SCENARIOS.map((s) => {
                  const isSelected = selectedScenario?.id === s.id;
                  return (
                    <Card
                      key={s.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'ring-2 ring-pink-400 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg'
                          : selectedScenario
                            ? 'opacity-50 hover:opacity-80'
                            : 'hover:shadow-md hover:bg-pink-50/50'
                      }`}
                      onClick={() => setSelectedScenario(s)}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-3">
                          <span className={`text-4xl transition-transform ${isSelected ? 'scale-125' : ''}`}>
                            {s.icon}
                          </span>
                          <div>
                            <CardTitle className={isSelected ? 'text-pink-600' : ''}>
                              {s.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {SCENARIO_DESCRIPTIONS[s.id] || s.description}
                            </CardDescription>
                          </div>
                          {isSelected && (
                            <span className="ml-auto text-pink-500 text-xl">✓</span>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* 严重程度 */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                📊 吵架严重程度
              </h3>
              <div className="flex flex-wrap gap-2">
                {SEVERITY_LEVELS.map((s) => {
                  const isSelected = selectedSeverity?.id === s.id;
                  return (
                    <Button
                      key={s.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`rounded-full transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 scale-105 shadow-md'
                          : 'hover:bg-pink-50 hover:border-pink-300'
                      }`}
                      onClick={() => setSelectedSeverity(s)}
                    >
                      {s.icon} {s.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* 生气原因 */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                😤 她生气的原因
              </h3>
              <div className="flex flex-wrap gap-2">
                {ANGER_REASONS.map((r) => {
                  const isSelected = selectedAngerReason?.id === r.id;
                  return (
                    <Button
                      key={r.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`rounded-full transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 scale-105 shadow-md'
                          : 'hover:bg-pink-50 hover:border-pink-300'
                      }`}
                      onClick={() => setSelectedAngerReason(r)}
                    >
                      {r.icon} {r.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* 用户段位 */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                🎮 你的哄人段位
              </h3>
              <div className="flex flex-wrap gap-2">
                {USER_LEVELS.map((l) => {
                  const isSelected = selectedUserLevel?.id === l.id;
                  return (
                    <Button
                      key={l.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`rounded-full transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 scale-105 shadow-md'
                          : 'hover:bg-pink-50 hover:border-pink-300'
                      }`}
                      onClick={() => setSelectedUserLevel(l)}
                    >
                      {l.icon} {l.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 已选择的显示 */}
        {(selectedPersonality || selectedScenario) && (
          <div className="mt-6 p-4 bg-white/60 backdrop-blur rounded-xl border border-pink-100">
            <p className="text-sm text-gray-600">
              当前选择：
              {selectedPersonality && (
                <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-pink-50 rounded-full">
                  <span>{selectedPersonality.emoji}</span>
                  <span className="font-medium text-pink-600">{selectedPersonality.name}</span>
                </span>
              )}
              {selectedScenario && (
                <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-rose-50 rounded-full">
                  <span>{selectedScenario.icon}</span>
                  <span className="font-medium text-rose-600">{selectedScenario.name}</span>
                </span>
              )}
              {selectedSeverity && (
                <span className="ml-2 px-2 py-1 bg-orange-50 rounded-full text-orange-600">
                  {selectedSeverity.name}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* 底部固定按钮栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-pink-100 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex gap-2">
            <Link
              href="/blog"
              className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 rounded-full text-pink-600 text-sm font-medium transition-colors"
            >
              <span>📚</span>
              <span>恋爱攻略</span>
            </Link>
            <Button
              variant="ghost"
              onClick={onShowTutorial}
              className="text-gray-500 hover:text-pink-600 hover:bg-pink-50"
            >
              📖 教程
            </Button>
          </div>
          <div className="flex gap-2">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)}>
                上一步
              </Button>
            )}
            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
              >
                下一步 →
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
              >
                🎮 开始游戏
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
