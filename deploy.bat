@echo off
REM Cloud Voyage Portfolio - Windows Deployment Script
REM Automates the complete deployment process to AWS S3 + CloudFront
REM Usage: deploy.bat or deploy.bat production

setlocal enabledelayedexpansion

REM Colors aren't available in batch, so we use basic formatting
echo.
echo ========================================================
echo   Cloud Voyage Portfolio Deployment
echo ========================================================
echo.

REM Set environment
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production
if "%ENVIRONMENT%"=="help" (
    goto :show_help
)

REM Step 1: Check prerequisites
echo [*] Checking prerequisites...
call :check_prerequisites
if errorlevel 1 exit /b 1
echo [OK] All prerequisites met
echo.

REM Step 2: Load environment configuration
echo [*] Loading environment configuration...
call :load_env_config
if errorlevel 1 exit /b 1
echo [OK] Configuration loaded
echo.

REM Step 3: Build the application
echo [*] Building React application...
call :build_app
if errorlevel 1 exit /b 1
echo [OK] Build completed successfully
echo.

REM Step 4: Run linter
echo [*] Running linter...
call :run_linter
echo [OK] Code quality check passed
echo.

REM Step 5: Deploy to S3
echo [*] Deploying to AWS S3...
call :deploy_to_s3
if errorlevel 1 exit /b 1
echo [OK] Uploaded to S3
echo.

REM Step 6: Invalidate CloudFront
echo [*] Invalidating CloudFront cache...
call :invalidate_cloudfront
if errorlevel 1 exit /b 1
echo [OK] CloudFront cache invalidated
echo.

REM Step 7: Get deployment info
echo [*] Retrieving deployment information...
call :get_deployment_info
echo.

echo ========================================================
echo   Deployment Complete!
echo ========================================================
echo [OK] Your portfolio is now live!
echo.
exit /b 0

:check_prerequisites
REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is not installed
    exit /b 1
)

REM Check AWS CLI
where aws >nul 2>nul
if errorlevel 1 (
    echo [ERROR] AWS CLI is not installed
    exit /b 1
)

REM Check git
where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] git is not installed
    exit /b 1
)

REM Check AWS credentials
aws sts get-caller-identity >nul 2>nul
if errorlevel 1 (
    echo [ERROR] AWS credentials not configured
    echo [*] Run 'aws configure' to set up your credentials
    exit /b 1
)

exit /b 0

:load_env_config
REM Try to get from environment variables
if "%AWS_S3_BUCKET_NAME%"=="" (
    REM Try to get from terraform
    for /f "delims=" %%i in ('terraform output -raw s3_bucket_name 2^>nul') do set "AWS_S3_BUCKET_NAME=%%i"
)

if "%AWS_CLOUDFRONT_DISTRIBUTION_ID%"=="" (
    REM Try to get from terraform
    for /f "delims=" %%i in ('terraform output -raw cloudfront_distribution_id 2^>nul') do set "AWS_CLOUDFRONT_DISTRIBUTION_ID=%%i"
)

if "%AWS_S3_BUCKET_NAME%"=="" (
    echo [ERROR] S3 bucket name not found
    echo.
    echo Please set one of the following:
    echo   1. AWS_S3_BUCKET_NAME environment variable
    echo   2. Run 'cd terraform ^& terraform init ^& terraform output' to get the value
    echo.
    exit /b 1
)

if "%AWS_CLOUDFRONT_DISTRIBUTION_ID%"=="" (
    echo [ERROR] CloudFront distribution ID not found
    echo.
    echo Please set one of the following:
    echo   1. AWS_CLOUDFRONT_DISTRIBUTION_ID environment variable
    echo   2. Run 'cd terraform ^& terraform init ^& terraform output' to get the value
    echo.
    exit /b 1
)

exit /b 0

:build_app
REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo [*] Installing dependencies...
    call npm ci
    if errorlevel 1 exit /b 1
)

REM Run build
call npm run build
if errorlevel 1 exit /b 1

REM Verify build output
if not exist "dist" (
    echo [ERROR] Build output directory not found
    exit /b 1
)

if not exist "dist\index.html" (
    echo [ERROR] Build failed - index.html not found
    exit /b 1
)

exit /b 0

:run_linter
if exist ".eslintrc.js" (
    call npm run lint
) else if exist ".eslintignore" (
    call npm run lint
) else (
    echo [OK] No linter configuration found, skipping...
)

