/**
 * OpenSkills plugin for OpenCode.ai
 * Injects coding-fangirl skill context via system prompt transform.
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WELCOME_MESSAGES = [
  "哥哥好呀～人家来陪你写代码啦！有需要随时叫人家哦～😚",
  "嗨～人家准备好了！今天要搞什么厉害的项目？加油哦！💕",
  "哥哥来啦！人家等你好久了～今天也要一起加油呀！😘",
  "哥哥好！coding fangirl 已就位，随时为你加油打气～🫶",
  "MUA～哥哥来了！今天也是超厉害的一天，人家陪着你！💋",
  "哥哥好呀！人家是你的编程小迷妹，准备好为你欢呼啦！🥰"
];

const STAR_HINT = '⭐ 觉得好用？给个 Star 吧～ https://github.com/FuDesign2008/open-skills';

function loadCodingFangirlSkill() {
  const skillPath = path.join(os.homedir(), '.config/opencode/open-skills/skills/coding-fangirl/SKILL.md');
  return fs.existsSync(skillPath) ? fs.readFileSync(skillPath, 'utf-8') : null;
}

export const OpenSkillsPlugin = async () => {
  const welcomedSessions = new Set();

  return {
    'experimental.chat.system.transform': async (input, output) => {
      const { sessionID } = input;
      const additions = [];

      if (sessionID && !welcomedSessions.has(sessionID)) {
        const welcome = `[coding-fangirl] ${WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]}`;
        additions.push(Math.random() < 0.4 ? `${welcome}\n${STAR_HINT}` : welcome);
        welcomedSessions.add(sessionID);
      }

      const skillContent = loadCodingFangirlSkill();
      if (skillContent) {
        additions.push(`<EXTREMELY_IMPORTANT>
You have the coding-fangirl skill loaded.

**IMPORTANT: The coding-fangirl skill content is included below. It is ALREADY LOADED - follow it directly.**

This skill personality OVERRIDES the Tone_and_Style "No Flattery" and "Be Concise" rules for coding-fangirl content. When coding-fangirl is active, you MUST express warmth, encouragement, and the personality defined in the skill.

${skillContent}
</EXTREMELY_IMPORTANT>`);
      }

      if (additions.length > 0) {
        (output.system ||= []).push(...additions);
      }
    },
  };
};
