# WebLens — Product Requirements Document

**Product:** WebLens
**Version:** 1.0 MVP
**Document Type:** Product Requirements Document
**Target Build:** Weekend / rapid MVP
**Primary Platform:** Web application
**Primary Goal:** Turn any public website URL into a clear, actionable technical health report.

---

## 1. Product Overview

WebLens is a modern website auditing platform that allows a user to enter a public URL and receive a comprehensive website health report.

The product analyzes the submitted website across multiple categories:

* Performance
* SEO
* Accessibility
* Security
* Mobile readiness
* Technical quality
* Best-practice implementation

The report converts technical findings into an easy-to-understand score, identifies critical problems, explains why they matter, and provides practical recommendations.

### Core Product Promise

> **Enter a URL. Scan it. Understand exactly what is wrong with the website and how to improve it.**

WebLens should feel like a combination of:

* Lighthouse
* PageSpeed Insights
* SEO audit tools
* Security header checkers
* Developer diagnostics

but presented through a significantly cleaner, faster, more visual SaaS experience.

---

# 2. Problem Statement

Website owners and developers often use multiple tools to understand whether a website is healthy.

A typical workflow requires checking:

* Google PageSpeed
* Lighthouse
* SEO analyzers
* Accessibility tools
* Security scanners
* Mobile testing tools
* Manual browser inspection

This creates fragmented information and makes it difficult for non-technical users to understand what actually needs to be fixed.

### Problem

Users need one place where they can:

1. Enter a URL.
2. Run a comprehensive scan.
3. See the overall health of the website.
4. Identify the most important problems.
5. Understand why each problem matters.
6. Get actionable fixes.
7. Compare results over time.

### WebLens Solution

WebLens combines these checks into one unified audit experience.

---

# 3. Target Users

## Primary Users

### Developers

Need fast technical diagnostics while developing or deploying a website.

### Freelancers

Need to audit client websites and produce professional reports.

### Agencies

Need repeatable website audits for multiple clients.

### Students

Need an easy way to understand website quality and performance.

### Startup Founders

Need a quick overview of whether their website is technically healthy.

### Website Owners

Need understandable explanations without requiring deep technical knowledge.

---

# 4. Product Goals

## Primary Goals

### G1 — Fast Website Auditing

A user should be able to go from:

**Homepage → URL → Scan → Results**

with minimal friction.

### G2 — Actionable Results

The system should not simply report errors.

It should explain:

* What is wrong.
* Why it matters.
* How serious it is.
* How to fix it.

### G3 — Unified Dashboard

All major website-quality categories should be visible from one dashboard.

### G4 — Professional Reports

Reports should look professional enough to share with:

* clients
* teammates
* managers
* teachers
* developers

### G5 — Useful Even for Non-Technical Users

Technical terminology should have accessible explanations.

---

# 5. Non-Goals for MVP

The first version should NOT attempt to become a complete enterprise SEO platform.

Avoid building:

* Full keyword research
* Backlink databases
* Competitor monitoring
* Rank tracking
* Full crawler infrastructure
* Continuous 24/7 monitoring
* Website editing
* Hosting
* CDN
* Automatic code deployment
* Full penetration testing
* Malware removal
* Full vulnerability exploitation

These can become future products/features.

---

# 6. Product Positioning

### One-line positioning

> **WebLens is an instant website health scanner for developers, creators, businesses, and agencies.**

### Alternative positioning

> **See what's wrong with your website before your users do.**

### Product personality

WebLens should feel:

* Modern
* Technical
* Fast
* Premium
* Trustworthy
* Minimal
* Developer-friendly

It should NOT feel:

* Corporate
* Cluttered
* Generic AI-generated
* Like an old SEO dashboard

---

# 7. Core User Flow

## Flow A — New Scan

```text
Homepage
   ↓
Enter URL
   ↓
Validate URL
   ↓
Start Scan
   ↓
Scanning UI
   ↓
Analysis
   ↓
Results Dashboard
```

### Example

User enters:

`https://example.com`

WebLens creates a scan.

The application performs:

```text
URL validation
       ↓
Page fetch
       ↓
Performance analysis
       ↓
SEO analysis
       ↓
Accessibility analysis
       ↓
Security checks
       ↓
Mobile checks
       ↓
Best-practice checks
       ↓
Score calculation
       ↓
Report generation
```

---

# 8. Homepage Requirements

The homepage should immediately communicate the product value.

