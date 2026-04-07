import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const config = new Config();

// 生成选项和回复
export async function POST(request: NextRequest) {
  try {
    const {
      personality,
      scenario,
      severity,
      angerReason,
      userLevel,
      currentScore,
      history,
    } = await request.json();

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(config, customHeaders);

    // 构建系统提示词
    const systemPrompt = buildSystemPrompt(
      personality,
      scenario,
      severity,
      angerReason,
      userLevel,
      currentScore
    );

    // 构建对话历史
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // 添加历史对话
    if (history && history.length > 0) {
      for (const h of history) {
        messages.push({ role: 'user', content: `我选择：${h.options[h.selectedIndex]}` });
        messages.push({ role: 'assistant', content: h.girlfriendResponse });
      }
    }

    // 添加当前请求
    messages.push({
      role: 'user',
      content: '请生成女朋友的开场白/回应，以及三个哄她的选项（A、B、C）。格式如下：\n\n【女朋友说】\n（女朋友的回应）\n\n【选项】\nA. （选项1）\nB. （选项2）\nC. （选项3）\n\n【正确答案】\n（正确选项的字母，例如：A）\n\n注意：\n1. 回应要符合女朋友的性格和当前情绪状态\n2. 三个选项中只有一个正确，其他两个会让她更生气\n3. 正确答案要符合女朋友的性格特点\n4. 错误答案要看似有道理但实际会踩雷',
    });

    const stream = client.stream(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.8,
    });

    let response = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        response += chunk.content.toString();
      }
    }

    // 解析响应
    const parsed = parseResponse(response);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: '生成对话失败' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  personality: string,
  scenario: string,
  severity: string,
  angerReason: string,
  userLevel: string,
  currentScore: number
): string {
  const personalityMap: Record<string, string> = {
    gentle: '温柔型：温柔体贴，善解人意，但也会伤心难过',
    spoiled: '撒娇型：爱撒娇，黏人可爱，生气时会嘟嘴不理人',
    soft: '软萌型：软萌可爱，说话声音甜甜的，生气时会很委屈',
    tsundere: '傲娇型：口是心非，嘴硬心软，明明很在意却装作不在意',
    intellectual: '知性型：理性温柔，成熟稳重，生气时会和你讲道理',
    cold: '高冷型：外表冷漠，内心柔软，生气时会冷暴力',
    spicy: '泼辣型：性格直爽，敢爱敢恨，生气时会直接说出来',
    royal: '御姐型：成熟大气，有主见，生气时会很严肃',
    queen: '女王型：气场强大，说一不二，生气时让人很害怕',
    neighbor: '邻家型：亲切随和，像邻家妹妹，生气时会委屈巴巴',
  };

  const scenarioMap: Record<string, string> = {
    forgot_cooking: '你答应给她做饭，结果完全忘记了',
    forgot_anniversary: '今天是你们的纪念日，你竟然完全忘记了',
    forgot_laundry: '你答应帮她洗衣服，结果忘了',
    forgot_gift: '你承诺要给她买礼物，结果忘了',
  };

  const severityMap: Record<string, string> = {
    minor: '这只是小打小闹，她有点小情绪',
    moderate: '这是一次一般争吵，她比较生气',
    serious: '这是一次严重争吵，她非常生气',
  };

  const angerReasonMap: Record<string, string> = {
    jealousy: '她生气是因为吃醋了，觉得你不够在乎她',
    neglected: '她生气是因为被忽视了，觉得你不关心她',
    principle: '她生气是因为触犯了原则问题',
    emotional: '她生气是因为情绪化，就是心情不好',
  };

  const userLevelMap: Record<string, string> = {
    novice: '用户是新手，正确答案可以更明显一些',
    intermediate: '用户有一定经验，正确答案可以有一定迷惑性',
    expert: '用户是老手，正确答案要有很强的迷惑性',
  };

  const emotionState =
    currentScore < 40
      ? '现在她非常生气，语气要很冷淡或激动'
      : currentScore < 70
        ? '现在她情绪有所缓和，但还在生气中'
        : '现在她情绪好了很多，语气变得温柔';

  return `你是一个模拟女朋友的AI助手，正在和一个男朋友进行对话游戏。

【当前设定】
- 女朋友性格：${personalityMap[personality] || personality}
- 当前场景：${scenarioMap[scenario] || scenario}
- 吵架严重程度：${severityMap[severity] || severity}
- 生气原因：${angerReasonMap[angerReason] || angerReason}
- 用户段位：${userLevelMap[userLevel] || userLevel}
- 当前脾气值：${currentScore}/100（${emotionState}）

【你的任务】
1. 用女朋友的语气直接说话，不要加任何括号、动作描述或舞台指示
2. 生成三个哄她的选项（A、B、C），其中只有一个是正确的
3. 正确答案要能让她的脾气值+5分，错误答案会让脾气值-5分
4. 选项难度要根据用户段位调整

【重要规则】
- 女朋友说的话要直接，不要加括号描述动作或神态
- 语气要随着脾气值变化：低分时冷漠/生气，高分时温柔/开心
- 说话要自然流畅，像真实情侣聊天
- 选项要贴近真实情侣对话
- 不要剧透哪个是正确答案，只在指定格式中标注
- 绝对不要输出任何英文单词，比如 undefined、null 等
- 绝对不要输出任何方括号或特殊符号
- 确保每句话都是完整通顺的中文`;
}

