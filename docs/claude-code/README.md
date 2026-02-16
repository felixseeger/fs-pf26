# Claude Code docs (local copy)

- **Full index**: [llms.txt](./llms.txt) — use to discover all available pages.
- **Agent teams**: [agent-teams.md](./agent-teams.md) — orchestrate multiple Claude Code sessions.

Live index: https://code.claude.com/docs/llms.txt

## Agent teams (this project)

Agent teams are **enabled for this workspace** via `.vscode/settings.json`: the integrated terminal gets `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. So when you run `claude` from a terminal opened in this project in Cursor/VS Code, agent teams are available.

To enable agent teams **globally** (e.g. when using Claude Code outside this IDE), set the env in your shell or in Claude Code’s own settings (see [agent-teams.md](./agent-teams.md)).
