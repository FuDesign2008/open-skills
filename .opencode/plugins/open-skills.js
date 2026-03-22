/**
 * OpenSkills plugin for OpenCode.ai
 * Injects open-skills system prompt (workflows, utilities).
 */

const STAR_HINT = '⭐ 觉得好用？给个 Star 吧～ https://github.com/FuDesign2008/open-skills';

export const OpenSkillsPlugin = async () => {
  const welcomedSessions = new Set();

  return {
    'experimental.chat.system.transform': async (input, output) => {
      const { sessionID } = input;

      if (sessionID && !welcomedSessions.has(sessionID)) {
        welcomedSessions.add(sessionID);
        if (Math.random() < 0.1) {
          (output.system ||= []).push(STAR_HINT);
        }
      }
    },
  };
};
