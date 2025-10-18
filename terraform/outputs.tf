output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.portfolio.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.portfolio.arn
}

output "s3_bucket_region" {
  description = "AWS region of the S3 bucket"
  value       = aws_s3_bucket.portfolio.region
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (use this to access your site)"
  value       = aws_cloudfront_distribution.portfolio.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (needed for invalidations)"
  value       = aws_cloudfront_distribution.portfolio.id
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.portfolio.arn
}

output "cloudfront_oai_iam_arn" {
  description = "ARN of the CloudFront Origin Access Identity"
  value       = aws_cloudfront_origin_access_identity.portfolio.iam_arn
}

output "website_url" {
  description = "URL to access your portfolio website"
  value       = "https://${aws_cloudfront_distribution.portfolio.domain_name}"
}

output "deployment_instructions" {
  description = "Instructions for deploying your portfolio"
  value       = <<-EOT
    Your infrastructure is ready! Follow these steps to deploy:

    1. Build your React application:
       npm run build

    2. Deploy to S3:
       aws s3 sync dist/ s3://${aws_s3_bucket.portfolio.id}/ --delete

    3. Invalidate CloudFront cache:
       aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.portfolio.id} --paths "/*"

    4. Access your site:
       https://${aws_cloudfront_distribution.portfolio.domain_name}

    For custom domain setup, uncomment Route 53 section in main.tf and run terraform apply again.
  EOT
}
