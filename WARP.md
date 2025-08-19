# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

EmailGenius ConvertKIT is an AI-powered email marketing campaign generator that leverages Google's Gemini AI to create high-engagement email broadcasts optimized for the ConvertKIT platform. The application transforms product URLs into compelling email campaigns that mimic transactional communications to maximize open rates and conversions.

## Development Commands

### Core Commands

```bash
# Development server with Turbopack (fastest)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Utility Scripts (npm scripts)

```bash
# Quick project status check
npm run status

# Project setup (dependencies + environment)
npm run setup

# Clean project (remove node_modules, .next)
npm run clean

# Git workflow automation
npm run workflow

# Branch synchronization
npm run sync

# Application control and configuration
npm run app-control

# Production deployment
npm run deploy-project
```

### Health Check

```bash
# Check API configuration
curl http://localhost:3010/api/health
# or visit in browser after starting dev server
```

## Architecture Overview

### Core AI Services

- **GeminiService** (`src/lib/gemini.ts`): Handles text generation using Google Gemini AI with streaming responses and conversation history management
- **VertexAIService** (`src/lib/vertexai.ts`): Manages image generation using Google Cloud Vertex AI Imagen model

### API Endpoints

- **`/api/generate`**: Server-sent events streaming endpoint for email content generation
- **`/api/generate-image`**: Image generation endpoint using Vertex AI
- **`/api/health`**: Environment and API key validation

### Frontend Architecture

- **Single-page React application** (`src/app/page.tsx`) with comprehensive state management
- **Real-time streaming UI** with progress indicators and markdown validation
- **Field-level copying** with ConvertKIT integration guidance
- **UTM parameter generation** for campaign tracking

### Content Strategy System

The AI system rotates between different proven email strategies:

- Product dispatch & fulfillment notifications
- Security/verification alerts
- Exclusive test group invitations
- Account status confirmations

## Key Technical Details

### Environment Variables (Required)

```env
GEMINI_API_KEY=your_gemini_api_key_here
# Optional for image generation:
VERTEX_AI_PROJECT_ID=your_project_id
VERTEX_AI_LOCATION=us-central1
```

### Port Configuration

- Development server runs on port **3010** (not standard 3000)
- Configured in package.json dev script

### Language Detection

The system automatically detects target market and language based on URL patterns:

- `us.topfinanzas.com` → English (US)
- `topfinanzas.com/mx` → Spanish (Mexico)

### ConvertKIT Integration

- Uses specific variable syntax: `{{ subscriber.first_name }}`
- Markdown formatting preserved for ConvertKIT processor
- UTM parameters automatically generated based on campaign ID and URL

### Streaming Architecture

- Server-sent events for real-time content generation
- Progress updates throughout AI processing
- Automatic image generation after content completion

## Development Workflow

### Branch Structure

- **main**: Production-ready code
- **dev**: Development branch (primary working branch)
- **backup**: Emergency rollback branch

### Commit Process

1. Work on `dev` branch
2. Use `npm run workflow` for automated Git workflow
3. System reads commit messages from `src/lib/documents/commit-message.txt` if available
4. Automatic merge to main/backup branches (optional)

### MCP Tools Integration

The project includes comprehensive MCP (Model Context Protocol) server tools:

- Git operations through MCP commands
- File system operations
- GitHub integration tools

## Testing & Validation

### Markdown Validation

- Built-in validation for ConvertKIT compatibility
- Checks for unmatched bold markers
- Validates bullet point formatting
- Ensures proper ConvertKIT variable syntax

### API Health Monitoring

- Environment variable validation
- API key configuration checks
- Service connectivity testing

## Important Rules from Project Guidelines

### Documentation Requirements

- Update `src/lib/documents/DOCUMENTATION.md` when modifying features
- Keep `README.md` in sync with new capabilities
- Maintain changelog entries

### Code Patterns

- Prefer composition over inheritance
- Use repository pattern for data access
- Generate API clients using OpenAPI Generator

### Push and Commit Process

When user says "Push and commit our latest changes":

1. Clear `src/lib/documents/commit-message.txt`
2. Check git status via MCP git_status tool
3. Populate commit message file
4. Run `npm run workflow`

## Common Development Tasks

### Running Single Tests

The project uses Next.js testing patterns. Refer to individual component files for testing approaches.

### Adding New Email Strategies

1. Modify the conversation history in `GeminiService.generateContent()`
2. Update system prompts in `siText1` object
3. Test with different URL patterns for language detection

### Extending Image Generation

- Modify `VertexAIService` parameters for different aspect ratios
- Update safety settings in the request body
- Adjust negative prompts for better quality

### Debugging Parsing Issues

- Enable debug mode in `parseEmailFields()` function
- Check console output for field extraction patterns
- Use `debugParseFields()` for troubleshooting

## Server Configuration

### Google Cloud Platform Setup

- Project uses GCP Compute Engine VM running Apache 2.0 on Ubuntu 22.04 LTS
- PM2 process management for production deployment
- Use `sudo` commands when executing on remote servers (not local machine)

### Production Deployment

```bash
# On production server
sudo ./scripts/deploy_update.sh
```

This includes dependency updates, build process, and PM2 restart.

## Troubleshooting

### Common Issues

1. **API Key Problems**: Check `/api/health` endpoint
2. **Build Failures**: Verify Node.js compatibility and dependencies
3. **Streaming Issues**: Check network connectivity and API quotas
4. **Parsing Failures**: Review AI output format in debug mode

### Debug Mode

The frontend includes comprehensive debugging for field parsing issues with detailed console output when extraction fails.
