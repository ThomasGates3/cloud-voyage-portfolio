# GitHub Actions CI/CD Setup Guide

This guide explains how to set up automatic deployment of your portfolio website whenever you push changes to GitHub.

## Overview

The CI/CD pipeline automatically:
1. ✅ Builds your React application on every push to `main`
2. ✅ Runs code quality checks (ESLint)
3. ✅ Deploys to AWS S3 bucket
4. ✅ Invalidates CloudFront cache for instant updates
5. ✅ Reports success/failure status

**Deployment time:** ~2-3 minutes from commit to live

---

## Prerequisites

Before setting up CI/CD, ensure you have:

- ✅ AWS S3 bucket created (from Terraform deployment)
- ✅ CloudFront distribution configured
- ✅ AWS IAM user with S3 and CloudFront permissions
- ✅ GitHub repository with code pushed to `main` branch

---

## Step-by-Step Setup

### Step 1: Create AWS IAM User for GitHub Actions

This user will have limited permissions (only S3 and CloudFront access).

1. Go to **AWS Console** → **IAM** → **Users**
2. Click **Create user**
3. Name: `github-actions-deployer`
4. Click **Next**

### Step 2: Create IAM Policy for GitHub Actions

1. Go to **IAM** → **Policies**
2. Click **Create policy**
3. Choose **JSON** editor
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:ListDistributions"
      ],
      "Resource": "*"
    }
  ]
}
```

**Replace `YOUR-BUCKET-NAME`** with your actual S3 bucket name from Terraform.

5. Click **Next**
6. Name: `github-actions-policy`
7. Click **Create policy**

### Step 3: Attach Policy to IAM User

1. Go to **IAM** → **Users** → `github-actions-deployer`
2. Click **Add permissions** → **Attach policies directly**
3. Search for `github-actions-policy`
4. Select and click **Add permissions**

### Step 4: Generate AWS Access Keys

1. In the `github-actions-deployer` user page, go to **Security credentials**
2. Click **Create access key**
3. Select **Application running outside AWS**
4. Click **Next**
5. Click **Create access key**
6. **⚠️ SAVE THESE KEYS** (you won't see them again):
   - Access Key ID
   - Secret Access Key

### Step 5: Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Secret Name | Value |
|------------|-------|
| `AWS_ACCESS_KEY_ID` | Access Key ID from Step 4 |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key from Step 4 |
| `AWS_S3_BUCKET_NAME` | Your S3 bucket name (from Terraform output) |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | Your CloudFront Distribution ID (from Terraform output) |

**Example:**
- `AWS_ACCESS_KEY_ID`: `AKIA5XXXXXXXXXXX`
- `AWS_SECRET_ACCESS_KEY`: `abc123xyz789abc123xyz789abc123xyz789ab`
- `AWS_S3_BUCKET_NAME`: `cloud-voyage-portfolio-yourname`
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`: `E1234ABC...`

### Step 6: Verify Workflow File

The workflow file (`.github/workflows/deploy.yml`) is already in your repository. Check it:

```bash
cat .github/workflows/deploy.yml
```

You should see the GitHub Actions workflow configuration.

---

## Testing the CI/CD Pipeline

### Test Deployment

1. Make a small change to your portfolio (e.g., edit a project description)
2. Commit and push to `main`:
   ```bash
   git add -A
   git commit -m "Test CI/CD pipeline"
   git push origin main
   ```

3. Go to GitHub → your repository → **Actions**
4. Watch the workflow run in real-time
5. Deployment should complete in 2-3 minutes

### Verify Deployment

After workflow completes:

1. Check S3 bucket contents:
   ```bash
   aws s3 ls s3://YOUR-BUCKET-NAME/
   ```

2. Check CloudFront invalidation status:
   ```bash
   aws cloudfront list-invalidations --distribution-id YOUR-DISTRIBUTION-ID
   ```

3. Visit your CloudFront URL to verify changes are live:
   ```
   https://YOUR-CLOUDFRONT-DOMAIN.cloudfront.net
   ```

---

## How CI/CD Works

```
┌─────────────────────────────────┐
│  You push to main branch         │
│  git push origin main            │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│  GitHub Actions triggered        │
│  Workflow starts automatically   │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│  BUILD PHASE                    │
│  • Install dependencies          │
│  • Run linter (npm run lint)     │
│  • Build app (npm run build)     │
│  ✅ Takes ~30 seconds            │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│  DEPLOY PHASE (main branch only) │
│  • Upload to S3                  │
│  • Smart caching headers         │
│  • Invalidate CloudFront         │
│  ✅ Takes ~60 seconds            │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│  ✅ LIVE!                        │
│  Website updated on CloudFront   │
│  Total time: 2-3 minutes         │
└─────────────────────────────────┘
```

---

## Caching Strategy

The workflow implements intelligent caching:

### Short Cache (5 minutes)
- `index.html` - Main entry point changes frequently
- Cached: 300 seconds (5 minutes)

### Long Cache (1 year)
- Static assets: JavaScript, CSS, images
- Hash-based filenames (Vite generates: `main-abc123.js`)
- Cached: 31536000 seconds (1 year)
- When code changes, Vite generates new filenames
- Old files naturally fall out of browser cache

