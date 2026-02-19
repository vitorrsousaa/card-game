# Task Template

Use this template when creating new tasks/issues in the GitHub repository.

## Task Numbering

**IMPORTANT:** All tasks must have a sequential number in the title format: `TSK-001`, `TSK-002`, `TSK-003`, etc.

The task number should be:
- At the beginning of the title
- Followed by a space and dash: `TSK-001 - Task Title`
- Automatically incremented based on existing tasks

Example titles:
- ✅ `TSK-001 - Implement JWT authentication`
- ✅ `TSK-002 - Create dashboard component`
- ❌ `Implement JWT authentication` (missing TSK number)
- ❌ `TSK-1 - Task title` (wrong format, use TSK-001)

## Standard Task Template

```markdown
## Description

[Brief description of what needs to be done]

## Objective

[What is the goal of this task? What problem does it solve?]

## Requirements

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Details

[Any technical considerations, architecture decisions, or implementation notes]

## Dependencies

- Related issue #X
- Blocks issue #Y

## Type

[bug | enhancement | documentation | testing | refactoring]

## Priority

[high | medium | low]

## Labels

[enhancement, backend, frontend, etc.]

## References

- Related documentation: [link]
- Related PR: [link]
```

## Example Usage

**Title format:** `TSK-001 - Implement user authentication system using JWT tokens`

```markdown
## Description

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

- Use `jsonwebtoken` library for JWT handling
- Store refresh tokens in database
- Use HTTP-only cookies for token storage (optional)
- Implement rate limiting on login endpoint

## Dependencies

- Blocks: User registration feature
- Related: Password hashing implementation

## Type

enhancement

## Priority

high

## Labels

enhancement, backend, security
```

## Quick Template (Minimal)

For simple tasks:

```markdown
## Description

[What needs to be done]

## Subtasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Type

[bug | enhancement | documentation | testing]
```
