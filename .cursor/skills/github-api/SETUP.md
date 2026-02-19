# How to Get and Configure GitHub Token

## Step 1: Create Token on GitHub

### Option A: Via Web Interface (Recommended)

1. **Visit the tokens page:**
   - Go to: https://github.com/settings/tokens
   - Or: GitHub → Your profile (top right) → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Click "Generate new token":**
   - Select "Generate new token (classic)" (not fine-grained token)

3. **Configure the token:**
   - **Note**: Give it a descriptive name (e.g., "Artemis Tasks" or "Cursor GitHub API")
   - **Expiration**: Choose a period:
     - `90 days` (recommended for development)
     - `No expiration` (only if secure and necessary)
   - **Select scopes**: Check the necessary permissions:
     - ✅ **`repo`** - Full access to repositories (required)
       - This includes: create repositories, create issues, manage labels, etc.
     - ✅ **`workflow`** - Manage GitHub Actions (optional, only if needed)

4. **Click "Generate token"** (scroll to the bottom of the page)

5. **⚠️ IMPORTANT: Copy the token immediately!**
   - The token will only be displayed ONCE
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - If you close the page without copying, you'll need to create a new token

### Option B: Via Command Line (GitHub CLI)

If you have GitHub CLI installed:

```bash
gh auth token
```

Or create a new token:

```bash
gh auth refresh -h github.com -s repo
```

## Step 2: Configure Token in Project

### Option 1: Environment Variable in Terminal (Temporary)

To use only in the current terminal session:

```bash
# macOS/Linux
export GITHUB_TOKEN=ghp_your_token_here

# Windows (PowerShell)
$env:GITHUB_TOKEN="ghp_your_token_here"

# Windows (CMD)
set GITHUB_TOKEN=ghp_your_token_here
```

### Option 2: .env File (Recommended)

1. **Create `.env` file in project root** (if it doesn't exist):

```bash
# In project root
touch .env
```

2. **Add token to file:**

```bash
# .env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-github-username
```

3. **Load in terminal:**

```bash
# macOS/Linux - add to ~/.zshrc or ~/.bashrc
export $(cat .env | xargs)

# Or use source (if file has export)
source .env
```

### Option 3: Shell Profile (Permanent)

Add to your shell configuration file:

```bash
# macOS (zsh)
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.zshrc
echo 'export GITHUB_OWNER=your-username' >> ~/.zshrc
source ~/.zshrc

# Linux (bash)
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.bashrc
echo 'export GITHUB_OWNER=your-username' >> ~/.bashrc
source ~/.bashrc
```

## Step 3: Verify It's Working

Test if the token is configured correctly:

```bash
# Check if variable is set
echo $GITHUB_TOKEN

# Test the API (should return your user data)
curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user
```

If it returns your GitHub data (JSON with your username, email, etc.), it's working! ✅

## Security

⚠️ **NEVER do this:**
- ❌ Commit the token to Git
- ❌ Share the token publicly
- ❌ Put the token in code that will be published
- ❌ Use the same token in multiple public projects

✅ **ALWAYS do this:**
- ✅ Add `.env` to `.gitignore` (already configured)
- ✅ Use environment variables
- ✅ Rotate tokens periodically
- ✅ Use tokens with minimum necessary scope
- ✅ Revoke old tokens you no longer use

## Revoke a Token

If you need to revoke a token:

1. Go to: https://github.com/settings/tokens
2. Find the token in the list
3. Click "Revoke"

## Troubleshooting

### Error: "GITHUB_TOKEN not found"
- Check if you exported the variable: `echo $GITHUB_TOKEN`
- Make sure you're in the same terminal where you exported it
- Restart terminal and export again

### Error: "Bad credentials" (401)
- Invalid or expired token
- Verify you copied the complete token (starts with `ghp_`)
- Create a new token if necessary

### Error: "Resource not accessible by integration" (403)
- Token doesn't have sufficient permissions
- Make sure to check the `repo` scope when creating the token

### Error: "API rate limit exceeded" (429)
- You exceeded the limit of 5,000 requests/hour
- Wait or use authentication to increase the limit