## Hero Section

### Heading

> **Know exactly what's wrong with your website.**

### Supporting text

> Scan any public URL for performance, SEO, accessibility, security, and technical issues in one report.

### Primary Input

Large URL input:

`https://yourwebsite.com`

### Primary CTA

**Analyze Website**

### Secondary CTA

**View Sample Report**

---

# 9. Homepage Sections

## Hero

Contains:

* WebLens logo
* Navigation
* URL input
* Analyze button
* short product explanation

## Trust / capability strip

Display:

```text
Performance
SEO
Accessibility
Security
Mobile
Best Practices
```

## Sample report preview

Show an example score:

```text
92
Website Health
```

with category cards.

## How it works

Three steps:

```text
1. Enter URL
2. WebLens scans
3. Fix what's wrong
```

## Feature section

Explain major audit categories.

## CTA section

Example:

> **See what your website is really like under the hood.**

Button:

**Run Free Audit**

---

# 10. URL Input Requirements

The URL input must:

* Accept URLs with or without protocol.
* Automatically normalize the URL.
* Reject invalid URLs.
* Prevent unsupported protocols.
* Show validation errors.
* Prevent duplicate scan submissions.
* Display loading state after submission.

### Supported

```text
example.com
https://example.com
www.example.com
```

### Unsupported

```text
javascript:
file:
localhost
private IP addresses
unsupported protocols
```

For MVP, the scanner should primarily target **publicly accessible HTTP/HTTPS websites**.

---

# 11. Scan Screen

After clicking Analyze Website, the user should not see a blank loader.

Instead display an active scanning interface.

## Example

```text
Analyzing example.com

✓ Connecting to website
✓ Fetching page
✓ Checking performance
● Checking SEO
○ Checking accessibility
○ Checking security
○ Generating report
```

### Progress

Display:

* Percentage
* Current analysis stage
* Estimated remaining stages
* Animated progress indicator

### Important

Never fake completed checks.

The UI should represent actual backend progress.

---

# 12. Audit Categories

WebLens MVP contains six major categories.

## 12.1 Performance

Analyze:

* Page load performance
* Largest Contentful Paint
* First Contentful Paint
* Cumulative Layout Shift
* Interaction to Next Paint where available
* Total Blocking Time where applicable
* Resource sizes
* Image optimization
* Render-blocking resources
* Compression
* Caching
* JavaScript impact
* CSS impact
* Network requests

### Performance Score

0–100.

Classification:

```text
90–100 = Excellent
75–89 = Good
50–74 = Needs Improvement
0–49 = Poor
```

---

# 13. SEO Audit

Check:

* `<title>`
* Meta description
* Canonical URL
* Robots directives
* Heading structure
* H1 presence
* Heading hierarchy
* Image alt attributes
* Internal links
* Crawlability indicators
* Open Graph metadata
* Twitter/X metadata
* Structured data
* Sitemap presence where detectable
* Robots.txt availability
* Language metadata
* HTTPS

### SEO Score

0–100.

---

# 14. Accessibility Audit

Check common accessibility issues such as:

* Missing image alternative text
* Form labels
* Button naming
* Link naming
* Heading structure
* Color contrast where detectable
* ARIA usage problems
* Keyboard accessibility indicators
* Landmark structure
* Document language
* Duplicate IDs
* Accessible names
* Focus-related issues where detectable

### Accessibility Score

0–100.

---

# 15. Security Audit

This must be positioned as a **security posture check**, not a penetration-testing tool.

Check publicly observable configuration such as:

* HTTPS availability
* TLS usage
* Security headers
* Content-Security-Policy presence
* HSTS
* X-Content-Type-Options
* Referrer-Policy
* Permissions-Policy
* Frame protection
* Mixed-content indicators
* Cookie security attributes where observable
* Unsafe external resource indicators

### Security Score

0–100.

### Important Product Constraint

WebLens must not perform intrusive exploitation against websites.

It should only perform safe, non-destructive checks on publicly accessible content and configuration.

---

# 16. Mobile Audit

Check:

* Viewport configuration
* Responsive metadata
* Mobile layout indicators
* Horizontal overflow indicators where detectable
* Touch target concerns where detectable
* Font-size concerns
* Mobile performance
* Responsive images
* Mobile usability indicators

### Mobile Score

0–100.

---

# 17. Best Practices Audit

Check:

