---
name: github-api
description: Create GitHub repositories and manage issues/tasks using the GitHub REST API. Use when the user wants to create repositories, create issues, manage tasks, or interact with GitHub programmatically.
---

# GitHub API Integration

Guide for creating repositories and managing issues/tasks on GitHub using the REST API.

## Authentication

### Personal Access Token (PAT)

**How to get the token:**

1. **Visit:** https://github.com/settings/tokens
2. **Click:** "Generate new token" → "Generate new token (classic)"
3. **Configure:**
   - **Note**: Descriptive name (e.g., "Artemis Tasks")
   - **Expiration**: Choose a period (90 days recommended)
   - **Select scopes**: Check ✅ `repo` (full access to repositories)
4. **Click:** "Generate token"
5. **⚠️ COPY THE TOKEN IMMEDIATELY** (it only appears once!)

**Configure in project:**

```bash
# Option 1: Environment variable (temporary)
export GITHUB_TOKEN=ghp_your_token_here
export GITHUB_OWNER=your-username

# Option 2: .env file (recommended)
echo "GITHUB_TOKEN=ghp_your_token_here" >> .env
echo "GITHUB_OWNER=your-username" >> .env
```

**Verify it's working:**

```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user
```

📖 **For detailed instructions, see [SETUP.md](SETUP.md)**

### Authentication Headers

```typescript
const headers = {
  "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
  "Accept": "application/vnd.github.v3+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
};
```

## Create Repository

### Endpoint

```
POST https://api.github.com/user/repos
```

### Payload

```typescript
interface CreateRepoPayload {
  name: string;                    // Repository name (required)
  description?: string;            // Repository description
  private?: boolean;              // true = private, false = public (default: false)
  auto_init?: boolean;            // Create initial README (default: false)
  gitignore_template?: string;    // .gitignore template (e.g., "Node")
  license_template?: string;       // License template (e.g., "mit")
  allow_squash_merge?: boolean;   // Allow squash merge (default: true)
  allow_merge_commit?: boolean;   // Allow merge commit (default: true)
  allow_rebase_merge?: boolean;   // Allow rebase merge (default: true)
}

// Minimal example
const payload = {
  name: "my-repository",
  description: "Repository description",
  private: false,
  auto_init: true,
};
```

### Complete Example (TypeScript/Node.js)

```typescript
async function createRepository(repoName: string, options?: {
  description?: string;
  private?: boolean;
  autoInit?: boolean;
}) {
  const response = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: repoName,
      description: options?.description || "",
      private: options?.private || false,
      auto_init: options?.autoInit || false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create repository: ${error.message}`);
  }

  const repo = await response.json();
  return repo;
}

// Usage
const repo = await createRepository("artemis-tasks", {
  description: "Repository for managing Artemis project tasks",
  private: false,
  autoInit: true,
});

console.log(`Repository created: ${repo.html_url}`);
```

## Create Issue/Task

### Endpoint

```
POST https://api.github.com/repos/{owner}/{repo}/issues
```

### Payload

```typescript
interface CreateIssuePayload {
  title: string;                  // Issue title (required)
  body?: string;                  // Issue body (markdown)
  assignees?: string[];           // Array of usernames to assign
  milestone?: number;             // Milestone ID
  labels?: string[];              // Array of labels (e.g., ["bug", "enhancement"])
  assignee?: string;             // DEPRECATED - use assignees[]
}
```

### Task Template

**Always use the standard task template** from [TASK_TEMPLATE.md](TASK_TEMPLATE.md) when creating tasks.

**IMPORTANT:** All task titles must include a sequential number in the format `TSK-001`, `TSK-002`, etc.

### Get Next Task Number

Before creating a task, you need to get the next available TSK number:

```typescript
async function getNextTaskNumber(
  owner: string,
  repo: string
): Promise<string> {
  // Get all issues (open and closed)
  const allIssues = await listIssues(owner, repo, { state: "all" });

  // Extract TSK numbers from titles
  const tskNumbers: number[] = [];
  
  for (const issue of allIssues) {
    const match = issue.title.match(/TSK-(\d+)/);
    if (match) {
      tskNumbers.push(parseInt(match[1], 10));
    }
  }

  // Find the next number
  const nextNumber = tskNumbers.length > 0 
    ? Math.max(...tskNumbers) + 1 
    : 1;

  // Format as TSK-001, TSK-002, etc.
  return `TSK-${String(nextNumber).padStart(3, "0")}`;
}

// Usage
const nextTsk = await getNextTaskNumber("vitorsousa", "artemis-tasks");
// Returns: "TSK-001" (if no tasks exist) or "TSK-002", "TSK-003", etc.
```

### Create Task with Auto Numbering

```typescript
async function createTaskWithNumber(
  owner: string,
  repo: string,
  taskTitle: string,
  options?: {
    body?: string;
    labels?: string[];
    assignees?: string[];
  }
) {
  // Get next TSK number
  const tskNumber = await getNextTaskNumber(owner, repo);
  
  // Format title: TSK-001 - Task Title
  const formattedTitle = `${tskNumber} - ${taskTitle}`;

  // Create issue
  return await createIssue(owner, repo, formattedTitle, options);
}

