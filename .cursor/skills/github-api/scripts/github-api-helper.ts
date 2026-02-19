/**
 * GitHub API Helper
 *
 * Utility for creating repositories and managing issues on GitHub
 *
 * Usage:
 *   npx tsx scripts/github-api-helper.ts create-repo <repo-name>
 *   npx tsx scripts/github-api-helper.ts create-issue <owner> <repo> <title> [body]
 *   npx tsx scripts/github-api-helper.ts list-issues <owner> <repo>
 *   npx tsx scripts/github-api-helper.ts setup-repo <repo-name> [owner]
 *
 * Note: Always use the task template from TASK_TEMPLATE.md when creating issues
 */

const GITHUB_API_BASE = "https://api.github.com";

interface GitHubConfig {
	token: string;
	owner: string;
}

function getConfig(): GitHubConfig {
	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		throw new Error(
			"GITHUB_TOKEN não encontrado. Configure a variável de ambiente.",
		);
	}

	return {
		token,
		owner: process.env.GITHUB_OWNER || "",
	};
}

function getHeaders(token: string) {
	return {
		Authorization: `Bearer ${token}`,
		Accept: "application/vnd.github.v3+json",
		"X-GitHub-Api-Version": "2022-11-28",
		"Content-Type": "application/json",
	};
}

