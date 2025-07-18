#!/bin/bash

# EmailGenius ConvertKit Application Control Script
# This script helps manage development and deployment configurations

echo "🚀 EmailGenius ConvertKit Application Control System"
echo "===================================================="
echo ""

# Function to show current environment variable values
show_current_config() {
    echo "📋 Current Configuration:"
    echo "   NODE_ENV: ${NODE_ENV:-'not set (defaults to development)'}"
    echo "   GEMINI_API_KEY: ${GEMINI_API_KEY:+'set (hidden)'}"
    echo "   NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:-'not set'}"
    echo "   VERTEX_AI_PROJECT_ID: ${VERTEX_AI_PROJECT_ID:-'not set'}"
    echo "   VERTEX_AI_LOCATION: ${VERTEX_AI_LOCATION:-'not set'}"
    echo ""
}

# Function to set development configuration
set_development() {
    echo "🟡 Setting Development Configuration..."
    echo ""
    echo "# EmailGenius ConvertKit - DEVELOPMENT" > /tmp/app_config_dev.env
    echo "NODE_ENV=development" >> /tmp/app_config_dev.env
    echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" >> /tmp/app_config_dev.env
    echo "# Add your API keys below:" >> /tmp/app_config_dev.env
    echo "GEMINI_API_KEY=your_gemini_api_key_here" >> /tmp/app_config_dev.env
    echo "VERTEX_AI_PROJECT_ID=your_vertex_ai_project_id" >> /tmp/app_config_dev.env
    echo "VERTEX_AI_LOCATION=us-central1" >> /tmp/app_config_dev.env
    echo ""
    echo "✅ Configuration for DEVELOPMENT:"
    cat /tmp/app_config_dev.env
    echo ""
    echo "📝 To apply: Copy these lines to your .env.local file and restart the app"
    echo ""
}

# Function to set production configuration
set_production() {
    echo "🟢 Setting Production Configuration..."
    echo ""
    echo "# EmailGenius ConvertKit - PRODUCTION" > /tmp/app_config_prod.env
    echo "NODE_ENV=production" >> /tmp/app_config_prod.env
    echo "NEXT_PUBLIC_APP_URL=https://your-domain.com" >> /tmp/app_config_prod.env
    echo "# Production API keys (set these in your deployment environment):" >> /tmp/app_config_prod.env
    echo "GEMINI_API_KEY=\${GEMINI_API_KEY}" >> /tmp/app_config_prod.env
    echo "VERTEX_AI_PROJECT_ID=\${VERTEX_AI_PROJECT_ID}" >> /tmp/app_config_prod.env
    echo "VERTEX_AI_LOCATION=us-central1" >> /tmp/app_config_prod.env
    echo ""
    echo "✅ Configuration for PRODUCTION:"
    cat /tmp/app_config_prod.env
    echo ""
    echo "📝 To apply: Set these variables in your production environment"
    echo ""
}

# Function to test the current configuration
test_configuration() {
    echo "🧪 Testing Current Configuration..."
    echo ""
    
    # Check if Next.js is running
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Next.js server is running on http://localhost:3000"
        echo "🔗 EmailGenius URL: http://localhost:3000"
        echo ""
        echo "🧪 Test Steps:"
        echo "   1. Visit http://localhost:3000"
        echo "   2. Enter a product URL and campaign ID"
        echo "   3. Generate email content"
        echo "   4. Check browser console for any errors"
        echo ""
        echo "Expected Behavior:"
        echo "   - Email content generation works"
        echo "   - Image generation works (if configured)"
        echo "   - No API errors in console"
        echo ""
    else
        echo "❌ Next.js server is not running"
        echo "🚀 Start with: npm run dev"
        echo ""
    fi
}

# Function to check API health
check_api_health() {
    echo "🏥 Checking API Health..."
    echo ""
    
    # Check health endpoint
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo "✅ Health API endpoint is responding"
        curl -s http://localhost:3000/api/health | jq . 2>/dev/null || echo "Health endpoint response received"
    else
        echo "❌ Health API endpoint is not responding"
    fi
    echo ""
    
    # Check if API keys are configured
    if [ -f ".env.local" ]; then
        echo "📋 Environment file exists: .env.local"
        if grep -q "GEMINI_API_KEY" .env.local; then
            echo "✅ GEMINI_API_KEY is configured"
        else
            echo "❌ GEMINI_API_KEY is not configured"
        fi
    else
        echo "❌ .env.local file not found"
    fi
    echo ""
}

# Function to show deployment instructions
show_deployment_info() {
    echo "🚀 Deployment Instructions"
    echo "========================="
    echo ""
    echo "For Production Deployment:"
    echo "1. Set environment variables in your hosting platform"
    echo "2. Ensure API keys are properly configured"
    echo "3. Update NEXT_PUBLIC_APP_URL to your domain"
    echo "4. Deploy with: npm run build && npm start"
    echo ""
    echo "Required Environment Variables:"
    echo "   - GEMINI_API_KEY (required for email generation)"
    echo "   - VERTEX_AI_PROJECT_ID (optional, for advanced image generation)"
    echo "   - VERTEX_AI_LOCATION (optional, defaults to us-central1)"
    echo "   - NEXT_PUBLIC_APP_URL (for proper URL generation)"
    echo ""
    echo "🔍 Monitoring:"
    echo "   - Check /api/health endpoint for system status"
    echo "   - Monitor application logs for API errors"
    echo "   - Verify email generation functionality"
    echo ""
}

# Function to build and start application
build_and_start() {
    echo "🔨 Building and Starting EmailGenius ConvertKit..."
    echo ""
    
    echo "Installing dependencies..."
    npm ci
    
    echo "Building application..."
    npm run build
    
    echo "Starting application..."
    npm start &
    
    echo "Application started in background. Check http://localhost:3000"
    echo ""
}

# Main menu
case "$1" in
    "config")
        show_current_config
        ;;
    "dev")
        set_development
        ;;
    "prod")
        set_production
        ;;
    "test")
        test_configuration
        ;;
    "health")
        check_api_health
        ;;
    "deploy")
        show_deployment_info
        ;;
    "build")
        build_and_start
        ;;
    *)
        echo "Usage: $0 {config|dev|prod|test|health|deploy|build}"
        echo ""
        echo "Commands:"
        echo "  config  - Show current configuration"
        echo "  dev     - Generate development configuration"
        echo "  prod    - Generate production configuration"
        echo "  test    - Test current application"
        echo "  health  - Check API health status"
        echo "  deploy  - Show deployment instructions"
        echo "  build   - Build and start the application"
        echo ""
        echo "EmailGenius ConvertKit - AI-Powered Email Campaign Generator"
        echo ""
        ;;
esac
