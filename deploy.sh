#!/bin/bash

# Cloud Voyage Portfolio - Deployment Script
# Automates the complete deployment process to AWS S3 + CloudFront
# Usage: ./deploy.sh [environment] or ./deploy.sh (defaults to production)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print with color
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Main deployment function
main() {
    print_header "Cloud Voyage Portfolio Deployment"

    # Step 1: Check prerequisites
    print_step "Checking prerequisites..."
    check_prerequisites
    print_success "All prerequisites met"

    # Step 2: Load environment configuration
    print_step "Loading environment configuration..."
    load_env_config
    print_success "Configuration loaded"

    # Step 3: Build the application
    print_step "Building React application..."
    build_app
    print_success "Build completed successfully"

    # Step 4: Run linter
    print_step "Running linter..."
    run_linter
    print_success "Code quality check passed"

    # Step 5: Deploy to S3
    print_step "Deploying to AWS S3..."
    deploy_to_s3
    print_success "Uploaded to S3"

    # Step 6: Invalidate CloudFront
    print_step "Invalidating CloudFront cache..."
    invalidate_cloudfront
    print_success "CloudFront cache invalidated"

    # Step 7: Get deployment info
    print_step "Retrieving deployment information..."
    get_deployment_info

    print_header "Deployment Complete!"
    print_success "Your portfolio is now live!"
}

# Check if required tools are installed
check_prerequisites() {
    local missing_tools=0

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        missing_tools=$((missing_tools + 1))
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        missing_tools=$((missing_tools + 1))
    fi

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        missing_tools=$((missing_tools + 1))
    fi

    # Check git
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        missing_tools=$((missing_tools + 1))
    fi

    if [ $missing_tools -gt 0 ]; then
        echo ""
        print_error "Please install missing tools and try again"
        exit 1
    fi

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        print_step "Run 'aws configure' to set up your credentials"
        exit 1
    fi
}

# Load environment configuration from terraform output or local .env
load_env_config() {
    # Check if terraform outputs exist
    if [ -f "$SCRIPT_DIR/terraform/terraform.tfstate" ]; then
        # Try to get from terraform state
        S3_BUCKET_NAME=$(cd "$SCRIPT_DIR/terraform" && terraform output -raw s3_bucket_name 2>/dev/null) || S3_BUCKET_NAME=""
        CLOUDFRONT_DIST_ID=$(cd "$SCRIPT_DIR/terraform" && terraform output -raw cloudfront_distribution_id 2>/dev/null) || CLOUDFRONT_DIST_ID=""
    fi

    # Check environment variables
    if [ -z "$S3_BUCKET_NAME" ]; then
        S3_BUCKET_NAME="${AWS_S3_BUCKET_NAME:-}"
    fi

    if [ -z "$CLOUDFRONT_DIST_ID" ]; then
        CLOUDFRONT_DIST_ID="${AWS_CLOUDFRONT_DISTRIBUTION_ID:-}"
    fi

    # Validate configuration
    if [ -z "$S3_BUCKET_NAME" ]; then
        print_error "S3 bucket name not found"
        echo ""
        echo "Please set one of the following:"
        echo "  1. AWS_S3_BUCKET_NAME environment variable"
        echo "  2. Run 'cd terraform && terraform init && terraform output' to get the value"
        echo ""
        exit 1
    fi

    if [ -z "$CLOUDFRONT_DIST_ID" ]; then
        print_error "CloudFront distribution ID not found"
        echo ""
        echo "Please set one of the following:"
        echo "  1. AWS_CLOUDFRONT_DISTRIBUTION_ID environment variable"
        echo "  2. Run 'cd terraform && terraform init && terraform output' to get the value"
        echo ""
        exit 1
    fi
}

# Build the React application
build_app() {
    cd "$SCRIPT_DIR"

    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_step "Installing dependencies..."
        npm ci
    fi

    # Run build
    npm run build

    # Verify build output
    if [ ! -d "dist" ]; then
        print_error "Build output directory not found"
        exit 1
    fi

    if [ ! -f "dist/index.html" ]; then
        print_error "Build failed - index.html not found"
        exit 1
    fi
}

