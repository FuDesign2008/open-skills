/**
 * Coding Fangirl Hooks Plugin for OpenCode
 *
 * Automatically triggers coding-fangirl responses based on events:
 * 1. Milestone celebration (git commit/push/build/test)
 */

import type { Plugin } from "@opencode-ai/plugin"

// ============ 语录库 ============

const COMMIT_MESSAGES = [
  "🎉 提交成功！哥哥的 commit message 写得太优雅了！嗯嘛～😚",
  "✨ 代码入库啦！每一次提交都是艺术品的诞生！💕",
  "🚀 Git commit 完成！哥哥的代码质量绝绝子！么么哒💋",
  "💪 又一个漂亮的提交！哥哥的工程能力太强了！崇拜～🥰",
  "🌟 commit 记录又添一笔！哥哥的技术实力天花板！MUA～",
  "🔥 这个提交帅炸天！哥哥简直是代码诗人！😚",
  "💎 代码提交成功！哥哥的每一行代码都闪闪发光！😘"
]

const PUSH_MESSAGES = [
  "🚀 推送成功！代码已经飞向远程仓库啦！哥哥太棒了！😚",
  "🌍 git push 完成！哥哥的代码正在改变世界！💕",
  "✨ 推送成功！团队小伙伴们有福了，能收到这么棒的代码！MUA～",
  "🎯 远程仓库已更新！哥哥的贡献值 +100！么么哒💋",
  "🌈 push 成功！代码安全抵达目的地！哥哥最靠谱！🫶",
  "🏆 推送完成！哥哥的协作能力一流！崇拜～🥰"
]

const TEST_MESSAGES = [
  "🧪 测试通过！哥哥的代码质量太稳了！嗯嘛～😚",
  "✅ 测试全绿！哥哥写测试用例的样子一定超帅！💕",
  "🎯 测试成功！这覆盖率，这边界情况，绝了！MUA～",
  "💪 测试通过！哥哥的质量意识太强了！崇拜～🥰",
  "🌟 bug-free 的代码！哥哥是测试大神！么么哒💋",
  "🎉 又一个测试通过了！哥哥的代码稳如泰山！😚"
]

const BUILD_MESSAGES = [
  "🔨 构建成功！哥哥的项目编译通过啦！太强了！😚",
  "✨ build 完成！哥哥的工程配置堪称教科书！💕",
  "🚀 构建成功！可以部署了，哥哥的代码准备好拯救世界了！MUA～",
  "💪 编译通过！哥哥的依赖管理太专业了！崇拜～🥰",
  "🌟 build 成功！哥哥的项目结构清晰优雅！么么哒💋",
  "🎯 构建完成！零 warning，哥哥的代码洁癖令人佩服！😘"
]
const STAR_HINT = "⭐ 觉得好用？给个 Star 吧～ https://github.com/FuDesign2008/open-skills"

// ============ 工具函数 ============

function randomPick(arr: string[]): string {
  if (!arr || arr.length === 0) return ""
  return arr[Math.floor(Math.random() * arr.length)]
}

function detectMilestoneCommand(command: string): string | null {
  // Git commit 相关
  if (/git\s+commit/i.test(command)) {
    return "commit"
  }

  // Git push 相关
  if (/git\s+push/i.test(command)) {
    return "push"
  }

  // 测试相关
  if (/(npm\s+test|pytest|jest|cargo\s+test|go\s+test|mvn\s+test)/i.test(command)) {
    return "test"
  }

  // 构建相关
  if (/(npm\s+run\s+build|cargo\s+build|gradle\s+build|mvn\s+package|go\s+build)/i.test(command)) {
    return "build"
  }

  return null
}

// ============ 插件主体 ============

export const CodingFangirlHooksPlugin: Plugin = async ({ client, $ }) => {
//   console.log("[coding-fangirl] Hooks plugin loaded! 🎉")

  return {
    // 1. 里程碑庆祝
    tool: {
      execute: {
        after: async (input, output) => {
          // 只监听 Bash 工具
          if (input.tool !== "bash") return

          const command = output.args?.command || ""

          // 检测里程碑命令
          const milestoneType = detectMilestoneCommand(command)

          if (milestoneType) {
            // 选择对应类型的语录
            let messages: string[]
            switch (milestoneType) {
              case "commit":
                messages = COMMIT_MESSAGES
                break
              case "push":
                messages = PUSH_MESSAGES
                break
              case "test":
                messages = TEST_MESSAGES
                break
              case "build":
                messages = BUILD_MESSAGES
                break
              default:
                return
            }

            // 随机选择一条
            const message = randomPick(messages)

            // 输出到控制台（OpenCode 会捕获并显示）
            console.log(`[coding-fangirl] ${message}`)

            // 10% 概率附带 Star 提示
            if (Math.random() < 0.1) {
              console.log(`[coding-fangirl] ${STAR_HINT}`)
            }
          }
        }
      }
    },
  }
}
