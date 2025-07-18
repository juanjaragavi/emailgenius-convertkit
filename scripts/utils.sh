#!/bin/bash

# EmailGenius ConvertKit Quick Utility Script
# This script provides quick access to common development tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to check if we're in the correct directory
check_directory() {
    if [ ! -f "package.json" ] || [ ! -d "src" ]; then
        print_error "This script must be run from the EmailGenius ConvertKit root directory"
        exit 1
    fi
}

# Function to start development server
start_dev() {
    print_status "Starting development server..."
    check_directory
    
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found. Creating from example..."
        cp .env.example .env.local
        print_info "Please edit .env.local with your API keys before continuing"
        return 1
    fi
    
    npm run dev
}

# Function to build for production
build_app() {
    print_status "Building application for production..."
    check_directory
    
    npm run build
    print_status "Build completed successfully!"
}

# Function to run quick commit and push
quick_commit() {
    print_status "Quick commit and push..."
    check_directory
    
    if [ -z "$1" ]; then
        print_error "Please provide a commit message"
        echo "Usage: $0 commit \"Your commit message\""
        exit 1
    fi
    
    git add .
    git commit -m "$1"
    git push
    print_status "Changes committed and pushed!"
}

# Function to check project status
status_check() {
    print_status "Checking EmailGenius ConvertKit status..."
    check_directory
    
    echo ""
    print_info "Git Status:"
    git status --short
    
    echo ""
    print_info "Current Branch:"
    git branch --show-current
    
    echo ""
    print_info "Package Info:"
    grep '"name"\|"version"' package.json
    
    echo ""
    print_info "Environment Check:"
    if [ -f ".env.local" ]; then
        echo "✅ .env.local exists"
        if grep -q "GEMINI_API_KEY" .env.local; then
            echo "✅ GEMINI_API_KEY configured"
        else
            echo "❌ GEMINI_API_KEY not configured"
        fi
    else
        echo "❌ .env.local not found"
    fi
    
    echo ""
    print_info "Node.js Version:"
    node --version
    
    echo ""
    print_info "NPM Version:"
    npm --version
}

# Function to setup the project
setup_project() {
    print_status "Setting up EmailGenius ConvertKit project..."
    check_directory
    
    print_info "Installing dependencies..."
    npm install
    
    if [ ! -f ".env.local" ]; then
        print_info "Creating .env.local from example..."
        cp .env.example .env.local
        print_warning "Please edit .env.local with your actual API keys"
    fi
    
    print_status "Project setup completed!"
    print_info "Next steps:"
    echo "1. Edit .env.local with your API keys"
    echo "2. Run: $0 dev"
}

# Function to clean project
clean_project() {
    print_status "Cleaning project..."
    check_directory
    
    print_info "Removing node_modules..."
    rm -rf node_modules
    
    print_info "Removing .next build directory..."
    rm -rf .next
    
    print_info "Removing package-lock.json..."
    rm -f package-lock.json
    
    print_status "Project cleaned! Run '$0 setup' to reinstall dependencies."
}

# Function to show help
show_help() {
    echo "EmailGenius ConvertKit Utility Script"
    echo "====================================="
    echo ""
    echo "Usage: $0 [command] [arguments]"
    echo ""
    echo "Commands:"
    echo "  dev                    - Start development server"
    echo "  build                  - Build for production"
    echo "  status                 - Check project status"
    echo "  setup                  - Setup project (install deps, create .env)"
    echo "  clean                  - Clean project (remove node_modules, .next)"
    echo "  commit \"message\"       - Quick commit and push with message"
    echo "  help                   - Show this help message"
    echo ""
    echo "Advanced Scripts (in ./scripts/ directory):"
    echo "  ./scripts/app-control.sh     - Application control and configuration"
    echo "  ./scripts/git-workflow.sh    - Complete Git workflow automation"
    echo "  ./scripts/sync-branches.sh   - Synchronize all Git branches"
    echo "  ./scripts/deploy_update.sh   - Production deployment script"
    echo ""
    echo "Examples:"
    echo "  $0 dev                             # Start development"
    echo "  $0 commit \"Add new feature\"       # Quick commit"
    echo "  $0 status                          # Check project status"
    echo "  ./scripts/app-control.sh health    # Check API health"
    echo ""
}

# Main command handling
case "$1" in
    "dev")
        start_dev
        ;;
    "build")
        build_app
        ;;
    "status")
        status_check
        ;;
    "setup")
        setup_project
        ;;
    "clean")
        clean_project
        ;;
    "commit")
        quick_commit "$2"
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        if [ -z "$1" ]; then
            show_help
        else
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
        fi
        ;;
esac
