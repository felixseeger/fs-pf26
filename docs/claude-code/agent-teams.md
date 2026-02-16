# Orchestrate teams of Claude Code sessions

Coordinate multiple Claude Code instances working together as a team, with shared tasks, inter-agent messaging, and centralized management.

**Agent teams are experimental and disabled by default.** Enable them by adding `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` to your [settings.json](https://code.claude.com/docs/en/settings) or environment. Agent teams have known limitations around session resumption, task coordination, and shutdown behavior.

## Enable agent teams

Set the environment variable to `1`, in your shell or in settings.json:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Display mode (settings.json)

```json
{
  "teammateMode": "in-process"
}
```

Or force in-process for a single session:

```bash
claude --teammate-mode in-process
```

Split-pane mode requires tmux or iTerm2 with the `it2` CLI.

## Quick reference

|                   | Subagents                    | Agent teams                          |
|-------------------|------------------------------|--------------------------------------|
| **Context**       | Own context; results to caller | Own context; fully independent       |
| **Communication** | Report to main agent only    | Teammates message each other         |
| **Coordination**  | Main agent manages work      | Shared task list, self-coordination  |
| **Best for**      | Focused tasks, result only   | Discussion and collaboration         |

## Start a team

After enabling, ask Claude to create an agent team and describe the task and structure. Example:

```
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Create an agent team to explore this from different angles: one
teammate on UX, one on technical architecture, one playing devil's advocate.
```

## Control

- **Shift+Up/Down**: Select teammate (in-process mode)
- **Delegate mode**: Shift+Tab to restrict lead to coordination-only
- **Clean up**: Ask the lead to "Clean up the team" (always use the lead; teammates must not run cleanup)

## Documentation index

Full docs index: https://code.claude.com/docs/llms.txt
