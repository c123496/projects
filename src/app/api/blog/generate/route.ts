import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const config = new Config();

// LLM 生成恋爱沟通技巧文章
export async function POST(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(config, customHeaders);

    // 系统提示词
    const systemPrompt = `你是一位专业的恋爱心理咨询师和情感专栏作家。你需要写一篇关于恋爱沟通技巧的文章。

文章要求：
1. 标题要吸引眼球，能引起读者共鸣
2. 内容要有实用价值，提供具体的建议和技巧
3. 语言风格要轻松幽默，像朋友之间的对话
4. 可以使用emoji来增加趣味性
5. 文章结构要清晰，有明确的小标题
6. 内容长度适中，约800-1500字

输出格式（严格遵循JSON格式）：
{
  "title": "文章标题",
  "summary": "文章摘要（50字以内，引起读者兴趣）",
  "content": "文章正文（使用换行符分隔段落）",
  "icon": "合适的emoji图标",
  "read_time": "预计阅读时间（如：3分钟、5分钟）"
}

注意：
- 标题要有趣且实用，避免过于学术化
- 摘要要有吸引力，让读者想点进来看
- 正文要分段落，每段不要太长
- 可以用 ❌ 和 ✅ 来对比错误和正确的做法
- icon 选择与主题相关的emoji`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: '请写一篇关于恋爱沟通技巧的文章，主题可以是：如何倾听、如何表达关心、如何处理分歧、如何给予情绪价值等。随机选择一个主题，写出有深度又有趣的文章。直接输出JSON格式的结果，不要有任何其他文字。',
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.9,
    });

    // 解析 LLM 返回的 JSON
    let articleData;
    try {
      // 尝试提取 JSON
      let jsonStr = response.content.trim();
      // 如果有 markdown 代码块，提取其中的 JSON
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      articleData = JSON.parse(jsonStr);
    } catch {
      console.error('解析 LLM 返回的 JSON 失败:', response.content);
      return NextResponse.json(
        { success: false, error: 'AI 生成的内容格式有误，请重试' },
        { status: 500 }
      );
    }

    // 验证必要字段
    if (!articleData.title || !articleData.summary || !articleData.content) {
      return NextResponse.json(
        { success: false, error: 'AI 生成的文章缺少必要字段' },
        { status: 500 }
      );
    }

    // 保存到数据库
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('blog_posts')
      .insert({
        title: articleData.title,
        summary: articleData.summary,
        content: articleData.content,
        icon: articleData.icon || '📝',
        read_time: articleData.read_time || '3分钟',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`保存文章到数据库失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        title: data.title,
        summary: data.summary,
        content: data.content,
        icon: data.icon,
        read_time: data.read_time,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    console.error('生成文章失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '生成失败' },
      { status: 500 }
    );
  }
}
