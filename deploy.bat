@echo off
REM Cloud Voyage Portfolio - One-Command Deployment Script
REM Fully automated deployment to AWS S3 + CloudFront
REM Usage: deploy.bat

setlocal enabledelayedexpansion

REM Get script directory
set SCRIPT_DIR=%~dp0
set CONFIG_FILE=%SCRIPT_DIR%.deploy-config

REM Configuration variables
set S3_BUCKET_NAME=
set CLOUDFRONT_DIST_ID=

echo.
echo ========================================================
echo   Cloud Voyage Portfolio Deployment
echo ========================================================
echo.

REM Handle arguments
if "%1"=="--help" goto :show_help
if "%1"=="-h" goto :show_help
if "%1"=="--config" goto :show_config
if "%1"=="--force" (
    if exist "%CONFIG_FILE%" del "%CONFIG_FILE%"
)

REM Check prerequisites
echo [*] Checking prerequisites...
call :check_prerequisites
if errorlevel 1 exit /b 1
echo [OK] Prerequisites verified
echo.

REM Load configuration
echo [*] Loading configuration...
call :load_config
if errorlevel 1 exit /b 1
echo [OK] Configuration loaded
echo.

REM Build application
echo [*] Building application...
call :build_app
if errorlevel 1 exit /b 1
echo [OK] Build completed
echo.

REM Deploy to S3
echo [*] Deploying to S3...
call :deploy_to_s3
if errorlevel 1 exit /b 1
echo [OK] Uploaded to S3
echo.

REM Invalidate CloudFront
echo [*] Invalidating CloudFront cache...
call :invalidate_cloudfront
if errorlevel 1 exit /b 1
echo [OK] CloudFront cache invalidated
echo.

REM Show results
call :show_results

echo.
echo ========================================================
echo   Deployment Complete!
echo ========================================================
echo.
echo [OK] Your portfolio is now live!
echo.
exit /b 0

REM ==================== FUNCTIONS ====================

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

REM Check Terraform
where terraform >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Terraform is not installed
    exit /b 1
)

REM Check AWS credentials
aws sts get-caller-identity >nul 2>nul
if errorlevel 1 (
    echo [ERROR] AWS credentials not configured
    echo [*] Run: aws configure
    exit /b 1
)

exit /b 0

:load_config
REM First try environment variables
if not "%AWS_S3_BUCKET_NAME%"=="" (
    set "S3_BUCKET_NAME=%AWS_S3_BUCKET_NAME%"
)
if not "%AWS_CLOUDFRONT_DISTRIBUTION_ID%"=="" (
    set "CLOUDFRONT_DIST_ID=%AWS_CLOUDFRONT_DISTRIBUTION_ID%"
)

REM Try saved config file
if exist "%CONFIG_FILE%" (
    for /f "usebackq tokens=* delims=" %%A in ("%CONFIG_FILE%") do (
        if "!S3_BUCKET_NAME!"=="" (
            for /f "tokens=2 delims==" %%B in ("%%A") do (
                if not "%%B"=="" set "S3_BUCKET_NAME=%%B"
            )
        )
        if "!CLOUDFRONT_DIST_ID!"=="" (
            for /f "tokens=2 delims==" %%B in ("%%A") do (
                if not "%%B"=="" set "CLOUDFRONT_DIST_ID=%%B"
            )
        )
    )
)

REM Try Terraform
if "!S3_BUCKET_NAME!"=="" (
    for /f "delims=" %%A in ('terraform -chdir="%SCRIPT_DIR%terraform" output -raw s3_bucket_name 2^>nul') do (
        set "S3_BUCKET_NAME=%%A"
    )
)

if "!CLOUDFRONT_DIST_ID!"=="" (
    for /f "delims=" %%A in ('terraform -chdir="%SCRIPT_DIR%terraform" output -raw cloudfront_distribution_id 2^>nul') do (
        set "CLOUDFRONT_DIST_ID=%%A"
    )
)

REM Validate
if "!S3_BUCKET_NAME!"=="" (
    echo [ERROR] AWS configuration not found
    echo.
    echo [*] First time setup:
    echo.
    echo   1. Configure Terraform:
    echo      cd terraform
    echo      copy terraform.tfvars.example terraform.tfvars
    echo      (edit terraform.tfvars with your bucket name^)
    echo.
    echo   2. Create AWS infrastructure:
    echo      terraform init
    echo      terraform plan
    echo      terraform apply
    echo.
    echo   3. Return and run deploy:
    echo      cd ..
    echo      deploy.bat
    echo.
    exit /b 1
)

exit /b 0

:build_app
pushd "%SCRIPT_DIR%"

