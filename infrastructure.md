# Infrastructure Architecture: Cloud Voyage Portfolio

This document describes the AWS infrastructure that powers the Cloud Voyage Portfolio website, including service interactions, data flow, and design decisions.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          End User (Browser)                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS Request
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Route 53 (Optional DNS)                        │
│  • Domain name resolution (yourname.com → CloudFront domain)       │
│  • Health checks (optional)                                         │
│  • TTL: 300 seconds                                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ DNS Resolution
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   CloudFront Distribution (CDN)                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Edge Locations (Global)                                      │  │
│  │ • Cache static assets globally                               │  │
│  │ • Compression enabled                                        │  │
│  │ • Default TTL: 3600 seconds (1 hour)                         │  │
│  │ • Max TTL: 86400 seconds (1 day)                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  • HTTPS/TLS 1.2+ enforced                                          │
│  • Origin Access Identity (OAI) for secure S3 access               │
│  • Custom error handling (404/403 → index.html for SPA)            │
│  • Gzip compression for HTML/CSS/JS                                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/S Request (OAI)
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│              AWS S3 Bucket (Static Website Host)                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Versioning Enabled                                           │  │
│  │ • Track all object versions                                  │  │
│  │ • Enable rollback to previous versions                       │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ Public Access Blocked                                        │  │
│  │ • No direct public access                                    │  │
│  │ • Only CloudFront can access via OAI                         │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ Objects:                                                     │  │
│  │ ├─ index.html (entry point)                                 │  │
│  │ ├─ assets/ (JavaScript bundles, styles, images)             │  │
│  │ │  ├─ main-[hash].js (React app)                            │  │
│  │ │  └─ style-[hash].css (Tailwind CSS)                       │  │
│  │ ├─ favicon.ico                                              │  │
│  │ ├─ robots.txt (SEO)                                         │  │
│  │ └─ resume.pdf (if added)                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  Storage Class: S3 Standard (optimal for frequently accessed files) │
│  Encryption: SSE-S3 (default, sufficient for public content)        │
│  Region: Configurable (default: us-east-1)                         │
└─────────────────────────────────────────────────────────────────────┘
```

## Service Interactions & Data Flow

### 1. Request Flow: User visits yourname.com

```
Step 1: Browser makes HTTPS request
        → yourname.com

Step 2: Route 53 resolves domain name
        → DNS lookup returns CloudFront domain
        → d12345.cloudfront.net

Step 3: Browser connects to CloudFront edge location
        → Closest edge location to user
        → TLS 1.2+ handshake

Step 4: CloudFront checks cache
        ├─ Cache HIT → Serve from edge cache (1-10ms latency)
        └─ Cache MISS → Query origin S3 bucket

Step 5: CloudFront uses OAI to fetch from S3
        → S3 bucket verifies OAI credentials
        → Streams HTML/CSS/JS to CloudFront

Step 6: CloudFront caches response
        → Apply TTL settings (default 1 hour)
        → Return to user with max-age header

Step 7: Browser receives and renders content
        → Parse HTML
        → Download assets (React bundles, images)
        → Execute JavaScript
        → Render interactive UI
```

### 2. Request Flow: Updating Website (CI/CD)

```
Step 1: Developer pushes code to GitHub
        → Runs npm run build

Step 2: Build output created
        → Generates optimized dist/ folder
        → Hashes for cache busting ([name]-[hash].js)

Step 3: Deploy to S3
        → aws s3 sync dist/ s3://bucket/
        → Uploads only changed files (--delete old files)

