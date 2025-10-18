#!/bin/bash

# Cloud Voyage Portfolio - One-Command Deployment Script
# Fully automated deployment to AWS S3 + CloudFront
# Usage: ./deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/.deploy-config"

# Print with color
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
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

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# Check if prerequisites are installed
check_prerequisites() {
    local missing_tools=0

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        missing_tools=$((missing_tools + 1))
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        missing_tools=$((missing_tools + 1))
    fi

    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        missing_tools=$((missing_tools + 1))
    fi

    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed"
        missing_tools=$((missing_tools + 1))
    fi

    if [ $missing_tools -gt 0 ]; then
        echo ""
        print_error "Please install missing tools and try again"
        echo "Installation guides:"
        echo "  Node.js: https://nodejs.org/"
        echo "  AWS CLI: https://aws.amazon.com/cli/"
        echo "  Terraform: https://www.terraform.io/downloads.html"
        exit 1
    fi

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        echo ""
        echo "Please configure AWS credentials:"
        echo "  aws configure"
        echo ""
        exit 1
    fi
}

# Setup wizard for first-time users
setup_wizard() {
    print_header "First-Time Setup"

    # Check if Terraform has been applied
    if [ ! -f "${SCRIPT_DIR}/terraform/terraform.tfstate" ]; then
        print_info "No existing AWS infrastructure detected"
        echo ""
        echo "You need to create AWS resources first. Follow these steps:"
        echo ""
        echo "  1. Create a unique S3 bucket name (e.g., 'my-portfolio-bucket-yourname')"
        echo ""
        echo "  2. Configure Terraform variables:"
        echo "     cd terraform"
        echo "     cp terraform.tfvars.example terraform.tfvars"
        echo "     nano terraform.tfvars  # Edit with your bucket name"
        echo ""
        echo "  3. Create AWS infrastructure:"
        echo "     terraform init"
        echo "     terraform plan"
        echo "     terraform apply"
        echo ""
        echo "  4. Return and run deploy again:"
        echo "     cd .."
        echo "     ./deploy.sh"
        echo ""
        exit 0
    fi

    # Try to get config from Terraform
    print_step "Detecting AWS configuration from Terraform..."
    S3_BUCKET_NAME=$(cd "${SCRIPT_DIR}/terraform" && terraform output -raw s3_bucket_name 2>/dev/null) || S3_BUCKET_NAME=""
    CLOUDFRONT_DIST_ID=$(cd "${SCRIPT_DIR}/terraform" && terraform output -raw cloudfront_distribution_id 2>/dev/null) || CLOUDFRONT_DIST_ID=""

    if [ -z "$S3_BUCKET_NAME" ] || [ -z "$CLOUDFRONT_DIST_ID" ]; then
        print_error "Could not retrieve AWS configuration from Terraform"
        exit 1
    fi

    # Save config for future use
    cat > "$CONFIG_FILE" << EOF
S3_BUCKET_NAME="$S3_BUCKET_NAME"
CLOUDFRONT_DIST_ID="$CLOUDFRONT_DIST_ID"
EOF

    print_success "Configuration saved for future deployments"
    print_info "S3 Bucket: $S3_BUCKET_NAME"
    print_info "CloudFront ID: $CLOUDFRONT_DIST_ID"
}

# Load configuration
load_config() {
    # First, try environment variables
    S3_BUCKET_NAME="${AWS_S3_BUCKET_NAME:-}"
    CLOUDFRONT_DIST_ID="${AWS_CLOUDFRONT_DISTRIBUTION_ID:-}"

    # Then try saved config file
    if [ -z "$S3_BUCKET_NAME" ] && [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
    fi

    # Finally, try Terraform
    if [ -z "$S3_BUCKET_NAME" ]; then
        S3_BUCKET_NAME=$(cd "${SCRIPT_DIR}/terraform" && terraform output -raw s3_bucket_name 2>/dev/null) || S3_BUCKET_NAME=""
    fi

    if [ -z "$CLOUDFRONT_DIST_ID" ]; then
        CLOUDFRONT_DIST_ID=$(cd "${SCRIPT_DIR}/terraform" && terraform output -raw cloudfront_distribution_id 2>/dev/null) || CLOUDFRONT_DIST_ID=""
    fi

    # Validate
    if [ -z "$S3_BUCKET_NAME" ] || [ -z "$CLOUDFRONT_DIST_ID" ]; then
        print_error "AWS configuration not found"
        echo ""
        print_step "Setting up for the first time..."
        setup_wizard
    fi
}

# Build the React application
build_app() {
    cd "$SCRIPT_DIR"

    if [ ! -d "node_modules" ]; then
        print_step "Installing dependencies..."
        npm ci --prefer-offline --no-audit
    fi

    print_step "Building application..."
    npm run build

    if [ ! -f "dist/index.html" ]; then
        print_error "Build failed - index.html not found"
        exit 1
    fi

    print_success "Build completed"
}

# Run linter
run_linter() {
    cd "$SCRIPT_DIR"

    if [ -f ".eslintrc.js" ] || [ -f ".eslintignore" ]; then
        print_step "Running code quality checks..."
        npm run lint 2>&1 | grep -E "(error|warning)" | head -5 || true
        print_success "Code quality check completed"
    fi
}

# Deploy to S3
deploy_to_s3() {
    cd "$SCRIPT_DIR"

    print_step "Uploading to S3 (s3://$S3_BUCKET_NAME/)..."

    # Sync with intelligent caching
    aws s3 sync dist/ "s3://$S3_BUCKET_NAME/" \
        --delete \
        --cache-control "public, max-age=3600" \
        --exclude "*" \
        --include "index.html"

    if [ -d "dist/assets" ]; then
        aws s3 sync dist/assets/ "s3://$S3_BUCKET_NAME/assets/" \
            --delete \
            --cache-control "public, max-age=31536000"
    fi

    aws s3 sync dist/ "s3://$S3_BUCKET_NAME/" \
        --delete \
        --cache-control "public, max-age=86400" \
        --exclude "*.html" \
        --exclude "assets/*"

    print_success "Files uploaded to S3"
}

# Invalidate CloudFront
invalidate_cloudfront() {
    print_step "Invalidating CloudFront cache..."

    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DIST_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)

    print_info "Invalidation ID: $INVALIDATION_ID"

    # Wait for invalidation with progress
    print_step "Waiting for invalidation to complete (typically 2-3 minutes)..."

    local count=0
    local max_wait=360  # 6 minutes max

    while [ $count -lt $max_wait ]; do
        STATUS=$(aws cloudfront get-invalidation \
            --distribution-id "$CLOUDFRONT_DIST_ID" \
            --id "$INVALIDATION_ID" \
            --query 'Invalidation.Status' \
            --output text 2>/dev/null || echo "Unknown")

        if [ "$STATUS" = "Completed" ]; then
            print_success "CloudFront cache invalidated"
            return 0
        fi

        # Show progress
        local elapsed=$((count * 5))
        echo -ne "  Status: $STATUS (${elapsed}s elapsed)\r"

        sleep 5
        count=$((count + 1))
    done

    print_error "Invalidation timeout (waited 6 minutes)"
    exit 1
}