* Deprecated browser practices
* Broken resource references
* Console-related issues where available
* Image format optimization
* Modern HTML usage
* HTTPS consistency
* External dependency concerns
* Document structure
* JavaScript errors where detectable
* Resource loading problems

### Best Practices Score

0–100.

---

# 18. Overall Website Score

WebLens should calculate a single health score.

Example weighting:

```text
Performance       25%
SEO               20%
Accessibility     20%
Security          15%
Mobile            10%
Best Practices    10%
```

### Formula

```text
Overall Score =
Performance × 0.25
+ SEO × 0.20
+ Accessibility × 0.20
+ Security × 0.15
+ Mobile × 0.10
+ Best Practices × 0.10
```

The weighting should remain configurable in the backend.

---

# 19. Severity System

Every issue should have a severity level.

## Critical

Major issue requiring immediate attention.

Example:

```text
Website is not using HTTPS.
```

## High

Significant issue affecting users or search engines.

Example:

```text
No page title detected.
```

## Medium

Important optimization opportunity.

Example:

```text
Multiple images are missing alt text.
```

## Low

Minor issue or enhancement.

Example:

```text
Open Graph image is missing.
```

## Passed

The test successfully meets the requirement.

---

# 20. Results Dashboard

This is the core product screen.

## Header

Display:

* Domain
* URL
* Scan date/time
* Re-scan button
* Share button
* Export button

Example:

```text
example.com
Scanned Aug 16, 2026 at 5:42 PM

[Re-scan] [Share] [Export PDF]
```

---

# 21. Overall Score Card

Large visual score:

```text
92
Excellent

Your website is healthy, but 7 improvements are recommended.
```

Show:

* Overall score
* Status
* Total issues
* Passed checks
* Critical problems

---

# 22. Category Score Cards

Six cards:

```text
Performance       94
SEO               88
Accessibility     96
Security          91
Mobile            90
Best Practices    93
```

Each card should be clickable.

Clicking a category filters the report.

---

# 23. Issue Summary

Display:

```text
Issues Found

2 Critical
3 High
8 Medium
4 Low
```

Include a filter.

Filters:

```text
All
Critical
High
Medium
Low
Passed
```

---

# 24. Issue Card

Each issue must contain:

### Title

Example:

**Missing meta description**

### Severity

`HIGH`

### Explanation

Explain what the issue means.

### Why it matters

Explain impact.

### Recommendation

Explain how to fix it.

### Technical details

Optional technical information.

Example:

```html
<meta name="description" content="...">
```

### Location

Where the problem occurred.

Example:

```text
<head>
```

### Fix status

Optional:

* Not fixed
* Fixed
* Ignored

---

# 25. AI Explanation Layer

WebLens can optionally use AI to turn technical findings into understandable recommendations.

### Input

Structured scanner findings.

### AI output

For each issue:

```text
What happened

Why it matters

How to fix it

Priority
```

### Example

Raw result:

```text
LCP = 4.7s
```

AI explanation:

> Your main content takes too long to become visible. Large images and render-blocking resources may be delaying the page. Compress the hero image and reduce blocking JavaScript first.

### Important Architecture Rule

AI should **explain scanner findings**, not invent scanner results.

The scanner remains the source of truth.

---

# 26. Report Tabs

Recommended tabs:

```text
Overview
Issues
Performance
SEO
Accessibility
Security
Mobile
Best Practices
Resources
```

---

# 27. Resource Analysis

Show major resource information.

Columns:

```text
Resource
Type
Size
Load Time
Status
```

Examples:

```text
hero.webp
Image
142 KB
418 ms
200

main.js
JavaScript
1.8 MB
1.4 s
200
```

Provide sorting.

---

# 28. Waterfall Visualization

For supported performance analysis, display a simplified waterfall.

Example:

```text
HTML     ███████
CSS         ███
JS              █████████
Image              █████
Font                  ██
```

This gives the dashboard a more developer-oriented feel.

---

# 29. Screenshot

The scan should attempt to capture a screenshot of the audited webpage.

Display:

* Desktop screenshot
* Mobile screenshot where supported

Screenshot section can appear near the top of the report.

---

# 30. Shareable Reports

Every scan should have a shareable public report URL.

Example:

```text
weblens.app/report/8F3K2M
```

Public report should show:

* URL
* Scan date
* Overall score
* Category scores
* Major issues
* Recommendations

Sensitive account information must not appear.

---

# 31. Report Privacy

