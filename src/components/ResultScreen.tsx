'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PERSONALITIES, SCENARIOS, type RoundHistory } from '@/lib/game-config';

interface ResultScreenProps {
  isWin: boolean;
  finalScore: number;
  totalRounds: number;
  totalTime: number;
  history: RoundHistory[];
  personality: typeof PERSONALITIES[number];
  scenario: typeof SCENARIOS[number];
  completedScenarios?: string[];
  onRestart: () => void;
  onChangeSettings: () => void;
}

export function ResultScreen({
  isWin,
  finalScore,
  totalRounds,
  totalTime,
  history,
  personality,
  scenario,
  completedScenarios = [],
  onRestart,
  onChangeSettings,
}: ResultScreenProps) {
  const correctCount = history.filter(h => h.isCorrect).length;
  const wrongCount = history.length - correctCount;
  const accuracy = history.length > 0 ? Math.round((correctCount / history.length) * 100) : 0;
  const timeInSeconds = Math.round(totalTime / 1000);

  // 生成结束语
  const getEndingMessage = () => {
    if (isWin) {
      // 如果完成了所有场景
      if (completedScenarios.length >= SCENARIOS.length) {
        return '太棒了！你成功哄好了所有场景的我！看来你是真的很在乎我呢~我原谅你啦！爱你！';
      }
      
      // 根据最后一个完成的场景生成
      const lastCompleted = completedScenarios[completedScenarios.length - 1];
      switch (lastCompleted) {
        case 'forgot_cooking':
          return '好吧，看在你这么诚恳的份上，这次就原谅你啦~下次记得给我做好吃的哦！';
        case 'forgot_anniversary':
          return '虽然你忘了纪念日让我很伤心，但你的态度让我感觉到你还是很在乎我的...这次就算啦！';
        case 'forgot_laundry':
          return '算了算了，看你这么会说话，我就不生气啦~不过下次要记得哦！';
        case 'forgot_gift':
          return '哼，看在你这么会哄人的份上，这次就不跟你计较啦~礼物嘛，补上就行！';
        default:
          return '好啦好啦，我原谅你了~你真会哄人呢！';
      }
    } else {
      // 失败时根据当前场景生成
      switch (scenario.id) {
        case 'forgot_cooking':
          return '做饭都能忘，你是不是根本不在乎我？我生气了！';
        case 'forgot_anniversary':
          return '纪念日都能忘，我们在一起的意义是什么？你根本不爱我！';
        case 'forgot_laundry':
          return '连洗衣服这种小事都做不到，我对你太失望了！';
        case 'forgot_gift':
          return '礼物都不买，你是不是有了别人？别理我了！';
        default:
          return '你根本不会哄人！我更生气了！';
      }
    }
  };

  // 生成建议
  const getTips = () => {
    const tips: string[] = [];
    
    if (isWin) {
      tips.push('你的哄人技巧很棒！');
      if (completedScenarios.length > 0) {
        tips.push(`成功完成了 ${completedScenarios.length} 个场景的挑战！`);
      }
      if (correctCount > wrongCount) {
        tips.push('大部分选项都选对了，继续保持！');
      }
      if (totalRounds <= 10) {
        tips.push('快速哄好女朋友，效率很高！');
      }
    } else {
      tips.push('别灰心，多练习几次就会啦！');
      if (wrongCount > correctCount) {
        tips.push('注意观察女朋友的情绪变化，选对正确的回应');
      }
    }

    return tips;
  };

  // 生成改进建议
  const getImprovements = () => {
    const improvements: string[] = [];
    
    // 分析错误选项
    const wrongAnswers = history.filter(h => !h.isCorrect);
    if (wrongAnswers.length > 0) {
      improvements.push('有些选项看似有道理，但实际会踩雷，要小心哦');
    }

    if (finalScore < 30) {
      improvements.push('尝试更温柔、更真诚的表达方式');
    }

    return improvements;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 结果卡片 */}
        <Card className="bg-white/90 backdrop-blur shadow-lg mb-6 overflow-hidden">
          {/* 顶部装饰 */}
          <div className={`h-2 ${isWin ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-pink-500'}`} />
          
          <CardHeader className="text-center pb-2">
            <div className="text-6xl mb-2">
              {isWin ? '🎉' : '😢'}
            </div>
            <CardTitle className="text-2xl">
              {isWin 
                ? (completedScenarios.length >= SCENARIOS.length 
                    ? '恭喜你通关所有场景！' 
                    : '恭喜你哄好她了！')
                : '很遗憾，她更生气了...'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 女朋友的话 */}
            <div className="bg-pink-50 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center text-xl flex-shrink-0">
                  {personality.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">{personality.name}说：</p>
                  <p className="text-gray-800">{getEndingMessage()}</p>
                </div>
              </div>
            </div>

            {/* 已完成场景 */}
            {completedScenarios.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">完成的场景</h3>
                <div className="flex flex-wrap gap-2">
                  {completedScenarios.map(id => {
                    const s = SCENARIOS.find(sc => sc.id === id);
                    return s ? (
                      <Badge key={id} className="bg-green-100 text-green-700 border-green-200">
                        ✓ {s.icon} {s.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* 统计数据 */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-purple-600">{totalRounds}</p>
                <p className="text-sm text-gray-500">总回合</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                <p className="text-sm text-gray-500">答对</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-red-500">{wrongCount}</p>
                <p className="text-sm text-gray-500">答错</p>
              </div>
            </div>

            {/* 详细统计 */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>正确率</span>
                  <span className="font-medium">{accuracy}%</span>
                </div>
                <Progress value={accuracy} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>最终脾气值</span>
                  <span className="font-medium">{finalScore}/100</span>
                </div>
                <Progress value={finalScore} className="h-2" />
              </div>
              <div className="flex justify-between text-sm">
                <span>用时</span>
                <span className="font-medium">{Math.floor(timeInSeconds / 60)}分{timeInSeconds % 60}秒</span>
              </div>
            </div>

            {/* 选择回顾 */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">选择回顾</h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {history.map((h, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-sm p-2 rounded ${
                      h.isCorrect ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <span>{h.isCorrect ? '✅' : '❌'}</span>
                    <span className="flex-1 truncate">
                      第{h.round}轮：{h.options[h.selectedIndex]}
                    </span>
                    <span className={h.isCorrect ? 'text-green-600' : 'text-red-500'}>
                      {h.scoreChange > 0 ? '+' : ''}{h.scoreChange}分
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 建议 */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">哄人小贴士</h3>
              <div className="space-y-2">
                {getTips().map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
                {getImprovements().map((improvement, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-500">📝</span>
                    <span>{improvement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 继续挑战建议 */}
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm text-purple-700">
                {isWin 
                  ? (completedScenarios.length >= SCENARIOS.length 
                      ? '🎊 你已经通关所有场景！试试更高难度的性格吧！'
                      : '💪 继续挑战下一个场景，或者试试更高难度的性格？')
                  : '🔄 再试一次？换个方式哄她，也许就成功啦！'}
              </p>
            </div>

            {/* 底部按钮 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onChangeSettings}
              >
                换个场景
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                onClick={onRestart}
              >
                再来一局
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 当前设置显示 */}
        <div className="text-center text-sm text-gray-500">
          <p>
            {personality.emoji} {personality.name} | 完成 {completedScenarios.length}/{SCENARIOS.length} 个场景
          </p>
        </div>
      </div>
    </div>
  );
}