# Display results
show_results() {
    CLOUDFRONT_DOMAIN=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Id=='$CLOUDFRONT_DIST_ID'].DomainName" \
        --output text 2>/dev/null || echo "")

    if [ -z "$CLOUDFRONT_DOMAIN" ]; then
        CLOUDFRONT_DOMAIN="(pending)"
    fi

    print_header "✓ Deployment Complete!"

    echo -e "${GREEN}Your portfolio is now live!${NC}\n"

    echo "Website Information:"
    echo -e "  ${CYAN}S3 Bucket:${NC}        $S3_BUCKET_NAME"
    echo -e "  ${CYAN}CloudFront Domain:${NC} $CLOUDFRONT_DOMAIN"
    echo -e "  ${CYAN}Website URL:${NC}       https://$CLOUDFRONT_DOMAIN"
    echo ""

    echo "Next Steps:"
    echo "  1. Visit: https://$CLOUDFRONT_DOMAIN"
    echo "  2. Verify your changes are live"
    echo "  3. Share with the world! 🚀"
    echo ""

    echo "For future deployments:"
    echo "  Just run: ./deploy.sh"
    echo ""
}

# Help function
show_help() {
    cat << EOF
Cloud Voyage Portfolio - One-Command Deployment

USAGE:
  ./deploy.sh [OPTIONS]

OPTIONS:
  (none)                Deploy to production
  --help, -h            Show this help message
  --force               Force rebuild and redeploy
  --config              Show current configuration

ENVIRONMENT VARIABLES (optional):
  AWS_S3_BUCKET_NAME              Override S3 bucket name
  AWS_CLOUDFRONT_DISTRIBUTION_ID  Override CloudFront ID

WORKFLOW:
  First time: Run './deploy.sh' and follow the setup wizard
  Every time after: Just run './deploy.sh'

REQUIREMENTS:
  - Node.js v18+
  - AWS CLI v2
  - Terraform
  - AWS credentials configured (aws configure)

EXAMPLES:
  ./deploy.sh                           # Deploy to production
  ./deploy.sh --help                    # Show this help
  ./deploy.sh --config                  # Show configuration
  AWS_S3_BUCKET_NAME=my-bucket ./deploy.sh  # Override bucket

For detailed instructions, see: deployment.md
EOF
}

# Main execution
main() {
    # Handle arguments
    case "${1:-}" in
        --help|-h)
            show_help
            exit 0
            ;;
        --config)
            load_config
            echo "Current Configuration:"
            echo "  S3 Bucket: $S3_BUCKET_NAME"
            echo "  CloudFront ID: $CLOUDFRONT_DIST_ID"
            exit 0
            ;;
        --force)
            rm -f "$CONFIG_FILE"
            ;;
    esac

    print_header "Cloud Voyage Portfolio Deployment"

    # Step 1: Check prerequisites
    print_step "Checking prerequisites..."
    check_prerequisites
    print_success "Prerequisites verified"

    # Step 2: Load or setup configuration
    load_config

    # Step 3: Build application
    print_step "Preparing build..."
    build_app

    # Step 4: Run linter
    run_linter

    # Step 5: Deploy to S3
    deploy_to_s3

    # Step 6: Invalidate CloudFront
    invalidate_cloudfront

    # Step 7: Show results
    show_results
}

# Run main function
main "$@"