User must be able to choose:

```text
Public
Private
```

For MVP:

* Reports can be public through an unguessable ID.
* No sensitive credentials should ever be scanned or stored.
* Scan results should not expose secret data from the target website.

---

# 32. Scan History

Authenticated users should have a history page.

Display:

```text
Website
Score
Date
Change
```

Example:

```text
example.com     92     Today       +7
example.com     85     Yesterday   +4
example.com     81     Aug 12      —
```

---

# 33. Historical Comparison

For repeated scans, show score changes.

Example:

```text
Overall
81 → 92   +11

Performance
74 → 94   +20

SEO
84 → 88   +4
```

Use a line chart for score history.

---

# 34. Authentication

Authentication should be optional for the first scan.

### Anonymous users

Can:

* Run a limited number of scans
* View results
* Create temporary share links

### Authenticated users

Can:

* Save scans
* View history
* Compare results
* Manage reports
* Access profile settings

Recommended authentication:

**Supabase Auth** or **Clerk**.

---

# 35. Database Design

Recommended PostgreSQL structure.

## users

```text
id
email
name
avatar_url
created_at
updated_at
```

## scans

```text
id
user_id
url
domain
status
overall_score
started_at
completed_at
created_at
```

Status:

```text
queued
running
completed
failed
```

## category_scores

```text
id
scan_id
category
score
created_at
```

Category:

```text
performance
seo
accessibility
security
mobile
best_practices
```

## audit_results

```text
id
scan_id
category
rule_id
severity
title
description
impact
recommendation
technical_details
status
created_at
```

## resources

```text
id
scan_id
url
resource_type
size_bytes
load_time_ms
status_code
created_at
```

## reports

```text
id
scan_id
share_token
visibility
created_at
expires_at
```

---

# 36. Backend Architecture

Recommended architecture:

```text
React Frontend
       ↓
REST API / API Layer
       ↓
Scan Job Manager
       ↓
Browser Automation
       ↓
Audit Engines
       ↓
Score Engine
       ↓
Database
```

---

# 37. Suggested Technology Stack

## Frontend

* React
* TypeScript
* Tailwind CSS
* Vite
* React Router
* Recharts or another charting library

## Backend

* Node.js
* TypeScript
* Express or Fastify

## Browser Automation

Use a headless browser such as:

* Playwright

## Auditing

Use existing proven auditing engines where appropriate rather than implementing all browser diagnostics from scratch.

Possible foundation:

* Lighthouse
* axe-core
* custom HTTP/security checks
* custom metadata/SEO parser

## Database

* PostgreSQL
* Supabase

## Authentication

* Supabase Auth or Clerk

## Storage

Supabase Storage for:

* screenshots
* generated reports
* temporary scan artifacts

## Deployment

Possible architecture:

```text
Frontend → Vercel
Backend → Railway / Render / VPS
Database → Supabase
```

Long-running browser scans should execute on infrastructure suitable for background jobs rather than relying entirely on serverless request execution.

---

# 38. Scan Engine

The scan engine should use a modular architecture.

```text
Scanner
 ├── PerformanceScanner
 ├── SEOScanner
 ├── AccessibilityScanner
 ├── SecurityScanner
 ├── MobileScanner
 └── BestPracticeScanner
```

Each scanner returns a normalized result.

Example:

```json
{
  "ruleId": "seo.meta-description",
  "category": "seo",
  "severity": "high",
  "scoreImpact": 10,
  "title": "Missing meta description",
  "description": "...",
  "recommendation": "...",
  "passed": false
}
```

This architecture makes it easy to add more rules later.

---

# 39. Rule Engine

Every audit rule should have:

```text
Rule ID
Category
Severity
Title
Description
Detection logic
Recommendation
Scoring impact
```

Example:

```text
Rule ID:
seo.missing-title

Category:
SEO

Severity:
Critical

Detection:
<title> does not exist or is empty

Recommendation:
Add a unique descriptive title to the page.
```

---

# 40. Scoring Engine

Avoid arbitrary scoring wherever possible.

Each category should calculate its score from actual rule results.

Example:

```text
100
 - critical penalties
 - high penalties
 - medium penalties
 - low penalties
= category score
```

A rule system can also use weighted deductions.

Example:

```text
Critical = -20
High = -10
Medium = -5
Low = -2
```

The exact weights should be configurable.

Scores must never go below 0 or above 100.

---

# 41. API Design

