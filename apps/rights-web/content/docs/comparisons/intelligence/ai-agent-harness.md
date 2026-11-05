---
title: 🦾 Coding Agent Harness
description: Compare coding agent harnesses, explore their standout features, and install each CLI.
---

| Agent | Best fit | Standout features | Main tradeoff |
| --- | --- | --- | --- |
| [DeepAgents Code](https://github.com/langchain-ai/deepagents) | Memory-heavy, multi-step workflows | Persistent memory, parallel subagents, remote sandboxes, goals and rubrics, LangSmith tracing | An opinionated stack built on the Deep Agents SDK |
| [Pi](https://github.com/earendil-works/pi) | Building your own customized harness | Shareable extension packages, TypeScript SDK, RPC, print and JSON modes | No built-in subagents, plan mode, or access-restriction permission system |
| [OpenCode](https://github.com/anomalyco/opencode) | Interactive coding with specialized agents | Build and Plan modes, subagents, per-agent models and permissions | Permission configuration needs careful review; Plan mode alone is not a sandbox |
| [Codex CLI](https://github.com/openai/codex) | OpenAI-centered local coding | Local terminal agent, sandbox and approval controls, editor integration options | Model access and account requirements are separate from installing the client |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | Enterprise Gemini Code Assist workflows | Multimodal inputs, MCP, headless automation, context files, VS Code companion | Current repository guidance distinguishes enterprise access from the newer consumer CLI |
| [Aider](https://github.com/Aider-AI/aider) | Git-centered AI pair programming | Repository map, automatic commits, lint/test feedback, voice input, cloud and local models | More focused on pair programming than general-purpose multi-agent orchestration |
| [mini-swe-agent](https://github.com/SWE-agent/mini-swe-agent) | Learning, evaluating, or modifying a minimal agent | Bash-only action interface, linear history, small agent core, interchangeable execution environments | Deliberately minimal rather than a batteries-included coding workspace |

## Before installing

Run the installation commands in VS Code's integrated terminal, not in
Claude Code's chat input.

The shell examples below target macOS, Linux, or Windows through WSL.
Use the linked project documentation for native Windows installation.

- Install Node.js and npm for the npm-based commands.
- Pi requires Node.js 22.19 or newer.
- Install Python and pip for Aider and mini-swe-agent.
- Run each agent from the project directory where you want it to work.
- Configure model authentication separately for each agent.
- Review remote installer scripts before executing commands that pipe
  downloaded content directly into a shell.

Check the tools available in your terminal:

```bash
node --version
npm --version
python --version
python -m pip --version
```

If your system uses `python3` instead of `python`, substitute `python3`
in the Python commands below.

## DeepAgents Code

DeepAgents Code, launched with `dcode`, is a terminal coding agent built
on the Deep Agents SDK.

### CLI installation

Install using the official installer:

```bash
curl -LsSf [https://langch.in/dcode](https://langch.in/dcode) | bash
```

Start it from your project directory:

```bash
dcode
```

Configure credentials for your chosen model provider during setup.

Installing the `deepagents` Python library alone is not the same as
installing the `dcode` terminal application.

### Best features

- Persistent memory carries project conventions and learned patterns
  across conversations.
- Task-specific subagents support parallel delegation.
- Remote sandboxes can execute tools away from your local machine.
- Goals and rubrics provide explicit criteria for checking completion.
- Context compaction summarizes older messages and offloads originals
  to storage.
- LangSmith tracing helps inspect and debug agent operations.

## Pi

Pi is a minimal, extensible agent harness designed to adapt to your
workflow.

### CLI installation

Install globally with npm:

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```

Start Pi from your project directory:

```bash
pi
```

Inside Pi, connect a supported subscription or API key:

```text
/login
```

Alternatively, use the official macOS/Linux installer, which can install
the required Node.js version if needed:

```bash
curl -fsSL [https://pi.dev/install.sh](https://pi.dev/install.sh) | sh
```

Choose either the npm method or the installer rather than running both.

### Best features

- Extensions, skills, prompt templates, and themes customize behavior
  and presentation.
- Pi packages bundle customizations for distribution through npm or Git.
- A TypeScript SDK lets you embed the agent in your own application.
- RPC supports external programmatic control.
- Print and JSON modes support automation outside an interactive terminal.
- The monorepo includes reusable model, agent-runtime, and terminal-UI
  libraries.

## OpenCode

OpenCode provides an interactive coding workflow with configurable
primary agents and subagents.

### CLI installation

Install the current OpenCode CLI package:

```bash
npm install -g @opencode/cli@latest
```

Verify the installation and launch it:

```bash
opencode --version
opencode
```

Alternatively, use the official OpenCode 2 installer:

```bash
curl -fsSL [https://opencode.ai/v2/install](https://opencode.ai/v2/install) | bash
```

Choose one installation method.

The older `opencode-ai` package and the current package both use the
`opencode` command. Avoid mixing installations that compete for the
same executable.

### Best features

- Build and Plan agents provide distinct implementation and analysis
  workflows.
- Specialized subagents support repository exploration and delegated work.
- Custom agents can use different models, prompts, and permissions.
- JSON and Markdown definitions make agent configuration easy to
  version with a project.
- Child-session navigation lets you inspect delegated work separately
  from the main conversation.
- Permission policies control which actions run automatically, require
  approval, or are denied.

## Codex CLI

Codex CLI is OpenAI’s open-source coding agent that runs locally on
your computer.

### CLI installation

Install globally with npm:

```bash
npm install -g @openai/codex
```

Start Codex from your project directory:

```bash
codex
```

Follow the sign-in flow to connect your ChatGPT account, or configure
API-key authentication using the official documentation.

Alternatively, use the official macOS/Linux standalone installer:

```bash
curl -fsSL [https://chatgpt.com/codex/install.sh](https://chatgpt.com/codex/install.sh) | sh
```

Choose one installation method.

### Best features

- A local terminal interface supports repository-based coding workflows.
- Sandbox and approval controls distinguish permitted execution from
  actions requiring additional authorization.
- Editor integration options support workflows in VS Code and related
  editors.
- The app-server interface provides a programmatic foundation for
  clients and integrations.

## Gemini CLI

Gemini CLI is an open-source terminal agent with code, multimodal,
and automation capabilities.

### CLI installation

Install the stable release globally with npm:

```bash
npm install -g @google/gemini-cli@latest
```

Start Gemini CLI from your project directory:

```bash
gemini
```

Alternatively, try it without a persistent global installation:

```bash
npx @google/gemini-cli
```

Follow the authentication instructions for your account.

The repository currently positions this CLI around enterprise Code Assist
and legacy paid API or Vertex access. It directs free individual and
Google AI Pro/Ultra users toward Antigravity CLI. Check current account
eligibility before configuring access.

### Best features

- Multimodal context can include images, PDFs, and sketches.
- MCP servers extend the agent with external tools.
- Non-interactive execution supports scripts and automated workflows.
- JSON and streaming JSON output support machine-readable integrations.
- `GEMINI.md` context files provide persistent project instructions.
- Documentation covers checkpointing, sandboxing, trusted folders,
  and a VS Code companion.

## Aider

Aider focuses on AI pair programming inside an existing Git repository.

### CLI installation

Install and run Aider's installation helper:

```bash
python -m pip install aider-install
aider-install
```

Start Aider from your project directory:

```bash
aider
```

Configure your selected model and provider credentials before making
model requests. Model-specific setup is documented in Aider's
[model connection guide](https://aider.chat/docs/llms.html).

### Best features

- A repository map supplies structural context about the codebase.
- Automatic Git commits make generated changes easier to inspect
  and undo.
- Automatic linting and testing can feed failures back into the
  editing workflow.
- Support for cloud and local models gives you deployment flexibility.
- Images and web pages can provide additional context.
- Voice input supports spoken coding requests.

## mini-swe-agent

mini-swe-agent is a deliberately small software-engineering agent
designed to be understandable and easy to modify.

### CLI installation

Create an isolated Python environment and install the package:

```bash
python -m venv ~/.venvs/mini-swe-agent
source ~/.venvs/mini-swe-agent/bin/activate
python -m pip install mini-swe-agent
```

Start the CLI from your project directory:

```bash
mini
```

In a new terminal, reactivate the environment before running it:

```bash
source ~/.venvs/mini-swe-agent/bin/activate
mini
```

Alternatively, try it in a temporary managed environment using `uv`:

```bash
python -m pip install uv
uvx mini-swe-agent
```

Configure the model and provider credentials using the project's
quickstart instructions.

### Best features

- The agent class is roughly 100 lines of Python; the complete project
  also includes model, environment, and execution support.
- Bash is the sole action interface, avoiding a large catalog of
  specialized tools.
- Linear message history makes execution trajectories easier to inspect.
- Independent command execution simplifies swapping execution backends.
- Local and containerized environments support different testing and
  isolation needs.
- A CLI, Python bindings, batch inference, and a trajectory browser
  support experimentation.

## Which should you try first?

These are workflow recommendations, not benchmark rankings.

| Your priority | Start with | Reason |
| --- | --- | --- |
| Interactive coding with specialized roles | OpenCode | Built-in primary agents, subagents, and configurable permissions |
| Persistent project learning and delegated work | DeepAgents Code | Memory, parallel subagents, and workflow-oriented capabilities |
| A harness you can embed and heavily customize | Pi | SDK, RPC, and packageable extensions |
| An OpenAI-centered terminal workflow | Codex CLI | Local coding agent with sandbox and approval controls |
| Enterprise Gemini integration | Gemini CLI | Code Assist-oriented terminal and automation features |
| Git-centered pair programming | Aider | Repository mapping, commits, and lint/test feedback |
| Minimal, inspectable agent experiments | mini-swe-agent | Small core, bash-only actions, and linear trajectories |

## Using these alongside Claude Code in VS Code

These tools are separate agents, not Claude Code plugins.

| Agent | Launch command |
| --- | --- |
| DeepAgents Code | `dcode` |
| Pi | `pi` |
| OpenCode | `opencode` |
| Codex CLI | `codex` |
| Gemini CLI | `gemini` |
| Aider | `aider` |
| mini-swe-agent | `mini` |

- Run interactive agents in separate VS Code terminal tabs.
- Test one agent at a time before introducing concurrent workflows.
- Use separate branches or worktrees when multiple agents may edit files.
- Configure authentication independently for each tool.
- Start with repository analysis before allowing edits or shell execution.
- Use external isolation when tool permissions alone do not provide
  the boundaries you need.

## How to compare them fairly

Use a fixed task set rather than GitHub stars as your quality measure.

1. Use the same repository revision and task description.
2. Keep the model and budget consistent where possible.
3. Record task completion, test results, elapsed time, and usage cost.
4. Track human interventions and permission approvals.
5. Inspect the resulting diff for unrelated changes.
6. Repeat tasks before drawing conclusions from a single run.

When tools require different models, label the result as a comparison
of complete agent systems rather than harnesses alone.