'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TutorialScreenProps {
  onClose: () => void;
}

export function TutorialScreen({ onClose }: TutorialScreenProps) {
  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState(5);

  const steps = [
    {
      title: '欢迎来到哄女朋友神器！',
      content: '这是一个帮你练习哄女朋友的游戏。面对生气的女朋友，选择正确的选项哄好她！',
      icon: '🎮',
    },
    {
      title: '选择女朋友的性格',
      content: '不同性格的女朋友有不同的说话风格和脾气特点，哄她的策略也会不同。',
      icon: '💕',
    },
    {
      title: '选择吵架场景',
      content: '选择吵架场景、严重程度、生气原因，这些会影响游戏难度和她的初始情绪。',
      icon: '😤',
    },
    {
      title: '选择选项来哄她',
      content: '三个选项中选一个，选对脾气值上升，选错下降。观察她的反应判断心情！',
      icon: '🎯',
    },
    {
      title: '完成场景自动切换',
      content: '每个场景答对3次过关，自动进入下一场景。脾气值会在所有场景间累计。',
      icon: '🔄',
    },
    {
      title: '目标：哄好她！',
      content: '初始脾气值20分，目标是在所有场景中保持脾气值不降为0。加油！',
      icon: '🏆',
    },
  ];

  // 5秒后自动消失
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 当倒计时结束时关闭教程
  useEffect(() => {
    if (countdown === 0) {
      onClose();
    }
  }, [countdown, onClose]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
        {/* 顶部渐变装饰 */}
        <div className="h-2 bg-gradient-to-r from-pink-400 via-rose-400 to-orange-300" />
        
        <CardHeader className="text-center pt-6">
          <div className="text-6xl mb-4 animate-bounce">
            {steps[step].icon}
          </div>
          <CardTitle className="text-xl text-gray-800">
            {steps[step].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          <p className="text-gray-600 text-center leading-relaxed px-2">
            {steps[step].content}
          </p>

          {/* 进度指示 */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === step 
                    ? 'w-8 bg-gradient-to-r from-pink-400 to-rose-400' 
                    : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* 按钮 */}
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              className="flex-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100" 
              onClick={handleSkip}
            >
              跳过 ({countdown}s)
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full shadow-lg"
              onClick={handleNext}
            >
              {step === steps.length - 1 ? '开始游戏 🎮' : '下一步 →'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