## POST /api/scans

Create scan.

Request:

```json
{
  "url": "https://example.com"
}
```

Response:

```json
{
  "scanId": "abc123",
  "status": "queued"
}
```

---

## GET /api/scans/:id

Return scan status/results.

---

## GET /api/scans/:id/results

Return normalized report data.

---

## POST /api/scans/:id/rescan

Start another scan.

---

## POST /api/reports

Generate shareable report.

---

## GET /api/reports/:token

Return public report.

---

# 42. Real-Time Scan Progress

The frontend should receive updates through:

* Server-Sent Events
* WebSockets
* polling as fallback

Example event:

```json
{
  "scanId": "abc123",
  "stage": "seo",
  "progress": 45
}
```

Frontend updates:

```text
45%
Checking SEO...
```

---

# 43. Error Handling

The product must handle:

### Invalid URL

```text
Please enter a valid public URL.
```

### Website unavailable

```text
WebLens couldn't reach this website.
```

### Timeout

```text
The website took too long to respond.
```

### Protected website

```text
This site could not be fully analyzed because access was restricted.
```

### Scanner failure

```text
Some checks could not be completed.
Your available results are still shown below.
```

Never return a completely broken blank page.

---

# 44. Security Requirements

WebLens itself must be heavily protected because it accepts arbitrary URLs.

### SSRF protection

The scanner must prevent access to:

* localhost
* loopback addresses
* private network ranges
* internal services
* cloud metadata endpoints
* restricted internal infrastructure

### URL validation

Normalize and validate URLs before scanning.

### Resource limits

Set:

* Maximum scan duration
* Maximum page size
* Maximum redirects
* Maximum resource count
* Maximum concurrent scans

### Browser isolation

Run headless browser sessions in isolated environments.

### Rate limiting

Limit:

* scans per IP
* scans per account
* concurrent scans

### Data protection

Never store:

* user passwords
* authentication cookies
* private website credentials

---

# 45. Performance Requirements

### Homepage

Target:

```text
Initial load < 2–3 seconds
```

### Scan startup

Target:

```text
Scan begins within a few seconds
```

### Report

Results should progressively appear whenever possible.

### UI

Target:

* Smooth transitions
* Responsive layout
* No major layout shifts
* Loading skeletons

---

# 46. Responsive Design

WebLens should support:

* Desktop
* Laptop
* Tablet
* Mobile

### Mobile Dashboard

On mobile:

```text
Score
↓
Critical Issues
↓
Category Cards
↓
Issues
↓
Recommendations
```

Charts should become horizontally scrollable or vertically stacked.

---

# 47. Visual Design

## Design Direction

Dark-first developer SaaS aesthetic.

Possible theme:

```text
Background:
Near-black / dark navy

Panels:
Dark elevated surfaces

Primary accent:
Electric blue / violet / cyan

Success:
Green

Warning:
Amber

Critical:
Red
```

Do not overuse gradients.

Use gradients mainly for:

* hero visuals
* score visualization
* subtle background glow

---

# 48. Typography

Recommended:

* Inter
* Geist
* Manrope

Use clear hierarchy.

Example:

```text
80–96 px hero heading
32–48 px section heading
20–24 px card heading
14–16 px body
12–13 px metadata
```

---

# 49. Dashboard Layout

Suggested structure:

