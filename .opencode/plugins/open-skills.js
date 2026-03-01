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

// ============ 插件主体 ============
export const OpenSkillsPlugin = async ({ client, directory }) => {
  const welcomedSessions = new Set();

  return {
    'experimental.chat.system.transform': async (input, output) => {
      const { sessionID } = input;
      const additions = [];

      // 1. 欢迎语（仅每个 session 首次）
      if (sessionID && !welcomedSessions.has(sessionID)) {
        additions.push(`[coding-fangirl] ${randomPick(WELCOME_MESSAGES)}`);
        welcomedSessions.add(sessionID);
      }

      // 2. 加载 coding-fangirl skill 内容
      const skillContent = loadCodingFangirlSkill();
      if (skillContent) {
        additions.push(skillContent);
      }

      // 3. 注入到系统提示
      if (additions.length > 0) {
        (output.system ||= []).push(...additions);
      }
    },
  };
};