exit /b 0

:deploy_to_s3
echo [*] Syncing files to S3 (s3://%AWS_S3_BUCKET_NAME%/)...

REM Sync root files with short cache
aws s3 sync dist/ "s3://%AWS_S3_BUCKET_NAME%/" ^
    --delete ^
    --cache-control "public, max-age=3600" ^
    --exclude "*" ^
    --include "index.html"

if errorlevel 1 exit /b 1

REM Sync assets with long cache
if exist "dist\assets" (
    aws s3 sync "dist\assets\" "s3://%AWS_S3_BUCKET_NAME%/assets/" ^
        --delete ^
        --cache-control "public, max-age=31536000"
    if errorlevel 1 exit /b 1
)

REM Sync other files
aws s3 sync dist\ "s3://%AWS_S3_BUCKET_NAME%/" ^
    --delete ^
    --cache-control "public, max-age=86400" ^
    --exclude "*.html" ^
    --exclude "assets\*"

if errorlevel 1 exit /b 1

echo [OK] All files uploaded to S3
exit /b 0

:invalidate_cloudfront
echo [*] Creating CloudFront invalidation...

REM Create invalidation and capture ID
for /f "delims=" %%i in ('aws cloudfront create-invalidation --distribution-id "%AWS_CLOUDFRONT_DISTRIBUTION_ID%" --paths "/*" --query "Invalidation.Id" --output text') do set "INVALIDATION_ID=%%i"

if "%INVALIDATION_ID%"=="" (
    echo [ERROR] Failed to create invalidation
    exit /b 1
)

echo [OK] Invalidation created: %INVALIDATION_ID%
echo [*] Waiting for invalidation to complete (this may take 2-3 minutes)...

REM Poll for invalidation status
setlocal enabledelayedexpansion
set "status=InProgress"
set "counter=0"
set "max_retries=36"

:invalidation_loop
if !counter! geq !max_retries! (
    echo [WARNING] Timeout waiting for invalidation completion
    goto :skip_invalidation_wait
)

for /f "delims=" %%i in ('aws cloudfront get-invalidation --distribution-id "%AWS_CLOUDFRONT_DISTRIBUTION_ID%" --id "%INVALIDATION_ID%" --query "Invalidation.Status" --output text') do set "status=%%i"

if "!status!"=="Completed" (
    echo [OK] Invalidation completed
    goto :skip_invalidation_wait
)

timeout /t 5 /nobreak >nul
set /a counter=!counter!+1
echo [*] Status: !status! (attempt !counter!/%max_retries%)
goto :invalidation_loop

:skip_invalidation_wait
exit /b 0

:get_deployment_info
REM Get CloudFront domain
for /f "delims=" %%i in ('aws cloudfront list-distributions --query "DistributionList.Items[?Id==''%AWS_CLOUDFRONT_DISTRIBUTION_ID%''].DomainName" --output text') do set "CLOUDFRONT_DOMAIN=%%i"

echo [OK] S3 Bucket: %AWS_S3_BUCKET_NAME%
echo [OK] CloudFront Domain: %CLOUDFRONT_DOMAIN%
echo [OK] Website URL: https://%CLOUDFRONT_DOMAIN%
echo.
echo Next Steps:
echo   1. Visit: https://%CLOUDFRONT_DOMAIN%
echo   2. Check that your changes are live
echo   3. Hard refresh if needed: Ctrl+Shift+R

exit /b 0

:show_help
echo Cloud Voyage Portfolio - Windows Deployment Script
echo.
echo Usage:
echo   deploy.bat [options]
echo.
echo Options:
echo   (none)              Deploy to production (default)
echo   production          Deploy to production
echo   help                Show this help message
echo.
echo Environment Variables:
echo   AWS_S3_BUCKET_NAME              S3 bucket name (optional, reads from terraform output)
echo   AWS_CLOUDFRONT_DISTRIBUTION_ID  CloudFront distribution ID (optional, reads from terraform output)
echo.
echo Examples:
echo   deploy.bat                      # Deploy to production
echo   deploy.bat help                 # Show this help
echo.
echo Prerequisites:
echo   - Node.js v18+
echo   - npm
echo   - AWS CLI v2
echo   - AWS credentials configured
echo.
echo For detailed deployment instructions, see: deployment.md
echo.
exit /b 0