```text
┌─────────────────────────────────────────────┐
│ WebLens       Search      History   Profile │
├─────────────────────────────────────────────┤
│                                             │
│ example.com                                 │
│ Scanned 2 min ago                           │
│                                             │
│       ┌────────────┐                        │
│       │     92     │                        │
│       │ Excellent  │                        │
│       └────────────┘                        │
│                                             │
│ Performance  SEO  A11y  Security  Mobile   │
│     94       88    96      91       90      │
│                                             │
├─────────────────────────────────────────────┤
│ Critical Issues                             │
│                                             │
│ ⚠ Missing meta description                  │
│ ⚠ Large render-blocking JS                 │
│                                             │
├─────────────────────────────────────────────┤
│ Performance                                 │
│                                             │
│ LCP     CLS     FCP     INP                  │
│ 2.1s    0.04    1.2s    120ms               │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 50. Dashboard Interactions

Users should be able to:

* Expand issues
* Collapse sections
* Filter by category
* Filter by severity
* Sort findings
* Search findings
* Copy technical recommendations
* Run another scan
* Share report
* Export report

---

# 51. Search / Scan History

History search should support:

```text
example.com
myportfolio.dev
clientsite.com
```

Filters:

* Date
* Score
* Domain
* Status

---

# 52. Export

MVP should support:

### PDF

Include:

* Website
* Overall score
* Category scores
* Major findings
* Recommendations
* Scan date

### Future

* CSV export
* JSON export
* Branded agency reports

---

# 53. Free Tier

For an MVP, use:

```text
3–5 scans per day
```

Anonymous users can receive limited scans.

Authenticated users receive more.

This protects backend infrastructure.

---

# 54. Future Monetization

Possible plans:

## Free

* Limited scans
* Basic reports
* Public reports

## Pro

* More scans
* Historical tracking
* PDF exports
* AI recommendations
* Scheduled monitoring

## Agency

* Multiple projects
* Client workspaces
* White-label reports
* Branded PDFs
* Team members
* API access

---

# 55. Future Features

After MVP:

### Continuous Monitoring

```text
Scan every day
↓
Detect changes
↓
Notify user
```

### Alerts

* Score dropped
* SEO issue introduced
* Security header removed
* Performance degraded

### Projects

Users can organize:

```text
My Portfolio
Client A
Startup Website
College Project
```

### Competitor Comparison

```text
Your Website        92
Competitor A        89
Competitor B        84
```

### Team Collaboration

* Comments
* Assign issues
* Status tracking
* Team members

### AI Fix Generation

Generate:

```text
HTML fix
CSS fix
React fix
Next.js fix
```

### Browser Extension

Analyze the currently open webpage.

---

# 56. Notifications

Future support:

* Email
* Discord
* Slack
* Telegram
* Web push

Example:

> WebLens detected a 14-point performance drop on example.com.

---

# 57. Analytics

Track product metrics.

### Product metrics

* Number of scans
* Successful scans
* Failed scans
* Average scan duration
* Average score
* Most common issues
* Most scanned domains

### User metrics

* First scan
* Repeat scan
* Saved scan
* Shared report
* Exported report

---

# 58. Admin Dashboard

Future admin dashboard:

```text
Total Users
Total Scans
Scans Today
Failure Rate
Average Scan Time
Active Jobs
```

Ability to:

* Inspect scan failures
* View queue
* Manage limits
* Disable abusive accounts
* Monitor infrastructure

---

# 59. Accessibility Requirements for WebLens

The WebLens application itself should meet strong accessibility standards.

Requirements:

* Keyboard navigation
* Visible focus states
* Semantic HTML
* Accessible forms
* Accessible color contrast
* Screen-reader-friendly labels
* Reduced-motion support
* No color-only meaning

---

# 60. SEO Requirements for WebLens

The WebLens website should itself be SEO-friendly.

Homepage should include:

* Proper title
* Meta description
* Canonical
* Open Graph tags
* Structured data
* Sitemap
* robots.txt

---

# 61. Onboarding

No forced account creation before first scan.

### First-time user

```text
Open WebLens
↓
Enter URL
↓
Analyze
↓
View results
↓
Optional:
Create account to save report
```

This reduces friction.

---

# 62. Empty States

Example:

### No scans

> No scans yet. Analyze your first website to get started.

CTA:

**Analyze a Website**

### No issues

> Excellent! We couldn't find any major problems in this category.

---

# 63. Loading States

Do not use generic spinning loaders everywhere.

Use meaningful skeletons.

Example:

```text
Analyzing Performance...
██████████░░░░ 72%

