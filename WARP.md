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

## Image Generation Process Using Google's Imagen LLM (Vertex AI)

### Overview

The image generation in this Next.js project is tightly integrated with Google Cloud's Vertex AI platform, using the Imagen large language model (LLM) specialized for generating high-quality images from text prompts. The user provides an "Image Concept" as part of the email campaign content, which triggers the generation of a corresponding image. This service runs asynchronously and updates the UI progressively for user feedback.

### Backend: API Route for Image Generation

**File:** `src/app/api/generate-image/route.ts`

**Purpose:** This API endpoint handles POST requests containing the `imageConcept` prompt.

**Process Steps:**

1. **Input Validation:** Checks if `imageConcept` text is provided; returns 400 error if missing.
2. **Vertex AI Service:** Calls the `generateImage` method from the `VertexAIService` class.
3. **Response:** Returns the generated image as a Data URL encoded in base64.
4. **Error Handling:** Differentiates authentication, quota, network errors, and general failures with corresponding HTTP status codes (401, 429, 503, 500).

### Core Service: Vertex AI Integration

**File:** `src/lib/vertexai.ts`

**Class:** `VertexAIService`

**Key Configuration:**

- Uses Google Auth library to manage OAuth2 credentials and access tokens
- Hardcoded project ID: `absolute-brook-452020-d5`
- Location: `us-central1`
- Imagen model ID: `imagen-4.0-generate-preview-06-06`
- Endpoint URL constructed according to Vertex AI prediction API format for Imagen

**Image Request Parameters:**

- **instances**: Array containing the `prompt` string
- **parameters**: Configurations such as:
  - `aspectRatio`: "16:9"
  - `sampleCount`: 1
  - `negativePrompt`: Describes visual artifacts to avoid (disfigurements, low resolution, grainy textures, etc.)
  - `enhancePrompt`: false
  - `personGeneration`: "allow_all"
  - `safetySetting`: "block_few"
  - `addWatermark`: false
  - `includeRaiReason`: true
  - `language`: "auto"

**Authentication:** Uses Bearer token from GoogleAuth with cloud-platform scope

**Response Handling:**

- Parses JSON response for image data encoded in base64
- Constructs and returns a Data URL (e.g., `data:image/png;base64,...`)
- Includes comprehensive error management for token failures, no predictions, or missing image data

### Frontend: User Interface and Image Display

**File:** `src/app/page.tsx`

**Image Generation Trigger:**
The UI invokes `handleImageGeneration(imageConcept)` when email content generation completes and an image concept is parsed from the AI output.

**Handler Flow:**

1. Sets loading and progress UI states (`setImageLoading`, `setImageProgress`)
2. Issues a POST request to `/api/generate-image` with JSON body `{ imageConcept }`
3. Receives JSON response with `imageUrl` (a base64 data URL)
4. Updates progress states and sets the `imageUrl` state, triggering re-render

**Image Display:**

- Renders the generated image using Next.js `Image` component with fixed size (512x512) and styling
- Shows loading and progress messages during generation with purple gradient theme
- Progressive UI updates with animated progress bars

**Download Function:**

- Allows the user to download the generated image as `generated_image.png`
- Fetches the image from the data URL, creates a Blob, and triggers a download via a temporary anchor tag
- Includes error handling and user notifications

**Error and Notification Handling:**

- Displays errors from the image generation API with detailed feedback
- Shows notifications for user actions, loading progress, or failures
- 5-second timeout for error notifications

### Image Concept Parsing and Extraction

**Parsing Logic:**
The image concept is extracted from the AI-generated email content using multiple flexible regex patterns:

```typescript
imageConcept: [
  /\*\*Image Concept:\*\*\s*([\s\S]*?)(?=\n\n|\n\*\*|$)/,
  /(?:^|\n)6\.\s*\*\*Image Concept:\*\*\s*([\s\S]*?)(?=\n\n|\n\*\*|$)/,
  /Image\s*Concept:\s*([\s\S]*?)(?=\n\n|\n\*\*|$)/,
],
```

**Content Processing:**

- Preserves internal formatting but cleans up leading/trailing whitespace
- Handles various AI output formats through fallback patterns
- Includes comprehensive debug logging for troubleshooting parsing issues

### Integration with Email Generation Workflow

**Automatic Trigger:**

- Image generation is automatically triggered after email content generation completes
- Extracts the image concept from the parsed email fields
- Falls back gracefully if no image concept is found

**User Experience:**

- Visual progress bars and notifications inform the user of the ongoing image generation process
- Clear fallback messages if image concept is missing or API fails
- Seamless integration with the overall email campaign generation workflow

**Progressive UI Updates:**

- Both broadcast generation and image generation provide streaming or progressive textual feedback
- Real-time status updates during image generation
- Visual indicators for successful completion

### Security and Performance Considerations

**Authentication:**

- Handles Google authentication using Application Default Credentials (ADC)
- Secure token management through Google Auth library
- Proper error handling for authentication failures

**API Quotas and Limits:**

- Monitors API quota limits and gracefully reports overloaded usage
- Specific error codes for different failure types (429 for quota exceeded)
- Clear user guidance for resolving common issues

**Image Processing:**

- Base64 data URL format for efficient client-side handling
- Optimized image size (16:9 aspect ratio, single sample)
- Built-in safety settings and content filtering

### Technical Implementation Details

**State Management:**

```typescript
const [imageUrl, setImageUrl] = useState("");
const [imageLoading, setImageLoading] = useState(false);
const [imageProgress, setImageProgress] = useState("");
```

**Error Handling Strategy:**

- Differentiated error messages based on error types
- User-friendly notifications with actionable guidance
- Graceful degradation when image generation fails

**File Download Implementation:**

- Blob creation from base64 data URL
- Temporary anchor element for download trigger
- Automatic cleanup of object URLs

This integrated approach ensures that generated broadcast emails are accompanied by compelling AI-generated images aligned perfectly with the described "Image Concept," leveraging Google's advanced Imagen model via the Vertex AI API.
