# Open Skills

![GitHub stars](https://img.shields.io/github/stars/FuDesign2008/open-skills?style=flat-square)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/FuDesign2008/open-skills)
[![Version](https://img.shields.io/github/v/release/FuDesign2008/open-skills?style=flat-square)](https://github.com/FuDesign2008/open-skills/releases)
![Skills](https://img.shields.io/badge/skills-11-informational?style=flat-square)
![Commands](https://img.shields.io/badge/commands-2-informational?style=flat-square)

**English** | **[中文](README.zh-CN.md)**

<!-- banner -->
```text
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                        ║
║    ██████╗ ██████╗ ███████╗███╗   ██╗    ███████╗██╗  ██╗██╗██╗     ██╗     ███████╗   ║
║   ██╔═══██╗██╔══██╗██╔════╝████╗  ██║    ██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝   ║
║   ██║   ██║██████╔╝█████╗  ██╔██╗ ██║    ███████╗█████╔╝ ██║██║     ██║     ███████╗   ║
║   ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║    ╚════██║██╔═██╗ ██║██║     ██║     ╚════██║   ║
║   ╚██████╔╝██║     ███████╗██║ ╚████║    ███████║██║  ██╗██║███████╗███████╗███████║   ║
║    ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝    ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝   ║
║                                                                                        ║
║   THE OPEN AGENT SKILLS ECOSYSTEM                                                      ║
║                                                                                        ║
║   Claude Code • Cursor • OpenCode                                                      ║
║                                                                                        ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
```
<!-- /banner -->

An open library of agent skills — workflows, performance, Jira, Git, and more. Supports **Claude Code**, **Cursor**, and **OpenCode**. Full skill list (versions and triggers) at **[Skills Index](docs/generated/skills-index.md)**.

> 💕 **AI Coding Companion** (coding-fangirl) has moved to **[oh-my-fangirl](https://github.com/FuDesign2008/oh-my-fangirl)** with independent versioning and a richer mode ecosystem.

<a id="install-path"></a>

## Install & Update

Non-interactive global install (recommended; avoids PromptScript ✗ noise):

```bash
git clone https://github.com/FuDesign2008/open-skills.git
cd open-skills
node scripts/install-skills.mjs
```

Or interactive / single-agent via the underlying CLI:

```bash
npx skills add FuDesign2008/open-skills -g
```

Update:

```bash
npx skills update
```

> Need **slash commands, hooks, or native platform integration** (Claude Code / Cursor / OpenCode full install)? See **[Installation Guide](docs/INSTALL.md)**.


## Contributing

1. Fork → add or modify `skills/<name>/SKILL.md`
2. Run `node scripts/gen-skill-docs.mjs` to regenerate the index and commit `docs/generated/skills-index.md` (**do not edit manually** — CI `verify` will fail)
3. Follow [AGENTS.md](AGENTS.md) for coding standards and skill conventions
4. Pull Request

See [AGENTS.md](AGENTS.md) for skill authoring specs and repo conventions.

## License

MIT License — see [LICENSE](LICENSE).