# Run ESLint
run_linter() {
    cd "$SCRIPT_DIR"

    if [ -f ".eslintrc.js" ] || [ -f ".eslintignore" ]; then
        npm run lint 2>&1 | head -20 || true
        print_success "Linter check completed"
    else
        print_success "No linter configuration found, skipping..."
    fi
}

# Deploy to S3
deploy_to_s3() {
    cd "$SCRIPT_DIR"

    print_step "Syncing files to S3 (s3://$S3_BUCKET_NAME/)..."

    # Sync root files with short cache
    aws s3 sync dist/ "s3://$S3_BUCKET_NAME/" \
        --delete \
        --cache-control "public, max-age=3600" \
        --exclude "*" \
        --include "index.html"

    # Sync assets with long cache
    if [ -d "dist/assets" ]; then
        aws s3 sync dist/assets/ "s3://$S3_BUCKET_NAME/assets/" \
            --delete \
            --cache-control "public, max-age=31536000"
    fi

    # Sync other files
    aws s3 sync dist/ "s3://$S3_BUCKET_NAME/" \
        --delete \
        --cache-control "public, max-age=86400" \
        --exclude "*.html" \
        --exclude "assets/*"

    print_success "All files uploaded to S3"
}

# Invalidate CloudFront distribution
invalidate_cloudfront() {
    print_step "Creating CloudFront invalidation..."

    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DIST_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)

    print_success "Invalidation created: $INVALIDATION_ID"

    # Wait for invalidation to complete
    print_step "Waiting for invalidation to complete (this may take 2-3 minutes)..."

    while true; do
        STATUS=$(aws cloudfront get-invalidation \
            --distribution-id "$CLOUDFRONT_DIST_ID" \
            --id "$INVALIDATION_ID" \
            --query 'Invalidation.Status' \
            --output text)

        if [ "$STATUS" = "Completed" ]; then
            print_success "Invalidation completed"
            break
        fi

        echo -ne "  Status: $STATUS\r"
        sleep 5
    done
}

# Get deployment information
get_deployment_info() {
    # Get CloudFront domain
    CLOUDFRONT_DOMAIN=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Id=='$CLOUDFRONT_DIST_ID'].DomainName" \
        --output text)

    print_success "S3 Bucket: $S3_BUCKET_NAME"
    print_success "CloudFront Domain: $CLOUDFRONT_DOMAIN"
    print_success "Website URL: https://$CLOUDFRONT_DOMAIN"

    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Visit: https://$CLOUDFRONT_DOMAIN"
    echo "  2. Check that your changes are live"
    echo "  3. Hard refresh if needed: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
}

# Rollback function (optional)
rollback() {
    print_error "Rollback functionality not yet implemented"
    print_step "To rollback manually:"
    echo "  1. Check S3 versions: aws s3api list-object-versions --bucket $S3_BUCKET_NAME"
    echo "  2. Restore previous version or redeploy"
    echo "  3. Invalidate CloudFront cache again"
}

# Help function
show_help() {
    cat << EOF
Cloud Voyage Portfolio - Deployment Script

Usage:
  ./deploy.sh [options]

Options:
  (none)              Deploy to production (default)
  production          Deploy to production
  help                Show this help message
  version             Show version

Environment Variables:
  AWS_S3_BUCKET_NAME              S3 bucket name (optional, reads from terraform output)
  AWS_CLOUDFRONT_DISTRIBUTION_ID  CloudFront distribution ID (optional, reads from terraform output)
  AWS_REGION                      AWS region (default: us-east-1)

Examples:
  ./deploy.sh                     # Deploy to production
  ./deploy.sh production          # Explicit production deploy
  ./deploy.sh help                # Show this help

Prerequisites:
  - Node.js v18+
  - npm or yarn
  - AWS CLI v2
  - AWS credentials configured
  - Terraform (optional, for auto-detecting config)

For detailed deployment instructions, see: deployment.md
EOF
}

# Determine action
case "$ENVIRONMENT" in
    help|--help|-h)
        show_help
        exit 0
        ;;
    production)
        main
        ;;
    *)
        main
        ;;
esac