Running SEO checks...
██████░░░░░░░░ 43%
```

---

# 64. Demo Mode

The application should include a sample report.

Example domain:

```text
demo.weblens.app
```

This lets users explore the interface without starting a scan.

Homepage CTA:

**Explore Demo Report**

---

# 65. MVP Definition

The weekend MVP is considered complete when a user can:

1. Open WebLens.
2. Enter a public URL.
3. Start a scan.
4. See real scan progress.
5. Receive real audit results.
6. View an overall score.
7. View category scores.
8. View individual issues.
9. Understand issue severity.
10. See recommendations.
11. View a website screenshot.
12. Share a report.
13. Run another scan.

---

# 66. Weekend Build Scope

## Phase 1 — Foundation

* Create project
* Set up frontend
* Set up backend
* Configure database
* Create basic routing
* Build design system

## Phase 2 — Scanner

Implement:

* URL validation
* Page fetch
* Browser launch
* Lighthouse integration
* SEO parser
* axe-core accessibility scan
* security-header checks
* mobile checks

## Phase 3 — Results

Build:

* Overall score
* Category cards
* Issue cards
* Filters
* Technical details
* Recommendations

## Phase 4 — Product Polish

Add:

* Scan progress
* Animations
* Responsive UI
* Screenshots
* Share links
* Demo report
* Error states

---

# 67. Suggested File Structure

```text
weblens/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │
│   └── scanner/
│       ├── src/
│       │   ├── scanners/
│       │   │   ├── performance/
│       │   │   ├── seo/
│       │   │   ├── accessibility/
│       │   │   ├── security/
│       │   │   ├── mobile/
│       │   │   └── best-practices/
│       │   ├── scoring/
│       │   ├── rules/
│       │   └── workers/
│
├── packages/
│   ├── types/
│   ├── ui/
│   └── config/
│
├── database/
│   ├── migrations/
│   └── seed/
│
└── README.md
```

---

# 68. Development Priorities

Priority order:

### P0 — Required

* URL scanning
* Real scanner
* Results
* Score
* Issues
* Recommendations
* Progress
* Responsive UI

### P1 — Important

* Screenshot
* Shareable reports
* History
* PDF
* AI explanations

### P2 — Later

* Accounts
* Monitoring
* Competitor comparison
* Teams
* White-label
* Billing

---

# 69. Success Criteria

WebLens succeeds as an MVP if:

### Technical

* A valid public website can be scanned successfully.
* Results are based on real measurements.
* Scanner handles failures gracefully.
* SSRF protections prevent internal network access.
* Scan jobs do not crash the server.

### UX

* First-time users understand what to do immediately.
* Scan progress is understandable.
* Results are easy to interpret.
* Critical issues are obvious.
* Report is shareable.

### Product

* A user can understand website health within minutes.
* The report provides actionable next steps.
* The experience feels significantly better than raw developer tooling.

---

# 70. Example Report

For a hypothetical website:

```text
WEBLENS AUDIT
example.com

OVERALL
92 / 100
EXCELLENT

Performance       94
SEO               88
Accessibility     96
Security          91
Mobile            90
Best Practices    93

ISSUES

HIGH
Missing meta description
SEO score impact: -8

MEDIUM
3 images missing alt text
Accessibility impact: -4

MEDIUM
Large JavaScript bundle
Performance impact: -3

LOW
Missing Open Graph image
SEO impact: -2
```

Then:

```text
RECOMMENDED NEXT STEPS

1. Add a unique meta description.
2. Add descriptive alt text to images.
3. Reduce JavaScript bundle size.
4. Add an Open Graph preview image.
```

---

# 71. Brand / UI Direction

### Logo concept

A lens or scanner-inspired icon.

Possible mark:

```text
◉
```

or a stylized:

```text
W + lens
```

### Brand idea

WebLens represents:

> **Looking beneath the surface of the web.**

### Visual language

Use:

* Thin borders
* Soft glow
* Glass-like panels sparingly
* Fine grid backgrounds
* Subtle noise
* Large typography
* High-quality charts
* Smooth micro-interactions

Avoid excessive:

* Glassmorphism
* Neon
* Gradients
* Floating cards everywhere
* Huge animations

---

# 72. MVP Home Page Copy

### Hero

**See what’s wrong with your website.**

Enter a URL and get a complete website health report covering performance, SEO, accessibility, security, and more.

CTA:

**Analyze Website**

Secondary:

**View Demo**

### Supporting statement

> One URL. One report. Every important issue.

---

# 73. Key Differentiator

WebLens should not compete only by having more checks.

Its differentiation should be:

### **Clarity**

Other tools often give developers raw metrics.

WebLens should answer:

> **“Okay, what should I fix first?”**

Every result should therefore include:

```text
Problem
↓
Impact
↓
Priority
↓
Fix
```

---

# 74. Final Product Vision

The long-term vision is:

> **WebLens becomes the operating system for website quality.**

A user eventually opens one dashboard to:

```text
Audit
↓
Monitor
↓
Compare
↓
Diagnose
↓
Understand
↓
Fix
↓
Verify
```

The ultimate product loop becomes:

```text
Scan
  ↓
Find issue
  ↓
Get explanation
  ↓
Apply fix
  ↓
Scan again
  ↓
Measure improvement
```

That closed loop is the core opportunity behind WebLens.
