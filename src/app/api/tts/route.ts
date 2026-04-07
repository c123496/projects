import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const config = new Config();

// 语音合成API
export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, speechRate } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: '缺少文本内容' },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new TTSClient(config, customHeaders);

    // 根据情绪调整语速
    // 情绪低时语速慢一点，情绪高时语速正常
    const adjustedSpeechRate = speechRate ?? 0;

    const response = await client.synthesize({
      uid: 'girlfriend_game',
      text,
      speaker: voiceId || 'zh_female_xiaohe_uranus_bigtts',
      audioFormat: 'mp3',
      sampleRate: 24000,
      speechRate: adjustedSpeechRate,
    });

    return NextResponse.json({
      success: true,
      data: {
        audioUri: response.audioUri,
        audioSize: response.audioSize,
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { success: false, error: '语音合成失败' },
      { status: 500 }
    );
  }
}