Step 4: Invalidate CloudFront
        → aws cloudfront create-invalidation
        → Paths: /* (all files)
        → Invalidation status: InProgress → Completed

Step 5: Users see updated content
        → Within 2-3 minutes after invalidation
```

### 3. Asset Request Flow (Browser)

```
Browser downloads assets in order:
1. index.html (1-2 KB, 50-100ms)
   ├─ Parse HTML
   ├─ Discover CSS reference
   └─ Discover JS bundle reference

2. style-[hash].css (50-100 KB, 100-200ms)
   ├─ Download over HTTP/2
   ├─ Gzip compressed
   └─ Apply styles

3. main-[hash].js (150-300 KB, 200-400ms)
   ├─ Download over HTTP/2
   ├─ Gzip compressed
   ├─ Parse JavaScript
   └─ Execute React initialization

4. Images (space-hero.jpg, etc.)
   ├─ Lazy load as user scrolls
   ├─ Each 50-200 KB
   └─ Served from CloudFront cache
```

## AWS Services Deep Dive

### S3 (Simple Storage Service)

**Purpose:** Durably store static website files

**Configuration:**
| Setting | Value | Reason |
|---------|-------|--------|
| Versioning | Enabled | Track file history, enable rollback |
| Public Access | Blocked | Security: prevent accidental exposure |
| Encryption | SSE-S3 | Sufficient for public content |
| ACL | Private | Access only via CloudFront OAI |
| Lifecycle | None (optional) | Consider for old versions cleanup |
| CORS | Not needed | Static site, no cross-origin requests |

**Bucket Policy:** Allows only CloudFront's OAI to read objects

```json
{
  "Effect": "Allow",
  "Principal": {
    "AWS": "arn:aws:iam::cloudfront:user/CloudFront OAI ID"
  },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::bucket-name/*"
}
```

**Cost Calculation:**
- Storage: ~100 MB @ $0.023/GB = ~$0.002/month
- Request: ~100 GET requests/day @ $0.0004/1000 = ~$0.01/month
- **Total: ~$0.01/month**

### CloudFront (Content Delivery Network)

**Purpose:** Cache and globally distribute website content with HTTPS

**How It Works:**

1. **Edge Locations (220+ worldwide)**
   - AWS maintains edge locations on 6 continents
   - Each edge location has cache and origin-fetching capacity

2. **Caching Strategy**
   - Default TTL: 3600 seconds (1 hour)
   - Max TTL: 86400 seconds (1 day)
   - For files with hash names (main-xyz123.js), set Max TTL higher
   - For index.html, set TTL lower (300 seconds) for quick updates

3. **Compression**
   - Gzip compression enabled for text (HTML, CSS, JS)
   - Reduces file sizes by 60-80%
   - Browser decompresses automatically

4. **HTTPS/TLS**
   - Default CloudFront certificate (*.cloudfront.net)
   - Custom domain: ACM certificate (free, auto-renewed)
   - TLS 1.2 minimum
   - Cipher suites: Modern + secure

5. **Origin Access Identity (OAI)**
   - Special CloudFront identity
   - Only this identity can read from S3
   - Blocks direct S3 access
   - Prevents DDoS attacks on S3

6. **Custom Error Responses**
   - 404 Not Found → Serve index.html (for React Router SPA)
   - 403 Forbidden → Serve index.html (for SPA routing)
   - Allows client-side routing without server rewrites

**Cost Calculation:**
- Data transfer out: 10 GB/month @ $0.085/GB = $0.85
- HTTP/HTTPS requests: 100,000/month @ $0.0075/10K = $0.075
- Invalidation requests: 100/month @ $0.005 = $0.50 (first 3000 free)
- **Total: ~$1.50/month for light usage**

### Route 53 (DNS) - Optional

**Purpose:** Manage domain name and health checks

**Configuration (if custom domain):**

```
Record Name: yourname.com
Type: A (Alias)
Alias Target: CloudFront distribution domain
Routing Policy: Simple routing
Evaluate Target Health: false (CloudFront is always healthy)
```

**Why Alias records?**
- No additional charges for Alias queries to AWS resources
- Auto-updates when CloudFront domain changes
- Instant propagation (no 24-48 hour wait)

**Cost Calculation:**
- Hosted Zone: $0.50/month
- Queries: ~100,000/month @ $0.40/million = ~$0.04/month
- **Total: ~$0.54/month**

### ACM (AWS Certificate Manager) - Optional

**Purpose:** Issue and manage SSL/TLS certificates for HTTPS

**Features:**
- Free certificates for AWS resources
- Auto-renewal 45 days before expiry
- No downtime during renewal
- Supports wildcard certificates (*.yourname.com)

**Validation Methods:**
- Email validation (instant)
- DNS validation (recommended, via Route 53)

**Cost:** $0 (free for AWS resources)

## Security Architecture

### Security Layers

```
┌─ Layer 1: HTTPS/TLS Transport ────────────────────────────────────┐
│ • All data encrypted in transit                                    │
│ • Minimum TLS 1.2                                                  │
│ • Certificate pinning available                                    │
└─────────────────────────────────────────────────────────────────────┘

┌─ Layer 2: CloudFront Security ────────────────────────────────────┐
│ • DDoS protection (AWS Shield Standard)                            │
│ • Origin Access Identity (OAI) prevents direct S3 access           │
│ • Origin shields available (extra caching layer)                   │
│ • Web Application Firewall (WAF) optional                          │
│ • Geo-blocking optional                                            │
└─────────────────────────────────────────────────────────────────────┘

┌─ Layer 3: S3 Bucket Security ────────────────────────────────────┐
│ • Block all public access enabled                                  │
│ • Bucket policy restricted to CloudFront OAI                       │
│ • No public read/write access                                      │
│ • Versioning enabled for recovery                                  │
│ • Server-side encryption enabled                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Threat Mitigation

| Threat | Mitigation |
|--------|-----------|
| **DDoS Attack** | CloudFront + AWS Shield Standard absorbs attacks |
| **Direct S3 Access** | S3 public access blocked, OAI required |
| **Man-in-the-Middle** | HTTPS enforced (redirect HTTP → HTTPS) |
| **Content Tampering** | S3 versioning enables rollback |
| **Data Breach** | Only static public content stored (no database) |
| **Certificate Expiry** | ACM auto-renews certificates |

## Performance Optimization

### Caching Strategy

**Immutable Content (Hashed Files)**
```
Pattern: /assets/main-a1b2c3d4.js
Cache-Control: max-age=31536000  (1 year)
Reason: Hash changes = new file, old version never requested
```

**Mutable Content (index.html)**
```
Pattern: /index.html
Cache-Control: max-age=300  (5 minutes)
Reason: Frequently updated, need quick deployments
```

### Performance Metrics

**Load Time Breakdown (First Visit):**
```
DNS Resolution:        100 ms (Route 53 → CloudFront)
TCP Connection:        150 ms (TLS handshake)
TTFB (First Byte):     200 ms (S3 origin fetch)
Content Download:      400 ms (index.html + CSS + JS)
Browser Render:        300 ms (React initialization)
──────────────────────────────
Total:                ~1150 ms (1.15 seconds)

Subsequent Visits:     200-500 ms (cached at edge)
Mobile (4G):          1500-3000 ms (bandwidth limited)
```

### Optimization Techniques

1. **Gzip Compression**
   - HTML: 45 KB → 15 KB (67% reduction)
   - CSS: 80 KB → 20 KB (75% reduction)
   - JS: 250 KB → 70 KB (72% reduction)

2. **Code Splitting**
   - Vite bundles React app efficiently
   - Only loads needed code per page

3. **Image Optimization**
   - space-hero.jpg: Consider WebP format (30% smaller)
   - Lazy load images below fold

4. **HTTP/2**
   - CloudFront uses HTTP/2 automatically
   - Multiplexed requests (parallel downloads)
   - Server push (optional)

## Scalability

### How This Architecture Scales

**Traffic Growth:**
```
1,000 users/month    →  S3 + CloudFront handles seamlessly
1,000,000 users/day  →  Still handles fine (CloudFront autoscales)
100M requests/day    →  Cost increases, but system stable
```

**Why It Scales:**
- **S3:** Automatically scales to any request volume
- **CloudFront:** 220+ edge locations globally, unlimited capacity
- **Route 53:** Automatic scaling, SLA: 100% availability

### Cost Scaling

```
Traffic Growth:     1x → 10x → 100x
Costs Scale:        1x → 8x → 80x (mostly egress)

10 GB/month egress  = $0.85
100 GB/month        = $8.50
1 TB/month          = $85
```

## Disaster Recovery

### Backup & Versioning

**S3 Versioning:**
- Keeps all historical versions of files
- Allows rollback to any previous state
- No additional storage charges for metadata

**Recovery Procedure:**
```bash
# List versions
aws s3api list-object-versions --bucket bucket-name

# Restore specific version
aws s3api get-object \
  --bucket bucket-name \
  --key index.html \
  --version-id VersionID \
  index.html

# Sync restored version to S3
aws s3 sync . s3://bucket-name/
```

### Disaster Scenarios

| Scenario | Recovery | RTO | RPO |
|----------|----------|-----|-----|
| **Accidental file deletion** | Restore from version | 5 min | < 1 min |
| **Malicious content upload** | Rollback entire bucket | 10 min | < 5 min |
| **Regional outage** | CloudFront uses other regions | None (transparent) | N/A |
| **Complete bucket deletion** | Restore from CloudTrail/Backup | 30 min | Variable |

**RTO:** Recovery Time Objective
**RPO:** Recovery Point Objective

## Monitoring & Logging

### CloudWatch Metrics

```
CloudFront Metrics:
├─ Requests (total HTTP/HTTPS requests)
├─ BytesDownloaded (data transferred to clients)
├─ BytesUploaded (data uploaded to origin)
├─ 4xxErrorRate (client errors like 404)
├─ 5xxErrorRate (origin errors)
├─ OriginLatency (time to fetch from S3)
└─ CacheHitRate (% served from cache)
```

### Recommended Alarms

```
Alert if:
- 4xx Error Rate > 5%
- 5xx Error Rate > 0.1%
- OriginLatency > 1000ms (indicates S3 issues)
```

### S3 Access Logging

**Optional: Enable S3 Server Access Logging**
- Logs all requests to S3 bucket
- Can be analyzed with AWS Athena
- Helps debug issues and track usage

## Cost Summary

### Monthly Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| **S3 Storage** | $0.01-0.10 | ~100 MB of files |
| **S3 Requests** | $0.01 | ~3000 PUT/GET requests |
| **CloudFront Data Transfer** | $1-20 | Depends on traffic (10-100+ GB) |
| **CloudFront Requests** | $0.10 | ~100k requests |
| **Route 53** (optional) | $0.50 | Hosted zone + queries |
| **ACM Certificate** | $0 | Free for AWS resources |
| **Data Transfer (inter-region)** | $0 | Included in CloudFront |
| **────────────────────** | **───────** | |
| **TOTAL** | **$1.50-20** | Light-heavy traffic |

### Cost Optimization Tips

1. **Use CloudFront Origins Shield** (+$5/month) if origin latency > 200ms
2. **Enable S3 Intelligent-Tiering** for old versions (minimal savings for portfolio)
3. **Use Route 53 Alias records** instead of standard DNS (free for AWS resources)
4. **Monitor CloudFront cache hit ratio** - aim for 90%+ (current: likely 95%+)

## Future Enhancements

### Phase 2: Add Backend

```
+ API Gateway
+ Lambda functions
+ DynamoDB database
+ For contact form or dynamic content
```

### Phase 3: CI/CD Automation

```
+ GitHub Actions workflow
+ Auto-deploy on git push
+ Automated testing
+ Automated CloudFront invalidation
```

### Phase 4: Analytics & Monitoring

```
+ Google Analytics / Segment
+ CloudFront access logs in S3
+ Athena for log analysis
+ CloudWatch dashboards
```

## References

- **AWS S3 Documentation:** https://docs.aws.amazon.com/s3/
- **CloudFront Documentation:** https://docs.aws.amazon.com/cloudfront/
- **Terraform AWS Provider:** https://registry.terraform.io/providers/hashicorp/aws/latest/
- **AWS Well-Architected Framework:** https://aws.amazon.com/architecture/well-architected/