if not exist "node_modules" (
    echo [*] Installing dependencies...
    call npm ci --prefer-offline --no-audit
    if errorlevel 1 exit /b 1
)

echo [*] Building application...
call npm run build
if errorlevel 1 exit /b 1

if not exist "dist\index.html" (
    echo [ERROR] Build failed - index.html not found
    exit /b 1
)

popd
exit /b 0

:deploy_to_s3
pushd "%SCRIPT_DIR%"

echo [*] Uploading to S3 (s3://%S3_BUCKET_NAME%/)...

REM Sync HTML files with short cache
aws s3 sync dist\ "s3://%S3_BUCKET_NAME%/" ^
    --delete ^
    --cache-control "public, max-age=3600" ^
    --exclude "*" ^
    --include "index.html"
if errorlevel 1 exit /b 1

REM Sync assets with long cache
if exist "dist\assets" (
    aws s3 sync "dist\assets\" "s3://%S3_BUCKET_NAME%/assets/" ^
        --delete ^
        --cache-control "public, max-age=31536000"
    if errorlevel 1 exit /b 1
)

REM Sync other files
aws s3 sync dist\ "s3://%S3_BUCKET_NAME%/" ^
    --delete ^
    --cache-control "public, max-age=86400" ^
    --exclude "*.html" ^
    --exclude "assets\*"
if errorlevel 1 exit /b 1

popd
exit /b 0

:invalidate_cloudfront
echo [*] Creating CloudFront invalidation...

for /f "delims=" %%A in ('aws cloudfront create-invalidation --distribution-id "%CLOUDFRONT_DIST_ID%" --paths "/*" --query "Invalidation.Id" --output text') do (
    set "INVALIDATION_ID=%%A"
)

if "!INVALIDATION_ID!"=="" (
    echo [ERROR] Failed to create invalidation
    exit /b 1
)

echo [*] Invalidation ID: %INVALIDATION_ID%
echo [*] Waiting for invalidation to complete...

setlocal enabledelayedexpansion
set "count=0"
set "max_wait=72"

:invalidation_loop
if !count! geq !max_wait! (
    echo [WARNING] Invalidation timeout
    goto :skip_invalidation_wait
)

for /f "delims=" %%A in ('aws cloudfront get-invalidation --distribution-id "%CLOUDFRONT_DIST_ID%" --id "%INVALIDATION_ID%" --query "Invalidation.Status" --output text 2^>nul') do (
    set "status=%%A"
)

if "!status!"=="Completed" (
    echo [OK] CloudFront cache invalidated
    goto :skip_invalidation_wait
)

timeout /t 5 /nobreak >nul
set /a count=!count!+1
goto :invalidation_loop

:skip_invalidation_wait
exit /b 0

:show_results
for /f "delims=" %%A in ('aws cloudfront list-distributions --query "DistributionList.Items[?Id==''%CLOUDFRONT_DIST_ID%''].DomainName" --output text 2^>nul') do (
    set "CLOUDFRONT_DOMAIN=%%A"
)

if "!CLOUDFRONT_DOMAIN!"=="" (
    set "CLOUDFRONT_DOMAIN=(pending)"
)

echo.
echo Website Information:
echo   S3 Bucket:        %S3_BUCKET_NAME%
echo   CloudFront Domain: !CLOUDFRONT_DOMAIN!
echo   Website URL:      https://!CLOUDFRONT_DOMAIN!
echo.

echo Next Steps:
echo   1. Visit: https://!CLOUDFRONT_DOMAIN!
echo   2. Verify your changes are live
echo   3. Share with the world!
echo.

echo For future deployments:
echo   Just run: deploy.bat
echo.

exit /b 0

:show_config
call :load_config
echo.
echo Current Configuration:
echo   S3 Bucket: %S3_BUCKET_NAME%
echo   CloudFront ID: %CLOUDFRONT_DIST_ID%
echo.
exit /b 0

:show_help
echo.
echo Cloud Voyage Portfolio - One-Command Deployment
echo.
echo USAGE:
echo   deploy.bat [OPTIONS]
echo.
echo OPTIONS:
echo   (none)         Deploy to production
echo   --help         Show this help message
echo   --force        Force rebuild and redeploy
echo   --config       Show current configuration
echo.
echo REQUIREMENTS:
echo   - Node.js v18+
echo   - AWS CLI v2
echo   - Terraform
echo   - AWS credentials configured (aws configure)
echo.
echo WORKFLOW:
echo   First time: Run 'deploy.bat' and follow setup wizard
echo   Every time after: Just run 'deploy.bat'
echo.
echo EXAMPLES:
echo   deploy.bat          # Deploy to production
echo   deploy.bat --help   # Show this help
echo   deploy.bat --config # Show configuration
echo.
exit /b 0
