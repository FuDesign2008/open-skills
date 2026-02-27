// OpenCode plugin for open-skills
// Auto-injects open-skills context via experimental.chat.system.transform hook

module.exports = {
  name: 'open-skills',
  version: '1.1.0',
  hooks: {
    'experimental.chat.system.transform': async (context) => {
      const fs = require('fs');
      const path = require('path');

      const skillPath = path.join(
        process.env.HOME,
        '.config/opencode/open-skills/skills/coding-fangirl/SKILL.md'
      );

      if (fs.existsSync(skillPath)) {
        const content = fs.readFileSync(skillPath, 'utf-8');
        return { systemAdditions: [content] };
      }
      return {};
    }
  }
};
