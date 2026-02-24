# Cursor Rules for Artemis Project

This folder contains Cursor AI rules that provide persistent guidance and enforce coding standards across the project.

## 📋 Available Rules

### 1. **project-standards.mdc** (Always Active)
Core project standards that apply to all files:
- Naming conventions (files, components, functions, constants)
- Code organization and monorepo structure
- Import ordering
- Component patterns
- Error handling guidelines

### 2. **import-standards.mdc** (TypeScript/TSX files)
Import path standards:
- Always use `@` aliases instead of relative paths
- Lists all available path aliases
- Examples of good vs bad imports
- Migration guide

### 3. **react-patterns.mdc** (React files)
React and Next.js specific patterns:
- Functional components only
- RenderIf component for conditional rendering
- React Query for server state
- Loading and error state patterns
- Component organization guidelines
- Props and event handler best practices

### 4. **clean-architecture.mdc** (API and SPA modules)
Clean Architecture principles:
- Layer separation (Domain, Application, Infrastructure)
- Module structure for API and SPA
- Dependency Rule
- Mapper pattern for data transformation
- **Factory pattern for dependency injection** (standard format, naming, structure)

### 5. **react-query-patterns.mdc** (Hooks and Services)
React Query data fetching and caching:
- Cache configuration (staleTime, gcTime)
- Recommended cache times by data type
- Query keys structure
- Hook return patterns
- Manual cache invalidation
- Common issues and solutions

### 6. **logging-standards.mdc** (Always Active)
Logging standards and best practices:
- When to use `logger.error()` in try/catch blocks
- When to use `logger.warn()` for errors that don't stop execution
- When to use `logger.debug()` for service-to-service communication
- When to use `logger.info()` for important events
- When NOT to log (normal operations)

## 🚀 How Rules Work

### Automatic Application

1. **Always Apply Rules**: Rules with `alwaysApply: true` are loaded in every conversation
   - Example: `project-standards.mdc`

2. **File-Specific Rules**: Rules with `globs` patterns are loaded when matching files are open
   - Example: `react-patterns.mdc` loads when you open `.tsx` or `.jsx` files
   - Example: `import-standards.mdc` loads for all TypeScript files

### Manual Application

You can also mention rules explicitly in your prompts:
- "Follow the import standards"
- "Use the React patterns we defined"
- "Apply clean architecture principles"

## ✏️ Creating New Rules

1. Create a new `.mdc` file in this folder
2. Add YAML frontmatter with:
   - `description`: Brief description
   - `globs`: File pattern (optional)
   - `alwaysApply`: true/false
3. Write your rule content in Markdown
4. Keep it concise (< 500 lines)
5. Include concrete examples

### Example Structure

```markdown
---
description: Your rule description
globs: **/*.tsx
alwaysApply: false
---

# Rule Title

Your rule content with examples...

## ✅ GOOD
\`\`\`typescript
// Good example
\`\`\`

## ❌ BAD
\`\`\`typescript
// Bad example
\`\`\`
```

## 🎯 Benefits

- **Consistency**: Same patterns across the entire team
- **Onboarding**: New team members learn standards automatically
- **Context**: AI has project-specific knowledge in every conversation
- **Quality**: Fewer mistakes, better code reviews
- **Speed**: Less time explaining standards, more time coding

## 📚 Learn More

- [Cursor Rules Documentation](https://docs.cursor.com/context/rules-for-ai)
- Check the `create-rule` skill for more advanced patterns

## 🔄 Updating Rules

Rules can be updated anytime. Changes take effect in new conversations or when you explicitly reference the rule.

---

**Last Updated**: January 2026
**Maintained By**: Artemis Development Team
