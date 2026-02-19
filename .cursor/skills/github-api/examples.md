# Practical Examples - GitHub API

## Example 1: Create Repository and First Task

```typescript
import { createRepository, createIssue, getNextTaskNumber } from "./github-api";

async function basicExample() {
  // Create repository
  const repo = await createRepository("artemis-tasks", {
    description: "Repository for managing Artemis project tasks",
    private: false,
    autoInit: true,
  });

  console.log(`✅ Repository created: ${repo.html_url}`);

  // Get next TSK number
  const tskNumber = await getNextTaskNumber(repo.owner.login, repo.name);

  // Create first task using template
  const issueBody = `## Description

Set up CI/CD pipeline for the project.

## Requirements

- [ ] Configure GitHub Actions
- [ ] Add automated tests
- [ ] Configure automatic deployment

## Type

enhancement

## Priority

medium`;

  const issue = await createIssue(
    repo.owner.login,
    repo.name,
    `${tskNumber} - Set up CI/CD`,
    {
      body: issueBody,
      labels: ["enhancement"],
    }
  );

  console.log(`✅ Task created: ${issue.html_url}`);
}
```

## Example 2: Create Multiple Tasks at Once

```typescript
import { createIssue, getNextTaskNumber } from "./github-api";

async function createTasksInBatch(owner: string, repo: string) {
  // Get starting TSK number
  let currentTsk = await getNextTaskNumber(owner, repo);
  const startNumber = parseInt(currentTsk.replace("TSK-", ""), 10);

  const tasks = [
    {
      title: "Implement JWT authentication",
      body: `## Description\n\nAuthentication system using JWT tokens.\n\n## Type\n\nenhancement\n\n## Priority\n\nhigh`,
      labels: ["backend", "enhancement"],
    },
    {
      title: "Create dashboard component",
      body: `## Description\n\nMain dashboard with project metrics.\n\n## Type\n\nenhancement\n\n## Priority\n\nmedium`,
      labels: ["frontend", "enhancement"],
    },
    {
      title: "Add unit tests",
      body: `## Description\n\nTest coverage for critical modules.\n\n## Type\n\ntesting\n\n## Priority\n\nhigh`,
      labels: ["testing", "enhancement"],
    },
  ];

  const createdIssues = [];
  
  for (let i = 0; i < tasks.length; i++) {
    const tskNumber = `TSK-${String(startNumber + i).padStart(3, "0")}`;
    const formattedTitle = `${tskNumber} - ${tasks[i].title}`;
    
    const issue = await createIssue(owner, repo, formattedTitle, {
      body: tasks[i].body,
      labels: tasks[i].labels,
    });
    
    createdIssues.push(issue);
    
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`✅ ${createdIssues.length} tasks created`);
  createdIssues.forEach((issue) => {
    console.log(`  - ${issue.title}: ${issue.html_url}`);
  });
}
```

## Example 3: Task Template with Checklist

```typescript
import { createIssue, getNextTaskNumber } from "./github-api";

function createTaskFromTemplate(
  title: string,
  description: string,
  subtasks: string[],
  labels: string[] = []
) {
  const checklist = subtasks
    .map((task) => `- [ ] ${task}`)
    .join("\n");

  const body = `## Description\n\n${description}\n\n## Requirements\n\n${checklist}\n\n## Type\n\nenhancement`;

  return {
    title,
    body,
    labels,
  };
}

// Usage
const task = createTaskFromTemplate(
  "Refactor authentication module",
  "Refactor authentication system to improve maintainability",
  [
    "Extract validation logic to separate service",
    "Add unit tests",
    "Update documentation",
    "Review security",
  ],
  ["refactoring", "backend"]
);

// Get TSK number and format title
const tskNumber = await getNextTaskNumber("vitorsousa", "artemis-tasks");
const formattedTitle = `${tskNumber} - ${task.title}`;

await createIssue("vitorsousa", "artemis-tasks", formattedTitle, {
  body: task.body,
  labels: task.labels,
});
```

## Example 4: Sync Tasks from Array

```typescript
interface Task {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  assignee?: string;
}

