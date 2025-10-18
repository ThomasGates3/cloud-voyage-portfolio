# Deployment Guide: Cloud Voyage Portfolio on AWS

This guide provides step-by-step instructions for deploying the Cloud Voyage Portfolio website to AWS using Terraform and CloudFront.

## Quick Deploy (Automated)

For the fastest deployment experience, use the automated deployment scripts:

### Mac/Linux

```bash
./deploy.sh
```

The script will:
- ✓ Check all prerequisites (Node.js, npm, AWS CLI, Terraform, AWS credentials)
- ✓ Guide you through setup if this is your first deployment
- ✓ Build your React application
- ✓ Run code quality checks
- ✓ Upload files to S3 with smart caching
- ✓ Invalidate CloudFront cache
- ✓ Show your live website URL

### Windows

```bash
deploy.bat
```

Same features as the Mac/Linux version, optimized for Windows Command Prompt and PowerShell.

### Deployment Script Options

```bash
# Deploy to production
./deploy.sh

# Show current configuration
./deploy.sh --config

# Force rebuild and redeploy
./deploy.sh --force

# Show help
./deploy.sh --help
```

**First Time Setup:** The script will detect that Terraform infrastructure hasn't been created yet and guide you through the setup wizard with clear instructions.

---

## Manual Deployment (Step-by-Step)