async function createRepository(
	name: string,
	options?: {
		description?: string;
		private?: boolean;
		autoInit?: boolean;
	},
) {
	const config = getConfig();
	const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
		method: "POST",
		headers: getHeaders(config.token),
		body: JSON.stringify({
			name,
			description: options?.description || "",
			private: options?.private || false,
			auto_init: options?.autoInit || false,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Failed to create repository: ${error.message}`);
	}

	return await response.json();
}

async function createIssue(
	owner: string,
	repo: string,
	title: string,
	options?: {
		body?: string;
		labels?: string[];
		assignees?: string[];
	},
) {
	const config = getConfig();
	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`,
		{
			method: "POST",
			headers: getHeaders(config.token),
			body: JSON.stringify({
				title,
				body: options?.body || "",
				labels: options?.labels || [],
				assignees: options?.assignees || [],
			}),
		},
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Failed to create issue: ${error.message}`);
	}

	return await response.json();
}

async function listIssues(
	owner: string,
	repo: string,
	options?: {
		state?: "open" | "closed" | "all";
		labels?: string;
	},
) {
	const config = getConfig();
	const params = new URLSearchParams({
		state: options?.state || "open",
		per_page: "100",
	});

	if (options?.labels) {
		params.append("labels", options.labels);
	}

	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?${params}`,
		{
			headers: getHeaders(config.token),
		},
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Failed to list issues: ${error.message}`);
	}

	return await response.json();
}

async function getNextTaskNumber(owner: string, repo: string): Promise<string> {
	// Get all issues (open and closed) to find the highest TSK number
	const allIssues = await listIssues(owner, repo, { state: "all" });

	// Extract TSK numbers from titles
	const tskNumbers: number[] = [];

	for (const issue of allIssues) {
		const match = issue.title.match(/TSK-(\d+)/);
		if (match) {
			tskNumbers.push(Number.parseInt(match[1], 10));
		}
	}

	// Find the next number
	const nextNumber = tskNumbers.length > 0 ? Math.max(...tskNumbers) + 1 : 1;

	// Format as TSK-001, TSK-002, etc.
	return `TSK-${String(nextNumber).padStart(3, "0")}`;
}

async function createLabel(
	owner: string,
	repo: string,
	name: string,
	color: string,
	description?: string,
) {
	const config = getConfig();
	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${owner}/${repo}/labels`,
		{
			method: "POST",
			headers: getHeaders(config.token),
			body: JSON.stringify({
				name,
				color: color.replace("#", ""),
				description: description || "",
			}),
		},
	);

	if (!response.ok) {
		const error = await response.json();
		// Ignorar erro se label já existe
		if (response.status !== 422) {
			throw new Error(`Failed to create label: ${error.message}`);
		}
	}

	return await response.json();
}

async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	try {
		switch (command) {
			case "create-repo": {
				const repoName = args[1];
				if (!repoName) {
					console.error("Uso: create-repo <nome-repo>");
					process.exit(1);
				}

				const repo = await createRepository(repoName, {
					description: "Repository for managing tasks",
					autoInit: true,
				});

				console.log(`✅ Repository created: ${repo.html_url}`);
				break;
			}

			case "create-issue": {
				const [owner, repo, title, ...bodyParts] = args.slice(1);
				if (!owner || !repo || !title) {
					console.error("Usage: create-issue <owner> <repo> <title> [body]");
					process.exit(1);
				}

				// Get next TSK number and format title
				const tskNumber = await getNextTaskNumber(owner, repo);
				const formattedTitle = `${tskNumber} - ${title}`;

				const body = bodyParts.join(" ");
				const issue = await createIssue(owner, repo, formattedTitle, {
					body: body || "",
				});

				console.log(`✅ Issue created: ${issue.html_url}`);
				console.log(`   Title: ${formattedTitle}`);
				break;
			}

			case "list-issues": {
				const [owner, repo] = args.slice(1);
				if (!owner || !repo) {
					console.error("Usage: list-issues <owner> <repo>");
					process.exit(1);
				}

				const issues = await listIssues(owner, repo);
				console.log(`\n📋 ${issues.length} issues found:\n`);
				issues.forEach((issue: any) => {
					console.log(`  #${issue.number} - ${issue.title}`);
					console.log(`  ${issue.html_url}\n`);
				});
				break;
			}

			case "setup-repo": {
				const repoName = args[1];
				if (!repoName) {
					console.error("Uso: setup-repo <nome-repo>");
					process.exit(1);
				}

				const config = getConfig();
				const owner = config.owner || args[2];
				if (!owner) {
					console.error("Configure GITHUB_OWNER or provide as third argument");
					process.exit(1);
				}

				// Create repository
				console.log(`Creating repository ${repoName}...`);
				const repo = await createRepository(repoName, {
					description: `Repository for managing tasks`,
					autoInit: true,
				});

				// Create default labels
				console.log("Creating default labels...");
				const labels = [
					{ name: "bug", color: "d73a4a", desc: "Something isn't working" },
					{
						name: "enhancement",
						color: "a2eeef",
						desc: "New feature or improvement",
					},
					{
						name: "documentation",
						color: "0075ca",
						desc: "Documentation improvements",
					},
					{
						name: "priority-high",
						color: "d73a4a",
						desc: "High priority",
					},
					{
						name: "priority-medium",
						color: "fbca04",
						desc: "Medium priority",
					},
					{
						name: "priority-low",
						color: "0e8a16",
						desc: "Low priority",
					},
				];

				for (const label of labels) {
					try {
						await createLabel(
							owner,
							repoName,
							label.name,
							label.color,
							label.desc,
						);
						console.log(`  ✅ Label created: ${label.name}`);
					} catch (error) {
						console.log(
							`  ⚠️  Label ${label.name} already exists or error creating`,
						);
					}
				}

				// Create initial issue with TSK-001
				console.log("Creating initial issue...");
				await createIssue(
					owner,
					repoName,
					"TSK-001 - Welcome to the tasks repository",
					{
						body: `# Welcome!\n\nThis repository will be used to manage all tasks for the ${repoName} project.\n\n## How to use\n\n- Create an issue for each task\n- Use labels to categorize\n- Assign tasks when necessary\n- All tasks will be numbered automatically (TSK-001, TSK-002, etc.)`,
						labels: ["documentation"],
					},
				);

				console.log(`\n✅ Setup complete! Repository: ${repo.html_url}`);
				break;
			}

			default:
				console.log(`
GitHub API Helper

Available commands:
  create-repo <repo-name>              Create a new repository
  create-issue <owner> <repo> <title> [body]  Create an issue
  list-issues <owner> <repo>           List issues in a repository
  setup-repo <repo-name> [owner]       Create repo with default labels

Required environment variables:
  GITHUB_TOKEN                         GitHub authentication token
  GITHUB_OWNER                         Default owner (optional)

Note: Always use the task template from TASK_TEMPLATE.md when creating issues
        `);
				process.exit(1);
		}
	} catch (error) {
		console.error("❌ Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}

export {
	createIssue,
	createLabel,
	createRepository,
	getConfig,
	getNextTaskNumber,
	listIssues,
};
