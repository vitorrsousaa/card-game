/**
 * Fake userId used when authentication is not yet implemented.
 * Valid UUID v4 so it passes zod .uuid() validation.
 * Replace with real auth middleware (JWT) when ready.
 */
export const MOCK_USER_ID = "c80b80ce-b491-4ef7-9ce4-ac25f6c43805" as const;
