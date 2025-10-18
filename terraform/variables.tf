variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., production, staging, development)"
  type        = string
  default     = "production"
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for the static website. Must be globally unique."
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.s3_bucket_name)) && length(var.s3_bucket_name) >= 3 && length(var.s3_bucket_name) <= 63
    error_message = "S3 bucket name must be between 3-63 characters, lowercase letters, numbers, and hyphens only."
  }
}

variable "domain_name" {
  description = "Custom domain name (optional, for Route 53 integration)"
  type        = string
  default     = ""
}

variable "enable_route53" {
  description = "Whether to create Route 53 records for custom domain"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "cloud-voyage-portfolio"
    ManagedBy   = "Terraform"
    CreatedDate = "2025-01-01"
  }
}