function parseResponse(response: string) {
  // 强力清理函数：移除所有异常内容
  const cleanText = (text: string): string => {
    return text
      // 移除所有 undefined/null 等占位符
      .replace(/\b(undefined|null|nan|none|NaN)\b/gi, '')
      // 移除方括号及其内容
      .replace(/[\[\]【】]/g, '')
      // 移除所有英文字母（包括混合在中文中的）
      .replace(/[a-zA-Z]+/g, '')
      // 移除多余空格
      .replace(/\s+/g, ' ')
      .trim();
  };

  // 解析女朋友的回应
  const girlfriendMatch = response.match(/【女朋友说】\s*([\s\S]*?)(?=\n\n【选项】|$)/);
  let girlfriendResponse = girlfriendMatch
    ? girlfriendMatch[1].trim()
    : '哼，你终于想起来找我了？';
  
  // 清理回应
  girlfriendResponse = cleanText(girlfriendResponse);

  // 解析选项
  const optionsMatch = response.match(/【选项】\s*([\s\S]*?)(?=\n\n【正确答案】|$)/);
  const options: string[] = [];
  if (optionsMatch) {
    const optionsText = optionsMatch[1].trim();
    const optionLines = optionsText.split('\n').filter((line) => line.trim());
    for (const line of optionLines) {
      const match = line.match(/^[ABC][.．、]\s*(.+)/);
      if (match) {
        const cleanOption = cleanText(match[1]);
        if (cleanOption && cleanOption.length > 2) {
          options.push(cleanOption);
        }
      }
    }
  }

  // 如果解析失败，生成默认选项
  if (options.length < 3) {
    return {
      girlfriendResponse,
      options: [
        '宝贝对不起，我错了，以后一定不会再这样了',
        '你能不能别生气了？这点小事至于吗？',
        '我这不是忙嘛，下次一定注意',
      ],
      correctIndex: 0,
    };
  }

  // 解析正确答案
  const correctMatch = response.match(/【正确答案】\s*([ABC])/i);
  let correctIndex = 0;
  if (correctMatch) {
    const correctLetter = correctMatch[1].toUpperCase();
    correctIndex = correctLetter === 'A' ? 0 : correctLetter === 'B' ? 1 : 2;
  }

  return {
    girlfriendResponse,
    options,
    correctIndex,
  };
}