### No Cache
- Resume PDF: Refreshed on each deployment
- Cached: 86400 seconds (1 day)

---

## Monitoring Deployments

### View Deployment Status

1. GitHub → repository → **Actions tab**
2. Click on the workflow run
3. See real-time logs

### Common Status Indicators

| Status | Meaning |
|--------|---------|
| 🟡 Yellow | Workflow running |
| 🟢 Green | Deployment successful |
| 🔴 Red | Deployment failed |

### Check Logs

Click on the failed workflow to see:
- Build errors
- Linting issues
- AWS credentials problems
- S3 upload errors

---

## Troubleshooting

### Issue: "InvalidUserID.Malformed" Error

**Cause:** AWS Access Key ID is incorrect

**Solution:**
1. Check secret in GitHub (Settings → Secrets)
2. Verify it matches AWS IAM user
3. If unsure, regenerate new access keys in AWS

### Issue: "AccessDenied" Error

**Cause:** IAM policy doesn't have S3/CloudFront permissions

**Solution:**
1. Go to AWS IAM → `github-actions-deployer` user
2. Verify policy is attached
3. Check policy JSON matches the S3 bucket name
4. Test with AWS CLI:
   ```bash
   aws s3 ls s3://YOUR-BUCKET-NAME/ \
     --access-key-id YOUR_KEY \
     --secret-access-key YOUR_SECRET
   ```

### Issue: "NoSuchBucket" Error

**Cause:** S3 bucket name in GitHub secret is wrong

**Solution:**
1. Get correct bucket name from Terraform outputs:
   ```bash
   cd terraform
   terraform output s3_bucket_name
   ```
2. Update GitHub secret with correct name

### Issue: CloudFront still shows old content

**Cause:** Cache not invalidated or invalidation in progress

**Solution:**
1. Wait 2-3 minutes for invalidation to complete
2. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Check invalidation status:
   ```bash
   aws cloudfront list-invalidations --distribution-id YOUR-ID
   ```

### Issue: Workflow doesn't trigger on push

**Cause:**
- Pushed to wrong branch (not `main`)
- Workflow file syntax error

**Solution:**
1. Push to `main` branch: `git push origin main`
2. Verify workflow file: `cat .github/workflows/deploy.yml`
3. Check Actions → All workflows for errors

---

## Manual Deployment (Without CI/CD)

If CI/CD is not working, you can deploy manually:

```bash
# 1. Build
npm run build

# 2. Deploy to S3
aws s3 sync dist/ s3://YOUR-BUCKET-NAME/ --delete

# 3. Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR-DISTRIBUTION-ID \
  --paths "/*"
```

---

## Workflow File Breakdown

The workflow file (`.github/workflows/deploy.yml`) does the following:

### On Every Push (including PRs)
- Install dependencies
- Lint code
- Build application

### On Push to Main (Deployment)
- Upload to S3
- Invalidate CloudFront cache
- Report success/failure

### Key Jobs

**`build`**
- Runs: Always
- Steps:
  1. Checkout code
  2. Setup Node.js 18
  3. Install dependencies
  4. Lint code
  5. Build app
  6. Save artifacts

**`deploy`**
- Runs: Only on main branch pushes (after build succeeds)
- Steps:
  1. Configure AWS credentials
  2. Download build artifacts
  3. Upload to S3
  4. Invalidate CloudFront
  5. Report status

---

## Best Practices

✅ **DO**
- Make small, focused commits
- Test locally before pushing (`npm run build && npm run preview`)
- Use meaningful commit messages
- Keep secrets secure (never hardcode AWS keys)

❌ **DON'T**
- Push broken code (it will deploy and break the site)
- Commit `.env` files or credentials
- Store AWS keys in code
- Force push to main (use PRs instead)

---

## Next Steps

1. **Test the workflow:**
   ```bash
   git add -A
   git commit -m "Add GitHub Actions CI/CD"
   git push origin main
   ```

2. **Monitor the deployment:**
   - Go to GitHub Actions tab
   - Watch the workflow complete
   - Verify your site is updated

3. **Create pull requests for changes:**
   ```bash
   # Feature branch
   git checkout -b feature/update-skills
   # Make changes
   git push origin feature/update-skills
   # Create PR on GitHub
   # After merge to main, CI/CD auto-deploys
   ```

---

## Additional Resources

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **AWS IAM Documentation:** https://docs.aws.amazon.com/iam/
- **CloudFront Caching:** https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html
- **S3 Sync Options:** https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html

---

## Rollback (Emergency)

If something goes wrong in production:

```bash
# Manually deploy previous version
aws s3 sync dist-old/ s3://YOUR-BUCKET-NAME/ --delete

# Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id YOUR-ID \
  --paths "/*"
```

Or check S3 versioning to restore previous version:

```bash
# List versions
aws s3api list-object-versions --bucket YOUR-BUCKET-NAME

# Restore specific version
aws s3api get-object \
  --bucket YOUR-BUCKET-NAME \
  --key index.html \
  --version-id VERSION_ID \
  index.html
```

---

**Questions?** Check the workflow logs in GitHub Actions or run workflows manually with AWS CLI.
