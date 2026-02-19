# GitHub API Skill

Skill for creating repositories and managing issues/tasks on GitHub using the REST API.

## Structure

- `SKILL.md` - Main skill instructions
- `SETUP.md` - Token setup guide
- `TASK_TEMPLATE.md` - Standard task template (use for all tasks)
- `examples.md` - Practical usage examples
- `reference.md` - Quick reference for endpoints and parameters
- `scripts/github-api-helper.ts` - TypeScript utility script

## Initial Setup

### 1. Get GitHub Token

Follow the complete guide in **[SETUP.md](SETUP.md)** to get your GitHub token.

**Quick summary:**
- Visit: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Check the `repo` permission
- Copy the token (starts with `ghp_`)

### 2. Configure Environment Variables

```bash
# Option 1: Terminal (temporary)
export GITHUB_TOKEN=ghp_your_token_here
export GITHUB_OWNER=your-username

# Option 2: .env file (recommended)
echo "GITHUB_TOKEN=ghp_your_token_here" >> .env
echo "GITHUB_OWNER=your-username" >> .env
```

### 3. Verify Configuration

```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user
```

If it returns your GitHub data, it's working! ✅

## Quick Usage

### Create Repository

```typescript
const repo = await createRepository("artemis-tasks", {
  description: "Repository for managing tasks",
  autoInit: true,
});
```

### Create Issue/Task

**⚠️ IMPORTANT:** 
- Always use the task template from [TASK_TEMPLATE.md](TASK_TEMPLATE.md)
- All tasks must have TSK number in title format: `TSK-001`, `TSK-002`, etc.

```typescript
import { createIssue, getNextTaskNumber } from "./github-api";

// Get next TSK number
const tskNumber = await getNextTaskNumber("vitorsousa", "artemis-tasks");

const issue = await createIssue(
  "vitorsousa",
  "artemis-tasks",
  `${tskNumber} - New feature`,
  {
    body: "Task description following template",
    labels: ["enhancement"],
  }
);
```

### Use Utility Script

```bash
# Create repository with complete setup
npx tsx .cursor/skills/github-api/scripts/github-api-helper.ts setup-repo artemis-tasks

# Create issue
npx tsx .cursor/skills/github-api/scripts/github-api-helper.ts create-issue vitorsousa artemis-tasks "My task" "Description"

# List issues
npx tsx .cursor/skills/github-api/scripts/github-api-helper.ts list-issues vitorsousa artemis-tasks
```

## Task Template

**Always use the standard task template** when creating new tasks. See [TASK_TEMPLATE.md](TASK_TEMPLATE.md) for the complete template and examples.

**Task Numbering:** All tasks must include a sequential number in the title: `TSK-001`, `TSK-002`, etc. Use `getNextTaskNumber()` function to get the next available number automatically.

## Complete Documentation

See `SKILL.md` for detailed instructions and `examples.md` for more examples.