async function syncTasks(
  owner: string,
  repo: string,
  tasks: Task[]
) {
  const labelMap = {
    high: "priority-high",
    medium: "priority-medium",
    low: "priority-low",
  };

  for (const task of tasks) {
    const labels = [labelMap[task.priority]];

    const body = `## Description\n\n${task.description}\n\n## Priority\n\n${task.priority}`;

    await createIssue(owner, repo, task.title, {
      body,
      labels,
      assignees: task.assignee ? [task.assignee] : undefined,
    });

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

// Usage
const myTasks: Task[] = [
  {
    title: "Implement feature X",
    description: "Detailed description",
    priority: "high",
    assignee: "vitorsousa",
  },
  {
    title: "Fix bug Y",
    description: "Bug description",
    priority: "medium",
  },
];

await syncTasks("vitorsousa", "artemis-tasks", myTasks);
```

## Example 5: Check if Repository Exists

```typescript
async function repositoryExists(owner: string, repo: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}

// Usage before creating
const exists = await repositoryExists("vitorsousa", "artemis-tasks");
if (!exists) {
  await createRepository("artemis-tasks");
} else {
  console.log("Repository already exists!");
}
```

## Example 6: Find and Close Completed Tasks

```typescript
async function closeCompletedTasks(owner: string, repo: string) {
  const issues = await listIssues(owner, repo, { state: "open" });

  // Assuming issues with "done" label should be closed
  const tasksToClose = issues.filter((issue) =>
    issue.labels.some((label) => label.name === "done")
  );

  for (const issue of tasksToClose) {
    await closeIssue(owner, repo, issue.number);
    console.log(`✅ Closed: ${issue.title}`);
  }
}
```

## Example 7: Create Repository with Complete Setup

```typescript
async function createCompleteRepository(name: string) {
  // 1. Create repository
  const repo = await createRepository(name, {
    description: `Repository for managing tasks for ${name} project`,
    private: false,
    auto_init: true,
    gitignore_template: "Node",
    license_template: "mit",
    allow_squash_merge: true,
    allow_merge_commit: true,
    allow_rebase_merge: true,
  });

  const owner = repo.owner.login;

  // 2. Create default labels
  const labels = [
    { name: "bug", color: "d73a4a", description: "Something isn't working" },
    {
      name: "enhancement",
      color: "a2eeef",
      description: "New feature or improvement",
    },
    {
      name: "documentation",
      color: "0075ca",
      description: "Documentation improvements",
    },
    { name: "priority-high", color: "d73a4a", description: "High priority" },
    {
      name: "priority-medium",
      color: "fbca04",
      description: "Medium priority",
    },
    { name: "priority-low", color: "0e8a16", description: "Low priority" },
  ];

  for (const label of labels) {
    await createLabel(owner, name, label.name, label.color, label.description);
  }

  // 3. Create welcome issue
  await createIssue(owner, name, "Welcome to the tasks repository", {
    body: `# Welcome!\n\nThis repository will be used to manage all tasks for the ${name} project.\n\n## How to use\n\n- Create an issue for each task\n- Use labels to categorize\n- Assign tasks when necessary`,
    labels: ["documentation"],
  });

  return repo;
}
```

## Example 8: Using Task Template

Always use the standard task template from [TASK_TEMPLATE.md](TASK_TEMPLATE.md):

```typescript
import { createIssue, getNextTaskNumber } from "./github-api";

// Get next TSK number
const tskNumber = await getNextTaskNumber("vitorsousa", "artemis-tasks");

const taskBody = `## Description

Implement user authentication system using JWT tokens.

## Objective

Allow users to securely authenticate and access protected resources in the application.

## Requirements

- [ ] Create login endpoint
- [ ] Implement JWT token generation
- [ ] Add token validation middleware
- [ ] Create logout functionality
- [ ] Add password reset flow

## Acceptance Criteria

- [ ] Users can log in with email and password
- [ ] JWT tokens are generated and returned on successful login
- [ ] Protected routes require valid JWT token
- [ ] Tokens expire after 24 hours
- [ ] Users can log out and invalidate their token

## Technical Details

- Use \`jsonwebtoken\` library for JWT handling
- Store refresh tokens in database
- Use HTTP-only cookies for token storage (optional)
- Implement rate limiting on login endpoint

## Type

enhancement

## Priority

high`;

await createIssue(
  "vitorsousa",
  "artemis-tasks",
  `${tskNumber} - Implement JWT authentication`,
  {
    body: taskBody,
    labels: ["enhancement", "backend", "security"],
  }
);
