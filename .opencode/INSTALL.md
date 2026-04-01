# Installing ai-dev-kit for OpenCode

## Prerequisites

- [OpenCode](https://opencode.ai) installed

## Installation

### Option A — Use this repo locally (recommended for development)

Clone the repo and run OpenCode from inside it. OpenCode will auto-load local plugins from `.opencode/plugins/`.

```bash
git clone https://github.com/AgoraIO-Community/ai-dev-kit.git
cd ai-dev-kit
```

Restart OpenCode (or start it from this directory).

### Option B — Install via `opencode.json` (git plugin)

If your OpenCode setup supports git-based plugins in the `plugin` array, add this to your `opencode.json` (global or project-level):

```json
{
  "plugin": ["ai-dev-kit@git+https://github.com/AgoraIO-Community/ai-dev-kit.git"]
}
```

Restart OpenCode. The plugin should auto-install and register the skills.

## Verify it’s working

1. In an OpenCode chat inside the repo, ask it to list discovered skills using OpenCode’s `skill` tool.
2. Ask: “What are the ai-dev-kit git conventions?” and confirm it answers from the injected bootstrap.
3. Ask it to run a git workflow skill (dry-run / explanation is fine): “ship it” / “create a pr” / “sync with main”.

## Tool mapping (when skills reference other agents)

- `TodoWrite` → OpenCode `todowrite`
- `Task` with subagents → OpenCode subagents (@mention)
- `Skill` tool → OpenCode `skill`
- File ops (`Read`/`Write`/`Edit`) and shell → OpenCode native tools