**When to use this section:**
- Understanding each step in detail
- Troubleshooting deployment issues
- Integrating with CI/CD pipelines
- Customizing the deployment process

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **Bun** package manager
- **AWS CLI** (v2) - [Install](https://aws.amazon.com/cli/)
- **Terraform** (v1.0 or higher) - [Download](https://www.terraform.io/downloads.html)
- **AWS Account** with appropriate permissions (S3, CloudFront, Route 53 - optional)

### AWS Credentials Setup

Configure your AWS credentials locally:

```bash
aws configure
```

You'll be prompted for:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (recommended: `us-east-1` for CloudFront)
- Default output format (recommended: `json`)

Alternatively, set environment variables:

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

## Architecture Overview

The deployment creates the following AWS resources:

1. **S3 Bucket** - Stores static website files (HTML, CSS, JavaScript, assets)
2. **CloudFront Distribution** - CDN for fast global content delivery with HTTPS
3. **Origin Access Identity (OAI)** - Secures S3 bucket access (CloudFront only)
4. **Route 53** (Optional) - DNS management for custom domain

**Cost Estimate:**
- S3 storage: ~$1-5/month
- CloudFront egress: ~$0.085/GB (typical site: $5-20/month)
- Route 53: $0.50/month for zone + $0.40/million queries
- **Total: $10-30/month for typical traffic**

## Deployment Steps

### Step 1: Build Your React Application

First, build the production-ready static files:

```bash
npm run build
# or with Bun:
bun run build
```

This creates a `dist/` directory containing optimized HTML, CSS, and JavaScript files.

**Verify the build:**

```bash
ls -la dist/
# You should see: index.html, assets/, and other files
```

### Step 2: Configure Terraform Variables

1. Navigate to the terraform directory:

```bash
cd terraform
```

2. Copy the example variables file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

3. Edit `terraform.tfvars` and set your values:

```hcl
aws_region     = "us-east-1"
environment    = "production"
s3_bucket_name = "cloud-voyage-portfolio-YOUR-UNIQUE-NAME"
```

⚠️ **Important:** S3 bucket names must be globally unique across all AWS accounts. Use a unique name like:
- `cloud-voyage-portfolio-yourname-2025`
- `portfolio-yourdomain-xyz123`

### Step 3: Initialize Terraform

Initialize Terraform in the `terraform/` directory:

```bash
terraform init
```

This downloads the AWS provider and sets up your local Terraform environment.

**Expected output:**
```
Terraform has been successfully configured!
```

### Step 4: Review Infrastructure Changes

Preview what Terraform will create:

```bash
terraform plan
```

Review the output to ensure it matches your expectations:
- 1 S3 bucket
- 1 CloudFront distribution
- 1 Origin Access Identity
- S3 bucket policy

### Step 5: Deploy Infrastructure to AWS

Create the AWS resources:

```bash
terraform apply
```

When prompted, review the changes and type `yes` to confirm.

**Expected output:**
```
Apply complete! Resources: 8 added, 0 changed, 0 destroyed.

Outputs:
cloudfront_domain_name = "d12345abcdef.cloudfront.net"
cloudfront_distribution_id = "E1234ABCD..."
s3_bucket_name = "cloud-voyage-portfolio-yourname"
website_url = "https://d12345abcdef.cloudfront.net"
```

Save these outputs - you'll need them for the next steps.

### Step 6: Upload Website Files to S3

Deploy your built website to S3:

```bash
aws s3 sync ../dist/ s3://YOUR-BUCKET-NAME/ --delete
```

Replace `YOUR-BUCKET-NAME` with your actual S3 bucket name from Step 2.

**Example:**
```bash
aws s3 sync ../dist/ s3://cloud-voyage-portfolio-yourname/ --delete
```

**Expected output:**
```
upload: dist/index.html to s3://cloud-voyage-portfolio-yourname/index.html
upload: dist/assets/main-xxxxx.js to s3://cloud-voyage-portfolio-yourname/assets/main-xxxxx.js
upload: dist/assets/style-xxxxx.css to s3://cloud-voyage-portfolio-yourname/assets/style-xxxxx.css
[etc...]
```

### Step 7: Invalidate CloudFront Cache

Update CloudFront to serve the newly uploaded files:

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR-DISTRIBUTION-ID \
  --paths "/*"
```

Replace `YOUR-DISTRIBUTION-ID` with the ID from Terraform outputs.

**Example:**
```bash
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD... \
  --paths "/*"
```

**Expected output:**
```
{
  "Invalidation": {
    "Id": "I...",
    "Status": "InProgress",
    "CreateTime": "...",
    "Paths": {
      "Quantity": 1,
      "Items": ["/*"]
    }
  }
}
```

### Step 8: Access Your Website

Your portfolio is now live! Access it using the CloudFront domain:

```
https://YOUR-CLOUDFRONT-DOMAIN.cloudfront.net
```

Example:
```
https://d12345abcdef.cloudfront.net
```

**Verification checklist:**
- [ ] Homepage loads and displays correctly
- [ ] Navigation works and sections scroll smoothly
- [ ] Images and styling are applied
- [ ] Responsive design works on mobile
- [ ] No console errors in browser DevTools

### Step 9 (Optional): Set Up Custom Domain

If you have a custom domain (e.g., `yourname.com`):

#### Option A: Using Route 53 (AWS DNS)

1. **Uncomment Route 53 resources** in `terraform/main.tf`:

```hcl
resource "aws_route53_zone" "portfolio" {
  name = var.domain_name
  # ...
}

resource "aws_route53_record" "portfolio" {
  zone_id = aws_route53_zone.portfolio.zone_id
  name    = var.domain_name
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.portfolio.domain_name
    zone_id                = aws_cloudfront_distribution.portfolio.hosted_zone_id
    evaluate_target_health = false
  }
}
```

2. **Update terraform.tfvars:**

```hcl
domain_name      = "yourname.com"
enable_route53   = true
```

3. **Deploy:**

```bash
terraform apply
```

4. **Update domain registrar** nameservers to point to Route 53 (provided in Terraform outputs)

#### Option B: Using External DNS Provider (GoDaddy, Namecheap, etc.)

1. Add a CNAME record in your DNS provider pointing to CloudFront:

```
CNAME: yourname.com → YOUR-CLOUDFRONT-DOMAIN.cloudfront.net
```

2. Wait for DNS propagation (typically 24-48 hours)

3. Verify: `nslookup yourname.com`

### Step 10: SSL/TLS Certificate (Custom Domain)

When using a custom domain, AWS automatically issues a free SSL certificate via ACM. No additional configuration needed.

**Verify HTTPS works:**
```bash
curl -I https://yourname.com
# Should show: HTTP/2 200
```

## Automatic Deployment with GitHub Actions CI/CD

**⭐ Recommended Approach** - Automatic deployment on every push

Once you've deployed to AWS once (using Terraform), you can set up GitHub Actions to automatically deploy on every commit:

1. **Complete the CI/CD Setup** (see [CI_CD_SETUP.md](./CI_CD_SETUP.md))
2. **Push to main branch:**
   ```bash
   git add -A
   git commit -m "Update portfolio"
   git push origin main
   ```
3. **Website auto-updates in 2-3 minutes**

### How It Works

```
Your commit → GitHub Actions → Build & Test → Deploy to S3 → Invalidate CloudFront → Live!
```

**Benefits:**
- ✅ Fully automated - no manual steps
- ✅ 2-3 minute deployment time
- ✅ Automatic rollback capability
- ✅ Zero downtime updates
- ✅ Free (GitHub Actions included)

For detailed setup instructions, see **[CI_CD_SETUP.md](./CI_CD_SETUP.md)**.

---

## Updating Your Website (Manual)

When you make changes to your portfolio (without CI/CD):

1. **Rebuild the application:**

```bash
npm run build
```

2. **Sync to S3:**

```bash
aws s3 sync dist/ s3://YOUR-BUCKET-NAME/ --delete
```

3. **Invalidate CloudFront cache:**

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR-DISTRIBUTION-ID \
  --paths "/*"
```

Or create a deployment script to automate this:

```bash
#!/bin/bash
# deploy.sh

set -e

echo "Building portfolio..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://$S3_BUCKET_NAME/ --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DIST_ID \
  --paths "/*"

echo "✅ Deployment complete!"
echo "Live at: https://$S3_BUCKET_NAME.cloudfront.net"
```

**Usage:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## Troubleshooting

### Issue: "S3 bucket already exists"

**Solution:** S3 bucket names must be globally unique. Choose a different name in `terraform.tfvars`.

```hcl
s3_bucket_name = "cloud-voyage-portfolio-YOUR-UNIQUE-SUFFIX"
```

### Issue: CloudFront shows "Access Denied" when visiting site

**Solution:**
1. Verify S3 files were uploaded: `aws s3 ls s3://YOUR-BUCKET-NAME/`
2. Wait 5 minutes for CloudFront to propagate
3. Invalidate cache: `aws cloudfront create-invalidation --distribution-id YOUR-ID --paths "/*"`

### Issue: Changes not appearing on website

**Solution:** CloudFront caches files for up to 1 hour by default.

Create an invalidation:
```bash
aws cloudfront create-invalidation --distribution-id YOUR-ID --paths "/*"
```

Wait 2-3 minutes for the invalidation to process.

### Issue: Custom domain still shows old website

**Solution:** DNS propagation takes 24-48 hours.

Check current DNS resolution:
```bash
nslookup yourname.com
# Should point to CloudFront domain
```

### Issue: "Insufficient permissions" error

**Solution:** Verify your AWS credentials have these permissions:
- `s3:ListBucket`
- `s3:GetObject`
- `s3:PutObject`
- `cloudfront:CreateDistribution`
- `cloudfront:CreateInvalidation`

### Issue: Terraform destroy fails

**Solution:** S3 bucket must be empty before deletion:

```bash
aws s3 rm s3://YOUR-BUCKET-NAME/ --recursive
terraform destroy
```

## Monitoring & Maintenance

### View CloudFront Statistics

```bash
aws cloudfront get-distribution-statistics \
  --distribution-id YOUR-DISTRIBUTION-ID
```

### Monitor S3 Storage Usage

```bash
aws s3api list-objects-v2 \
  --bucket YOUR-BUCKET-NAME \
  --summarize
```

### View CloudFront Logs

Enable CloudFront access logs in Terraform (optional) to monitor traffic.

## Rollback to Previous Version

Keep versions in S3:

```bash
aws s3api list-object-versions --bucket YOUR-BUCKET-NAME
```

Restore a previous version if needed:

```bash
aws s3api get-object \
  --bucket YOUR-BUCKET-NAME \
  --key index.html \
  --version-id VERSION-ID \
  index.html
```

## Security Best Practices

1. ✅ **Block public S3 access** - Already configured in Terraform
2. ✅ **Use CloudFront OAI** - Already configured
3. ✅ **Enable versioning** - Already enabled on S3 bucket
4. ✅ **Use HTTPS only** - CloudFront enforces redirect-to-https
5. ✅ **Add security headers** - Consider adding to CloudFront behavior
6. ⚠️ **Never commit terraform.tfvars** - It's already in .gitignore

## Cleanup (Destroy Resources)

To remove all AWS resources and stop incurring charges:

```bash
# Empty S3 bucket
aws s3 rm s3://YOUR-BUCKET-NAME/ --recursive

# Destroy Terraform resources
terraform destroy
```

When prompted, type `yes` to confirm deletion.

**Warning:** This action cannot be undone. Ensure you have backups if needed.

## Next Steps

After deployment:

1. Set up a custom domain (Step 9)
2. Enable CloudFront logging for analytics
3. Set up automated deployments with GitHub Actions
4. Configure email notifications for CloudFront errors
5. Monitor costs with AWS Cost Explorer

## Support & Resources

- **AWS Documentation:** https://docs.aws.amazon.com/
- **Terraform AWS Provider:** https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **CloudFront Guide:** https://docs.aws.amazon.com/cloudfront/
- **S3 Static Website Hosting:** https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html
