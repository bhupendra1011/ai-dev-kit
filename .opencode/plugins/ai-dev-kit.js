/**
 * ai-dev-kit plugin for OpenCode
 *
 * - Registers the repo's skills directory so OpenCode can discover skills.
 * - Injects the ai-dev-kit bootstrap (from skills/ai-dev-kit/SKILL.md) into the
 *   first user message of each session (once), to keep git conventions active.
 *
 * Inspired by the Superpowers OpenCode plugin pattern.
 */

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AI_DEV_KIT_MARKER = "AI_DEV_KIT_OPEN_CODE_BOOTSTRAP_v1";

const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line
        .slice(colonIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
};

const readUtf8IfExists = (filePath) => {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
};

export const AiDevKitPlugin = async () => {
  const repoSkillsDir = path.resolve(__dirname, "../../skills");
  const skillEntryPath = path.resolve(
    repoSkillsDir,
    "ai-dev-kit",
    "SKILL.md",
  );

  const getBootstrapContent = () => {
    const full = readUtf8IfExists(skillEntryPath);
    if (!full) return null;

    const { content } = extractAndStripFrontmatter(full);

    const toolMapping = `**Tool mapping for OpenCode**
- Cursor/Codex \`TodoWrite\` → OpenCode \`todowrite\`
- Cursor/Codex \`Task\` (subagents) → OpenCode subagents (@mention)
- Cursor/Codex \`Skill\` tool → OpenCode \`skill\`
- Cursor/Codex \`Read\`, \`Write\`, \`Edit\`, \`Shell\`/\`Bash\` → OpenCode native tools
`;

    return `\n${AI_DEV_KIT_MARKER}\n\nYou have ai-dev-kit installed.\n\n${content}\n\n${toolMapping}\n`;
  };

  return {
    // Make OpenCode discover skills in this repo without requiring symlinks.
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(repoSkillsDir)) {
        config.skills.paths.push(repoSkillsDir);
      }
    },

    // Inject bootstrap into the first user message once per session.
    "experimental.chat.messages.transform": async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages?.length) return;

      const firstUser = output.messages.find((m) => m.info?.role === "user");
      if (!firstUser || !firstUser.parts?.length) return;

      if (
        firstUser.parts.some(
          (p) => p.type === "text" && typeof p.text === "string" && p.text.includes(AI_DEV_KIT_MARKER),
        )
      ) {
        return;
      }

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: "text", text: bootstrap });
    },
  };
};

