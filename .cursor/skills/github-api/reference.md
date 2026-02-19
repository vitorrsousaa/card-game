# Quick Reference - GitHub API

## Main Endpoints

### Repositories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/user/repos` | Create repository |
| `GET` | `/repos/{owner}/{repo}` | Get repository information |
| `PATCH` | `/repos/{owner}/{repo}` | Update repository |
| `DELETE` | `/repos/{owner}/{repo}` | Delete repository |
| `GET` | `/user/repos` | List user repositories |

### Issues

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/repos/{owner}/{repo}/issues` | Create issue |
| `GET` | `/repos/{owner}/{repo}/issues` | List issues |
| `GET` | `/repos/{owner}/{repo}/issues/{issue_number}` | Get specific issue |
| `PATCH` | `/repos/{owner}/{repo}/issues/{issue_number}` | Update issue |
| `POST` | `/repos/{owner}/{repo}/issues/{issue_number}/comments` | Add comment |

### Labels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/repos/{owner}/{repo}/labels` | List labels |
| `POST` | `/repos/{owner}/{repo}/labels` | Create label |
| `PATCH` | `/repos/{owner}/{repo}/labels/{name}` | Update label |
| `DELETE` | `/repos/{owner}/{repo}/labels/{name}` | Delete label |

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK - Success |
| `201` | Created - Resource created |
| `204` | No Content - Success without content |
| `304` | Not Modified - Not modified |
| `400` | Bad Request - Invalid request |
| `401` | Unauthorized - Not authenticated |
| `403` | Forbidden - No permission |
| `404` | Not Found - Resource not found |
| `422` | Unprocessable Entity - Invalid data |
| `429` | Too Many Requests - Rate limit exceeded |

## Rate Limits

- **Authenticated**: 5,000 requests/hour
- **Unauthenticated**: 60 requests/hour

Response headers:
- `X-RateLimit-Limit`: Total limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## Label Colors (Hex without #)

Common colors for labels:

| Color | Hex | Usage |
|-------|-----|-------|
| Red | `d73a4a` | Bugs, high priority |
| Light Blue | `a2eeef` | Enhancements |
| Dark Blue | `0075ca` | Documentation |
| Yellow | `fbca04` | Medium priority, warning |
| Green | `0e8a16` | Low priority, success |
| Purple | `b60205` | Critical |
| Orange | `d93f0b` | Urgent |

## Gitignore Templates

Common values for `gitignore_template`:
- `Node`
- `Python`
- `Java`
- `Go`
- `Ruby`
- `Rust`
- `C++`
- `TypeScript`

## License Templates

Common values for `license_template`:
- `mit`
- `apache-2.0`
- `gpl-3.0`
- `bsd-3-clause`
- `mpl-2.0`

## Issue States

- `open`: Issue open
- `closed`: Issue closed
- `all`: All issues

## State Reasons (when closing)

- `completed`: Task completed
- `not_planned`: Will not be implemented
- `reopened`: Reopened

## Common Query Parameters

### List Issues

- `state`: `open`, `closed`, `all`
- `labels`: Comma-separated string (e.g., `bug,enhancement`)
- `assignee`: Assignee username
- `creator`: Creator username
- `per_page`: 1-100 (default: 30)
- `page`: Page number (default: 1)
- `sort`: `created`, `updated`, `comments`
- `direction`: `asc`, `desc`

### List Repositories

- `type`: `all`, `owner`, `member`
- `sort`: `created`, `updated`, `pushed`, `full_name`
- `direction`: `asc`, `desc`
- `per_page`: 1-100 (default: 30)
- `page`: Page number

## Required Headers

```typescript
{
  "Authorization": "Bearer {token}",
  "Accept": "application/vnd.github.v3+json",
  "Content-Type": "application/json", // Only for POST/PATCH
}
```

## API Version

Use header:
```
X-GitHub-Api-Version: 2022-11-28
```

Or in URL:
```
Accept: application/vnd.github.v3+json
```

## Useful Links

- [Official Documentation](https://docs.github.com/en/rest)
- [Repositories API](https://docs.github.com/en/rest/repos/repos)
- [Issues API](https://docs.github.com/en/rest/issues/issues)
- [Labels API](https://docs.github.com/en/rest/issues/labels)
- [Rate Limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [Authentication](https://docs.github.com/en/rest/authentication)
