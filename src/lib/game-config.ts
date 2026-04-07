// 游戏配置文件

// 女朋友性格配置（10种）
export const PERSONALITIES = [
  {
    id: 'gentle',
    name: '温柔型',
    description: '温柔体贴，善解人意',
    style: 'sweet',
    voiceId: 'zh_female_xiaohe_uranus_bigtts',
    emoji: '🌸',
  },
  {
    id: 'spoiled',
    name: '撒娇型',
    description: '爱撒娇，黏人又可爱',
    style: 'sweet',
    voiceId: 'zh_female_meilinvyou_saturn_bigtts',
    emoji: '💕',
  },
  {
    id: 'soft',
    name: '软萌型',
    description: '软萌可爱，声音甜甜的',
    style: 'sweet',
    voiceId: 'saturn_zh_female_keainvsheng_tob',
    emoji: '🥰',
  },
  {
    id: 'tsundere',
    name: '傲娇型',
    description: '口是心非，嘴硬心软',
    style: 'sweet',
    voiceId: 'saturn_zh_female_tiaopigongzhu_tob',
    emoji: '😤',
  },
  {
    id: 'intellectual',
    name: '知性型',
    description: '理性温柔，成熟稳重',
    style: 'sweet',
    voiceId: 'saturn_zh_female_cancan_tob',
    emoji: '📚',
  },
  {
    id: 'cold',
    name: '高冷型',
    description: '外表冷漠，内心柔软',
    style: 'strong',
    voiceId: 'zh_female_vv_uranus_bigtts',
    emoji: '❄️',
  },
  {
    id: 'spicy',
    name: '泼辣型',
    description: '性格直爽，敢爱敢恨',
    style: 'strong',
    voiceId: 'zh_female_jitangnv_saturn_bigtts',
    emoji: '🔥',
  },
  {
    id: 'royal',
    name: '御姐型',
    description: '成熟大气，有主见',
    style: 'strong',
    voiceId: 'zh_female_santongyongns_saturn_bigtts',
    emoji: '👑',
  },
  {
    id: 'queen',
    name: '女王型',
    description: '气场强大，说一不二',
    style: 'strong',
    voiceId: 'zh_female_mizai_saturn_bigtts',
    emoji: '💎',
  },
  {
    id: 'neighbor',
    name: '邻家型',
    description: '亲切随和，像邻家妹妹',
    style: 'sweet',
    voiceId: 'zh_female_xueayi_saturn_bigtts',
    emoji: '🏠',
  },
] as const;

// 吵架场景配置
export const SCENARIOS = [
  {
    id: 'forgot_cooking',
    name: '忘记做饭',
    description: '答应做饭却忘记了',
    icon: '🍳',
  },
  {
    id: 'forgot_anniversary',
    name: '忘记纪念日',
    description: '重要纪念日竟然忘了',
    icon: '💝',
  },
  {
    id: 'forgot_laundry',
    name: '忘记洗衣服',
    description: '答应洗衣服结果没洗',
    icon: '👕',
  },
  {
    id: 'forgot_gift',
    name: '忘记买礼物',
    description: '说好买礼物却忘了',
    icon: '🎁',
  },
] as const;

// 吵架严重程度
export const SEVERITY_LEVELS = [
  { id: 'minor', name: '小打小闹', multiplier: 1, icon: '🌸' },
  { id: 'moderate', name: '一般争吵', multiplier: 1.5, icon: '🌩️' },
  { id: 'serious', name: '严重争吵', multiplier: 2, icon: '💥' },
] as const;

// 生气原因
export const ANGER_REASONS = [
  { id: 'jealousy', name: '吃醋型', description: '因为你和别人走得近', icon: '💔' },
  { id: 'neglected', name: '被忽视型', description: '觉得你不关心她', icon: '🥺' },
  { id: 'principle', name: '原则问题型', description: '触犯了她的底线', icon: '⚠️' },
  { id: 'emotional', name: '情绪化型', description: '就是心情不好', icon: '😢' },
] as const;

// 用户段位
export const USER_LEVELS = [
  { id: 'novice', name: '新手', description: '完全不会哄', icon: '🌱' },
  { id: 'intermediate', name: '有一定经验', description: '偶尔能哄好', icon: '🌿' },
  { id: 'expert', name: '老手', description: '哄人高手', icon: '🌳' },
] as const;

// 成就配置
export const ACHIEVEMENTS = [
  // 基础成就
  { id: 'first_win', name: '初战告捷', description: '第一次成功哄好女朋友', icon: '🏆', hidden: false },
  { id: 'win_10', name: '哄人小能手', description: '累计成功哄好10次', icon: '⭐', hidden: false },
  { id: 'win_50', name: '哄人达人', description: '累计成功哄好50次', icon: '🌟', hidden: false },
  { id: 'win_100', name: '哄人大师', description: '累计成功哄好100次', icon: '💫', hidden: false },
  
  // 场景成就
  { id: 'all_scenarios', name: '全能男友', description: '成功通关所有场景', icon: '🎖️', hidden: false },
  
  // 性格成就
  { id: 'all_personalities', name: '百变情人', description: '成功哄好所有性格的女朋友', icon: '🎭', hidden: false },
  
  // 隐藏成就
  { id: 'perfect_game', name: '完美发挥', description: '一局游戏全部答对', icon: '👑', hidden: true },
  { id: 'comeback', name: '绝地翻盘', description: '从10分以下成功哄好', icon: '🔥', hidden: true },
  { id: 'speed_demon', name: '光速哄好', description: '5轮内成功哄好', icon: '⚡', hidden: true },
  { id: 'streak_10', name: '十连胜', description: '连续成功哄好10次', icon: '🎯', hidden: true },
  { id: 'hard_mode', name: '地狱难度', description: '严重争吵+女王型+新手 成功哄好', icon: '💀', hidden: true },
] as const;

// 游戏配置
export const GAME_CONFIG = {
  initialScore: 20,
  winScore: 100,
  loseScore: 0,
  correctPoints: 5,
  wrongPoints: -5,
  minScore: 0,
  maxScore: 100,
} as const;

// 类型定义
export type Personality = typeof PERSONALITIES[number];
export type Scenario = typeof SCENARIOS[number];
export type SeverityLevel = typeof SEVERITY_LEVELS[number];
export type AngerReason = typeof ANGER_REASONS[number];
export type UserLevel = typeof USER_LEVELS[number];
export type Achievement = typeof ACHIEVEMENTS[number];

export interface GameSettings {
  personalityId: string;
  scenarioId: string;
  severityId: string;
  angerReasonId: string;
  userLevelId: string;
}

export interface GameState {
  settings: GameSettings;
  currentScore: number;
  rounds: number;
  history: RoundHistory[];
  startTime: number;
  currentScenarioId: string;
  unlockedAchievements: string[];
}

export interface RoundHistory {
  round: number;
  scenarioId: string;
  options: string[];
  selectedIndex: number;
  isCorrect: boolean;
  girlfriendResponse: string;
  scoreChange: number;
}

export interface GameResult {
  isWin: boolean;
  finalScore: number;
  totalRounds: number;
  totalTime: number;
  settings: GameSettings;
  history: RoundHistory[];
  achievements: string[];
  tips: string[];
  goodPoints: string[];
  improvePoints: string[];
}