// Usage
const issue = await createTaskWithNumber(
  "vitorsousa",
  "artemis-tasks",
  "Implement JWT authentication",
  {
    body: issueBody,
    labels: ["enhancement"],
  }
);
```

### Complete Example

```typescript
async function createIssue(
  owner: string,
  repo: string,
  title: string,
  options?: {
    body?: string;
    labels?: string[];
    assignees?: string[];
  }
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body: options?.body || "",
        labels: options?.labels || [],
        assignees: options?.assignees || [],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create issue: ${error.message}`);
  }

  const issue = await response.json();
  return issue;
}

// Usage with template and auto-numbering
const issueBody = `## Description

Implement JWT authentication system.

## Objective

Allow users to securely authenticate and access protected resources.

## Requirements

- [ ] Create login endpoint
- [ ] Implement JWT token generation
- [ ] Add token validation middleware

## Acceptance Criteria

- [ ] Users can log in with email and password
- [ ] JWT tokens are generated on successful login
- [ ] Protected routes require valid JWT token

## Type

enhancement

## Priority

high`;

// Get next TSK number and create task
const tskNumber = await getNextTaskNumber("vitorsousa", "artemis-tasks");
const issue = await createIssue(
  "vitorsousa",
  "artemis-tasks",
  `${tskNumber} - Implement JWT authentication`,
  {
    body: issueBody,
    labels: ["enhancement", "backend"],
    assignees: ["vitorsousa"],
  }
);

console.log(`Issue created: ${issue.html_url}`);
```

## List Issues

### Endpoint

```
GET https://api.github.com/repos/{owner}/{repo}/issues
```

### Query Parameters

- `state`: `open`, `closed`, or `all` (default: `open`)
- `labels`: Filter by labels (e.g., `bug,enhancement`)
- `assignee`: Filter by assignee
- `creator`: Filter by creator
- `per_page`: Number of results per page (default: 30, max: 100)
- `page`: Page number

### Example

```typescript
async function listIssues(
  owner: string,
  repo: string,
  options?: {
    state?: "open" | "closed" | "all";
    labels?: string;
    perPage?: number;
  }
) {
  const params = new URLSearchParams({
    state: options?.state || "open",
    per_page: String(options?.perPage || 30),
  });

  if (options?.labels) {
    params.append("labels", options.labels);
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues?${params}`,
    {
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to list issues: ${error.message}`);
  }

  const issues = await response.json();
  return issues;
}
```

## Update Issue

### Endpoint

```
PATCH https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}
```

### Payload

```typescript
interface UpdateIssuePayload {
  title?: string;
  body?: string;
  state?: "open" | "closed";
  state_reason?: "completed" | "not_planned" | "reopened";
  assignees?: string[];
  labels?: string[];
  milestone?: number | null;
}

// Example - Close issue
const payload = {
  state: "closed",
  state_reason: "completed",
};
```

## Close Issue

```typescript
async function closeIssue(
  owner: string,
  repo: string,
  issueNumber: number
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
    {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        state: "closed",
        state_reason: "completed",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to close issue: ${error.message}`);
  }

  return await response.json();
}
```

## Manage Labels

### Create Label

```
POST https://api.github.com/repos/{owner}/{repo}/labels
```

```typescript
async function createLabel(
  owner: string,
  repo: string,
  name: string,
  color: string,
  description?: string
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/labels`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        color: color.replace("#", ""), // Remove # if present
        description: description || "",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create label: ${error.message}`);
  }

  return await response.json();
}

// Example
await createLabel("vitorsousa", "artemis-tasks", "priority-high", "d73a4a", "High priority");
```

## Error Handling

### Common HTTP Status Codes

- `201 Created`: Resource created successfully
- `200 OK`: Operation successful
- `404 Not Found`: Resource not found
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: No permission for the operation
- `422 Unprocessable Entity`: Invalid data (e.g., repository already exists)

### Error Handling Example

```typescript
async function handleGitHubRequest<T>(
  request: () => Promise<Response>
): Promise<T> {
  try {
    const response = await request();

    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 401:
          throw new Error("Invalid or missing authentication token");
        case 403:
          throw new Error("No permission to perform this operation");
        case 404:
          throw new Error("Resource not found");
        case 422:
          throw new Error(`Invalid data: ${error.message}`);
        default:
          throw new Error(`API error: ${error.message}`);
      }
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error communicating with GitHub API");
  }
}
```

## Complete Flow Example

```typescript
async function setupTaskRepository(repoName: string) {
  // 1. Create repository
  const repo = await createRepository(repoName, {
    description: "Repository for managing tasks",
    autoInit: true,
  });

  const owner = repo.owner.login;

  // 2. Create default labels
  await createLabel(owner, repoName, "bug", "d73a4a", "Something isn't working");
  await createLabel(owner, repoName, "enhancement", "a2eeef", "New feature or improvement");
  await createLabel(owner, repoName, "documentation", "0075ca", "Documentation improvements");
  await createLabel(owner, repoName, "priority-high", "d73a4a", "High priority");

  // 3. Create initial issue
  await createIssue(owner, repoName, "Welcome to the tasks repository", {
    body: "This repository will be used to manage all project tasks.",
    labels: ["documentation"],
  });

  return repo;
}

// Usage
const repo = await setupTaskRepository("artemis-tasks");
console.log(`Repository created: ${repo.html_url}`);
```

## Rate Limiting

GitHub API has rate limits:
- **Authenticated**: 5,000 requests/hour
- **Unauthenticated**: 60 requests/hour

Response headers include rate limit information:
- `X-RateLimit-Limit`: Total limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Timestamp when limit will reset

## Environment Variables

Always use environment variables for tokens:

```bash
# .env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=vitorsousa
```

```typescript
// config.ts
export const GITHUB_CONFIG = {
  token: process.env.GITHUB_TOKEN!,
  owner: process.env.GITHUB_OWNER || "vitorsousa",
  apiUrl: "https://api.github.com",
};
```

## References

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [Repositories API](https://docs.github.com/en/rest/repos/repos)
- [Issues API](https://docs.github.com/en/rest/issues/issues)
- [Labels API](https://docs.github.com/en/rest/issues/labels)
- [Task Template](TASK_TEMPLATE.md)
