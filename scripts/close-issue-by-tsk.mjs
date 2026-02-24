#!/usr/bin/env node
/**
 * Close a GitHub issue by TSK number (e.g. TSK-001).
 * Usage: node scripts/close-issue-by-tsk.mjs 001
 * Env: GITHUB_TOKEN, GITHUB_OWNER (default: vitorrsousaa), GITHUB_REPO (default: card-game)
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const GITHUB_API = "https://api.github.com";
const OWNER = process.env.GITHUB_OWNER || "vitorrsousaa";
const REPO = process.env.GITHUB_REPO || "card-game";
const TOKEN = process.env.GITHUB_TOKEN;

const tsk = (process.argv[2] || "001").replace(/^TSK-?/i, "").padStart(3, "0");
const tskLabel = `TSK-${tsk}`;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github.v3+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
};

async function listIssues(state = "open") {
  const res = await fetch(
    `${GITHUB_API}/repos/${OWNER}/${REPO}/issues?state=${state}&per_page=100`,
    { headers }
  );
  if (!res.ok) throw new Error(`List issues: ${res.status} ${await res.text()}`);
  return res.json();
}

async function closeIssue(issueNumber) {
  const res = await fetch(
    `${GITHUB_API}/repos/${OWNER}/${REPO}/issues/${issueNumber}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ state: "closed", state_reason: "completed" }),
    }
  );
  if (!res.ok) throw new Error(`Close issue: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  if (!TOKEN) {
    console.error("Missing GITHUB_TOKEN. Set it in .env or environment.");
    process.exit(1);
  }
  const issues = await listIssues();
  const issue = issues.find((i) => i.title && i.title.startsWith(tskLabel));
  if (!issue) {
    console.error(`Issue with title "${tskLabel} - ..." not found in ${OWNER}/${REPO}.`);
    process.exit(1);
  }
  await closeIssue(issue.number);
  console.log(`Closed: #${issue.number} ${issue.title} -> ${issue.html_url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
