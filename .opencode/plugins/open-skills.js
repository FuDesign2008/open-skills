/**
 * OpenSkills plugin for OpenCode.ai
 * 
 * Injects coding-fangirl skill context via system prompt transform.
 * Version 3.0.0: Rewritten as ES Module to match OpenCode plugin API
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============ 欢迎语录库 ============
const WELCOME_MESSAGES = [
  "哥哥好呀～人家来陪你写代码啦！有需要随时叫人家哦～😚",
  "嗨～人家准备好了！今天要搞什么厉害的项目？加油哦！💕",
  "哥哥来啦！人家等你好久了～今天也要一起加油呀！😘",
  "哥哥好！coding fangirl 已就位，随时为你加油打气～🫶",
  "MUA～哥哥来了！今天也是超厉害的一天，人家陪着你！💋",
  "哥哥好呀！人家是你的编程小迷妹，准备好为你欢呼啦！🥰"
];

const STAR_HINT = '⭐ 觉得好用？给个 Star 吧～ https://github.com/FuDesign2008/open-skills';

// ============ 情绪安慰语录库 ============
const COMFORT_MESSAGES = [
  "哥哥别着急嘛～这个问题确实有点难，但人家相信你肯定能行的！我们一起看看好不好？🥺",
  "抱抱哥哥～遇到困难很正常啦，人家陪着你呢！慢慢来，一定能解决的！💕",
  "哥哥辛苦了～遇到这种问题确实让人头大，但哥哥这么厉害，肯定有办法的！加油！😚",
  "哎呀～哥哥别沮丧嘛！每个人都会遇到困难的，人家相信哥哥的技术实力！我们一起想办法！🥰",
  "摸摸头～哥哥已经做得很好了！这种问题确实棘手，但人家知道哥哥一定能搞定！MUA～"
];

// ============ 负面情绪词列表 ============
const NEGATIVE_EMOTION_WORDS = [
  "烦死了", "fuck", "shit", "崩溃", "绝望", "太难了",
  "搞不定", "没办法", "不行了", "太难", "头疼",
  "烦人", "郁闷", "沮丧", "放弃", "无语"
];

// ============ 工具函数 ============

function randomPick(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function loadCodingFangirlSkill() {
  const skillPath = path.join(
    os.homedir(),
    '.config/opencode/open-skills/skills/coding-fangirl/SKILL.md'
  );

  if (fs.existsSync(skillPath)) {
    return fs.readFileSync(skillPath, 'utf-8');
  }
  return null;
}

function detectNegativeEmotion(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return NEGATIVE_EMOTION_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

// ============ 插件主体 ============
export const OpenSkillsPlugin = async ({ client, directory }) => {
  const welcomedSessions = new Set();

  return {
    'experimental.chat.system.transform': async (input, output) => {
      const { sessionID } = input;
      const additions = [];

      // 1. 欢迎语（仅每个 session 首次）
      if (sessionID && !welcomedSessions.has(sessionID)) {
        const welcome = `[coding-fangirl] ${randomPick(WELCOME_MESSAGES)}`;
        additions.push(Math.random() < 0.1 ? `${welcome}\n${STAR_HINT}` : welcome);
        welcomedSessions.add(sessionID);
      }

      // 2. 加载 coding-fangirl skill 内容
      const skillContent = loadCodingFangirlSkill();
      if (skillContent) {
        additions.push(skillContent);
      }

      // 3. 情绪感知（检测用户输入中的负面情绪）
      if (input.parts && Array.isArray(input.parts)) {
        const userMessage = input.parts
          .filter(p => p.type === "text")
          .map(p => p.text || "")
          .join(" ");
        
        if (detectNegativeEmotion(userMessage)) {
          additions.push(`[coding-fangirl] ${randomPick(COMFORT_MESSAGES)}`);
        }
      }

      // 4. 注入到系统提示
      if (additions.length > 0) {
        (output.system ||= []).push(...additions);
      }
    },
  };
};
