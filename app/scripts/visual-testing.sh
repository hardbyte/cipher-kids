#!/bin/bash

# Visual Testing Helper Script
# This script provides convenient commands for visual testing workflows

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if app is built
check_build() {
    if [ ! -d "dist" ]; then
        log_warning "Application not built. Building now..."
        npm run build
    fi
}

# Function to generate all baselines
generate_baselines() {
    log_info "Generating baseline screenshots for all visual tests..."
    check_build
    
    log_info "Generating mobile baselines..."
    npx playwright test tests/visual*.spec.ts --project="Visual Tests - Mobile" --update-snapshots
    
    log_info "Generating desktop baselines..."
    npx playwright test tests/visual*.spec.ts --project="Visual Tests - Desktop" --update-snapshots
    
    log_success "All baseline screenshots generated!"
}

# Function to run visual tests
run_visual_tests() {
    local viewport=${1:-"mobile"}
    
    log_info "Running visual tests for $viewport viewport..."
    check_build
    
    if [ "$viewport" = "mobile" ]; then
        npm run test:visual
    elif [ "$viewport" = "desktop" ]; then
        npm run test:visual:desktop
    elif [ "$viewport" = "all" ]; then
        npm run test:visual:all
    else
        log_error "Invalid viewport: $viewport. Use 'mobile', 'desktop', or 'all'"
        exit 1
    fi
}

# Function to update specific test baselines
update_test() {
    local test_pattern="$1"
    local viewport=${2:-"mobile"}
    
    if [ -z "$test_pattern" ]; then
        log_error "Please provide a test pattern (e.g., 'caesar', 'button')"
        exit 1
    fi
    
    log_info "Updating baselines for tests matching: $test_pattern"
    check_build
    
    local project="Visual Tests - Mobile"
    if [ "$viewport" = "desktop" ]; then
        project="Visual Tests - Desktop"
    fi
    
    npx playwright test tests/visual*.spec.ts --project="$project" --grep="$test_pattern" --update-snapshots
    log_success "Baselines updated for: $test_pattern"
}

# Function to show test report
show_report() {
    if [ -d "playwright-report" ]; then
        log_info "Opening Playwright test report..."
        npx playwright show-report
    else
        log_warning "No test report found. Run visual tests first."
    fi
}

# Function to clean screenshots
clean_screenshots() {
    log_warning "This will delete all baseline screenshots. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        log_info "Cleaning screenshot directories..."
        rm -rf tests/visual*.spec.ts-snapshots/
        rm -rf test-results/
        rm -rf playwright-report/
        log_success "Screenshots cleaned!"
    else
        log_info "Operation cancelled."
    fi
}

# Function to validate screenshots
validate_screenshots() {
    log_info "Validating screenshot directories..."
    
    local mobile_snapshots="tests/visual-cipher-pages.spec.ts-snapshots"
    local component_snapshots="tests/visual-components.spec.ts-snapshots"
    
    if [ -d "$mobile_snapshots" ]; then
        local count=$(find "$mobile_snapshots" -name "*.png" | wc -l)
        log_success "Found $count cipher page screenshots"
    else
        log_warning "No cipher page screenshots found"
    fi
    
    if [ -d "$component_snapshots" ]; then
        local count=$(find "$component_snapshots" -name "*.png" | wc -l)
        log_success "Found $count component screenshots"
    else
        log_warning "No component screenshots found"
    fi
}

# Function to show help
show_help() {
    echo "Visual Testing Helper Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  generate-baselines              Generate all baseline screenshots"
    echo "  test [mobile|desktop|all]       Run visual tests (default: mobile)"
    echo "  update <pattern> [mobile|desktop] Update specific test baselines"
    echo "  report                          Show Playwright test report"
    echo "  clean                           Clean all screenshots (with confirmation)"
    echo "  validate                        Validate screenshot directories"
    echo "  help                            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 generate-baselines           # Generate all baselines"
    echo "  $0 test mobile                  # Run mobile visual tests"
    echo "  $0 update caesar mobile         # Update Caesar cipher baselines"
    echo "  $0 update button desktop        # Update button component baselines"
    echo "  $0 report                       # Open test report"
    echo ""
}

# Main script logic
case "${1:-help}" in
    "generate-baselines")
        generate_baselines
        ;;
    "test")
        run_visual_tests "${2:-mobile}"
        ;;
    "update")
        update_test "$2" "${3:-mobile}"
        ;;
    "report")
        show_report
        ;;
    "clean")
        clean_screenshots
        ;;
    "validate")
        validate_screenshots
        ;;
    "help"|*)
        show_help
        ;;
esac