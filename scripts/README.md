# EmailGenius ConvertKit - Repository Management Scripts

This directory contains Bash scripts adapted from the UK Top Finanzas project to help manage the EmailGenius ConvertKit repository efficiently.

## Available Scripts

### 1. `sync-branches.sh`

**Purpose**: Synchronizes all branches (main, dev, backup) with the latest changes.

**Usage**:

```bash
./scripts/sync-branches.sh
```

**What it does**:

- Fetches latest changes from origin
- Updates main branch
- Merges main into dev and backup branches
- Pushes all changes
- Returns to dev branch for continued development

**Prerequisites**: Clean working directory (no uncommitted changes)

### 2. `git-workflow.sh`

**Purpose**: Automates the complete Git workflow from staging to deployment.

**Usage**:

```bash
./scripts/git-workflow.sh
```

**What it does**:

- Checks repository status
- Stages all changes
- Resolves merge conflicts automatically
- Commits with message from `src/lib/documents/commit-message.txt` or prompts for message
- Pushes to dev branch
- Optionally merges changes to main and backup branches

**Prerequisites**: Must be run from the dev branch

### 3. `deploy_update.sh`

**Purpose**: Production deployment script for server updates.

**Usage**:

```bash
sudo ./scripts/deploy_update.sh
```

**What it does**:

- Pulls latest changes from main branch
- Removes previous build (.next directory)
- Installs/updates dependencies
- Builds the application
- Restarts PM2 process
- Saves PM2 configuration

**Prerequisites**: Requires sudo access and PM2 setup

### 4. `app-control.sh`

**Purpose**: Application configuration and control management.

**Usage**:

```bash
./scripts/app-control.sh {command}
```

**Available Commands**:

- `config` - Show current environment configuration
- `dev` - Generate development configuration template
- `prod` - Generate production configuration template
- `test` - Test current application setup
- `health` - Check API health status
- `deploy` - Show deployment instructions
- `build` - Build and start the application

## Setup Instructions

1. **Make scripts executable** (if not already):

   ```bash
   chmod +x scripts/*.sh
   ```

2. **Create environment files**:

   ```bash
   # Copy example environment file
   cp .env.example .env.local

   # Edit with your actual API keys
   nano .env.local
   ```

3. **Set up commit message template** (optional):

   ```bash
   # Edit the commit message template
   nano src/lib/documents/commit-message.txt
   ```

## Typical Workflow

### Development Workflow

1. Work on features in the `dev` branch
2. When ready to commit and push:

   ```bash
   ./scripts/git-workflow.sh
   ```

3. For branch synchronization:

   ```bash
   ./scripts/sync-branches.sh
   ```

### Production Deployment

1. Ensure changes are merged to main branch
2. On production server:

   ```bash
   sudo ./scripts/deploy_update.sh
   ```

### Configuration Management

1. Check current setup:

   ```bash
   ./scripts/app-control.sh config
   ```

2. Test application:

   ```bash
   ./scripts/app-control.sh test
   ```

3. Check API health:

   ```bash
   ./scripts/app-control.sh health
   ```

## Environment Variables

### Required for Development

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### Required for Production

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
GEMINI_API_KEY=your_production_gemini_api_key
VERTEX_AI_PROJECT_ID=your_vertex_ai_project_id
VERTEX_AI_LOCATION=us-central1
```

## Branch Structure

- **main**: Production-ready code
- **dev**: Development branch for new features
- **backup**: Backup branch for emergency rollbacks

## PM2 Configuration

For production deployment, ensure PM2 is configured:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start npm --name "emailgenius-convertkit" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   chmod +x scripts/*.sh
   ```

2. **Git Conflicts**

   - Scripts automatically resolve conflicts by keeping current branch changes
   - Manual resolution may be needed for complex conflicts

3. **API Key Issues**

   ```bash
   ./scripts/app-control.sh health
   ```

4. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are installed
   - Verify environment variables are set

### Getting Help

1. Check script usage:

   ```bash
   ./scripts/app-control.sh
   ```

2. Test application health:

   ```bash
   ./scripts/app-control.sh test
   ```

3. Review deployment status:

   ```bash
   ./scripts/app-control.sh deploy
   ```

## Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive configuration
- Regularly update dependencies for security patches
- Review script permissions before execution

## Adaptation Notes

These scripts were adapted from the UK Top Finanzas project with the following changes:

1. **Project Name**: Updated all references to EmailGenius ConvertKit
2. **Path Structure**: Adapted to match Next.js src/ directory structure
3. **PM2 Process Name**: Changed to `emailgenius-convertkit`
4. **Environment Variables**: Updated for AI-powered email generation
5. **Port Configuration**: Default to port 3000 for Next.js
6. **API Endpoints**: Added health check and generation endpoints
7. **Build Process**: Enhanced with dependency installation steps

## Contributing

When adding new scripts:

1. Follow the existing naming convention
2. Add comprehensive error handling
3. Include usage documentation
4. Make scripts executable
5. Update this README with new script information
