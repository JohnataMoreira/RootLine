# ROOTLINE
## Product Requirements Document

**Version:** 1.0  
**Date:** February 2026  
**Status:** Pre-Development  
**Owner:** Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision](#3-product-vision)
4. [Target Users](#4-target-users)
5. [Core Features & Requirements](#5-core-features--requirements)
6. [Technical Architecture](#6-technical-architecture)
7. [User Experience & Flows](#7-user-experience--flows)
8. [Success Metrics](#8-success-metrics)
9. [Go-to-Market Strategy](#9-go-to-market-strategy)
10. [Roadmap & Milestones](#10-roadmap--milestones)
11. [Risk Analysis](#11-risk-analysis)
12. [Appendices](#12-appendices)

---

## 1. Executive Summary

### 1.1 Product Overview

Rootline is a **living family archive platform** that automatically preserves, organizes, and shares multi-generational family memories through AI-powered photo curation and intelligent timeline generation. Unlike traditional photo storage or genealogy services, Rootline creates a dynamic, collaborative space where families document their present while building a legacy for future generations.

### 1.2 Market Opportunity

The intersection of photo storage ($14B global market), genealogy services ($3B+ market), and family collaboration tools represents a significant untapped opportunity. Current solutions address only fragments of the problem:

- **Google Photos and iCloud** provide storage but no family context or legacy preservation
- **Ancestry.com** focuses on historical genealogy, not living memories
- **FamilyAlbum** requires manual uploads and offers no AI curation
- **Chatbooks** creates physical albums but lacks digital collaboration

Rootline fills this gap by creating a new category: **Living Family Archives**.

### 1.3 Key Differentiators

- **Network Effects:** Family-based accounts create viral loops and high retention
- **AI Curation:** Automated selection of meaningful moments across multiple family members
- **Cross-Generational:** Designed for grandparents, parents, and children in one ecosystem
- **Timeline Intelligence:** Contextual filtering by people, places, events, and relationships
- **Legacy Focus:** Memorial features and digital inheritance planning built-in

### 1.4 Business Model

Subscription-based SaaS with family-sized plans encouraging group adoption:

| Plan | Price | Members | Target |
|------|-------|---------|--------|
| **Solo** | $9/month | 1 | Trial users |
| **Family Base** | **$25/month** | Up to 6 | **Primary segment** |
| **Family Plus** | $39/month | Up to 15 | Extended families |
| **Legacy Annual** | $399/year | Up to 25 | Early adopters (15% discount) |

**Target Year 1 Metrics:** 200 active families • $6k MRR • 1,600 total users • 9:1 LTV:CAC ratio

---

## 2. Problem Statement

### 2.1 The Core Problem

Families take thousands of photos annually but fail to preserve them meaningfully for future generations. This creates three critical gaps:

#### Gap 1: Storage ≠ Preservation

Photos exist in isolated clouds (Google Photos, iCloud, Facebook) without family context. When grandparents pass away, their entire digital archive is often lost because credentials aren't shared and accounts get deleted.

**Pain Level:** 7/10 — Felt most acutely after family member deaths or device failures

#### Gap 2: Curation Burden

Creating meaningful photo collections (albums, yearbooks, slideshows) requires hours of manual work. Most families attempt this annually for major events but abandon it within 2-3 years due to time constraints.

**Current Solutions:** Chatbooks ($8-15/month), Mixtiles, Shutterfly — all require manual photo selection

**Pain Level:** 6/10 — Constant guilt but not urgent enough to act

#### Gap 3: Family Disconnection

Geographically dispersed families (60% of US families have relatives in multiple states) struggle to share memories consistently. WhatsApp groups become cluttered; shared albums require manual invites; and elderly relatives often can't participate due to tech barriers.

**Pain Level:** 8/10 — Highest for immigrant families and families with elderly members

### 2.2 Quantifying the Problem

| Metric | Data Point |
|--------|-----------|
| Photos taken per family/year | 3,000-10,000 (families with children) |
| % organized into albums | <5% (Google Photos data) |
| Families losing digital archives | 68% report losing photos/videos |
| Time spent organizing/year | 3-8 hours (intention) vs. 0 (reality) |
| Current spend on solutions | $100-300/year (photo books, prints) |

### 2.3 Why Now?

- **AI Maturity:** GPT-4V and similar models enable accurate face detection, scene understanding, and quality assessment at scale
- **Millennial Parents:** Digital natives now caring for elderly parents and young children simultaneously
- **Remote Families:** COVID normalized digital-first family connections
- **Storage Saturation:** People hitting iCloud/Google Photos limits, seeking alternatives
- **Nostalgia Economy:** Proven demand in retro tech, scrapbooking, and genealogy services

---

## 3. Product Vision

### 3.1 Vision Statement

> **"Rootline preserves the story of every family across generations, making legacy creation effortless and ensuring no memory is ever lost."**

### 3.2 Product Positioning

**Tagline:** "Connecting roots across generations"

**Category:** Living Family Archive (new category)

**Positioning Statement:**  
For families who want to preserve their legacy across generations, Rootline is the only platform that automatically organizes multi-generational memories and makes them accessible forever. Unlike photo storage apps or genealogy sites, Rootline combines AI curation with family collaboration to create living archives that grow with your family.

### 3.3 North Star Metric

**Active Families with 5+ Engaged Members**

This metric captures both product-market fit (families adopt) and network effects (multiple members engage). Engaged = contributed or viewed content in last 30 days.

### 3.4 Product Principles

1. **Zero-Effort Default:** Memories should preserve themselves; user action is for customization, not requirement
2. **Family-First Privacy:** Granular controls for what each member sees, with default-safe settings
3. **Cross-Generational Accessibility:** Grandparents and grandchildren both find it intuitive
4. **Emotion Over Features:** Every feature should evoke connection, nostalgia, or joy
5. **Forever Architecture:** Design for data outliving the company (export-first mentality)

---

## 4. Target Users

### 4.1 Primary Persona: The Family Coordinator

| Attribute | Description |
|-----------|-------------|
| **Name** | Maria (35-45 years old) |
| **Demographics** | Mother of 2-3 children (ages 0-12), married, household income $80k-150k, college-educated, suburban/urban |
| **Tech Profile** | Comfortable with apps, uses Google Photos/iCloud, active on Instagram/Facebook, manages family calendar |
| **Primary Goals** | • Preserve children's childhood for them to have later<br>• Share milestones with grandparents easily<br>• Reduce guilt of not organizing photos<br>• Create family connection despite distance |
| **Pain Points** | • No time to manually organize thousands of photos<br>• Elderly parents struggle with tech (can't see grandkids' photos)<br>• Worried about losing digital memories if device fails<br>• Managing multiple platforms (iCloud, Google, Facebook) is exhausting |
| **Buying Triggers** | • Child's birthday/milestone approaching<br>• Grandparent health scare<br>• Phone storage full<br>• New Year's resolution to 'get organized' |

### 4.2 Secondary Persona: The Grandparent

| Attribute | Description |
|-----------|-------------|
| **Name** | Robert & Linda (60-75 years old) |
| **Tech Profile** | Basic smartphone use, receive photos via text/email, may have Facebook, intimidated by new apps |
| **Primary Goals** | • See grandchildren grow up despite distance<br>• Share their own lifetime of photos with family<br>• Leave organized memories for after they pass |
| **Key Requirements** | • Extremely simple interface (large text/buttons)<br>• No setup burden (invited by children)<br>• Email notifications (not just in-app)<br>• Ability to upload scanned physical photos |

### 4.3 Tertiary Persona: The Adult Child

Ages 18-30, tech-native, lives away from family. Primary use case: staying connected to family memories without active effort. Will engage sporadically but values passive updates (email summaries, notifications of family milestones).

### 4.4 User Segmentation by Role

| Role | % of Family | Engagement | Key Behavior |
|------|-------------|------------|--------------|
| **Coordinator** | 10-15% | Daily | Invites, curates, manages settings |
| **Contributor** | 30-40% | Weekly | Uploads photos, comments, reacts |
| **Viewer** | 50-60% | Monthly | Views memories, opens emails |

---

## 5. Core Features & Requirements

This section details the MVP feature set required for launch, organized by priority tier. All features must support cross-platform access (web, iOS, Android).

### 5.1 P0 Features (Launch Blockers)

#### 5.1.1 Family Tree & Member Management

**Overview:** Core data structure enabling all family-based features

**User Story:** As a Family Coordinator, I want to create my family tree and invite members so that we can all contribute to our shared archive

**Requirements:**
- Visual tree builder with drag-and-drop interface
- Support for: parents, children, grandparents, grandchildren, siblings, cousins, spouses/partners
- Invite members via email/SMS with personalized message
- Member profiles: name, photo, birth date, relationship tags
- Role-based permissions: Admin (Coordinator), Contributor, Viewer
- Memorial designation for deceased members (preserves photos, marks as 'Remembering')

**Acceptance Criteria:**
- Tree supports up to 25 members without performance degradation
- Invitations have 90% delivery rate (email + SMS fallback)
- First-time user can build tree and invite 5 members in <10 minutes

---

#### 5.1.2 Photo Source Integration

**Overview:** Automated photo ingestion from user's existing libraries

**User Story:** As a user, I want to connect my Google Photos/iCloud so that my photos automatically sync without manual uploads

**Requirements:**
- OAuth integration with Google Photos API
- OAuth integration with iCloud Photos (future: Instagram, Facebook)
- Read-only access (never modify user's original library)
- Initial sync: full library scan (10k+ photos)
- Ongoing sync: incremental daily updates
- Sync status UI: 'X of Y photos processed' with progress bar
- Manual upload option for users without Google/iCloud (drag-and-drop, mobile camera roll)
- Support for photos + videos (MP4, MOV, HEIC, JPG, PNG)

**Technical Constraints:**
- Store metadata + thumbnails only (not full-res copies) to minimize storage costs
- Fetch full-res on-demand when user views photo
- Rate limit: 1000 photos/hour per user to avoid API throttling

**Acceptance Criteria:**
- 90% of users successfully connect at least one photo source
- Initial sync completes within 24 hours for 10k photo library
- Zero data loss (all photos in source appear in Rootline)

---

#### 5.1.3 AI-Powered Photo Curation

**Overview:** Intelligent selection of meaningful photos from thousands

**User Story:** As a user, I want the system to automatically identify my family's best photos so I don't have to manually sift through duplicates and blurry shots

**AI Processing Pipeline:**

**1. Face Detection & Recognition** — Identify family members in photos
- Use GPT-4V or similar for face detection
- Cluster similar faces, ask user to label ('Is this Grandma Linda?')
- Tag photos with detected members

**2. Quality Assessment** — Filter out poor photos
- Blur detection, exposure check, composition analysis
- Remove duplicates (near-identical shots)
- Score each photo 0-100 for 'keep-worthiness'

**3. Moment Detection** — Identify special events
- Birthday (detect cakes, candles, party hats)
- Holiday (Christmas trees, Thanksgiving table, Halloween costumes)
- Vacation (beaches, landmarks, travel gear)
- Milestones (graduation caps, wedding attire, baby bumps)

**4. Curation Algorithm** — Select top photos
- Prioritize: high quality + family members present + special moments
- Ensure diversity: don't pick 50 photos from one day, spread across time
- Target: top 5-10% of total library

**Acceptance Criteria:**
- Face recognition accuracy >85% (user validation survey)
- Curated set feels 'right' to 75% of users (qualitative feedback)
- Processing time: <5 minutes for 1000 photos

---

#### 5.1.4 Timeline & Filtering

**Overview:** Interactive chronological view with rich filtering

**User Story:** As a user, I want to view family memories chronologically and filter by person, place, or event so I can find specific moments easily

**Requirements:**

**Timeline View:**
- Reverse chronological (newest first) or chronological (oldest first) toggle
- Grouped by month/year with header dividers
- Infinite scroll with lazy loading
- Grid layout (3 columns mobile, 5 columns desktop)

**Filter Options:**
- By family member: multi-select (e.g., 'Show photos with Grandma AND grandson')
- By date range: calendar picker
- By location: map-based or text search (e.g., 'Disneyland', 'Grandma's house')
- By event type: birthdays, holidays, vacations, milestones
- Saved filters: 'All photos with kids', 'Summer vacations', etc.

**Photo Detail View:**
- Full-screen lightbox with swipe navigation
- Metadata overlay: date, location, people tagged
- Actions: favorite, comment, share, download

**Acceptance Criteria:**
- Timeline loads first 50 photos in <2 seconds
- Filters apply in <1 second
- 80% of users successfully use filters in first session (analytics)

---

#### 5.1.5 Monthly Memory Emails

**Overview:** Automated email summaries of family memories

**User Story:** As a family member, I want to receive a beautiful monthly email of our best moments so I can stay connected without opening the app daily

**Requirements:**
- Email sent 1st of each month with previous month's highlights
- Personalized per family member (shows photos they're in or care about)
- Contains: 10-15 curated photos, captions, link to full timeline
- Responsive HTML design (mobile-optimized)
- Unsubscribe option + frequency settings (weekly/monthly)
- Track opens, clicks (analytics for engagement)

**Email Template Structure:**
- Header: 'Your [Family Name] Moments — January 2026'
- Intro: AI-generated summary ('This month, the family celebrated Sara's birthday and took a trip to the mountains')
- Photo grid: 3 columns, high-quality thumbnails
- CTA: 'View Full Timeline' button
- Footer: Manage settings, unsubscribe

**Acceptance Criteria:**
- 95% email delivery rate
- 40%+ open rate (benchmark: consumer email avg is 20-25%)
- <5% unsubscribe rate

---

### 5.2 P1 Features (Post-MVP, Within 6 Months)

- **Collaborative Albums:** Allow families to co-create albums for specific events (e.g., 'Summer Vacation 2026')
- **Comments & Reactions:** Add social features (emoji reactions, text comments on photos)
- **Video Support:** Full video playback, trimming, auto-generated highlight reels
- **Mobile Apps:** Native iOS and Android apps (currently web-only)
- **Physical Prints:** Order photo books, prints, or canvases directly from the app
- **Advanced Search:** Natural language search ('Photos of Mom at the beach')

### 5.3 P2 Features (12+ Months, Strategic)

- **Voice Narration:** Record audio stories to accompany photos (oral history preservation)
- **Historical Document Scanning:** AI-powered restoration and organization of scanned photos, letters, documents
- **Living Obituaries:** Dedicated memorial pages for deceased family members with tribute features
- **Multi-Language Support:** Localization for Spanish, Portuguese, Chinese markets
- **Partnership with Ancestry.com:** Import genealogical trees, connect historical records to modern photos

---

## 6. Technical Architecture

### 6.1 System Overview

Rootline is built as a modern serverless web application with the following key components:

- **Frontend:** Next.js 14 (React 18), TypeScript, Tailwind CSS
- **Backend:** Node.js serverless functions (Vercel Edge Functions)
- **Database:** PostgreSQL (Supabase) for relational data, S3-compatible storage for media
- **AI/ML:** OpenAI GPT-4V API for image analysis, Anthropic Claude for text generation
- **Infrastructure:** Vercel (hosting), AWS S3 (storage), Cloudflare CDN
- **Email:** Resend API
- **Authentication:** Clerk or Supabase Auth

### 6.2 Data Model

#### Core Entities

| Entity | Key Fields |
|--------|-----------|
| **Family** | id, name, created_by, subscription_plan, billing_status |
| **Member** | id, family_id, user_id, name, birth_date, profile_photo, role (admin/contributor/viewer), is_memorial |
| **Relationship** | id, member_a_id, member_b_id, relationship_type (parent/child/sibling/spouse) |
| **Photo** | id, family_id, uploaded_by, source (google_photos/icloud/manual), source_id, captured_at, location_lat, location_lng, location_name, ai_quality_score, thumbnail_url, full_res_url |
| **PhotoMember** | id, photo_id, member_id (many-to-many: tracks who is in each photo) |
| **PhotoTag** | id, photo_id, tag_type (birthday/holiday/vacation/milestone), tag_value |
| **SyncJob** | id, user_id, source, status (pending/running/completed/failed), photos_processed, started_at, completed_at |

### 6.3 Security & Privacy

- **Encryption:** All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- **Access Control:** Row-level security in PostgreSQL; users only access their family's data
- **OAuth Scopes:** Google Photos/iCloud integration uses read-only scopes, no write access
- **GDPR/CCPA Compliance:** Data export, deletion, and portability features built-in
- **Child Safety (COPPA):** Parental consent required for members under 13; no direct communication features for minors
- **Audit Logs:** Track all sensitive actions (photo access, member invites, permission changes)

---

## 7. User Experience & Flows

### 7.1 Onboarding Flow (First-Time User)

**Goal:** Get user to value (first memory visible) in <10 minutes

**Steps:**

1. **Sign Up**
   - Email + password or Google/Apple SSO
   - Verify email (OTP code)

2. **Create Family**
   - Enter family name (e.g., 'The Silva Family')
   - Quick tutorial overlay: 'Build your family tree next'

3. **Build Family Tree**
   - Visual tree builder: add yourself first (auto-populated from profile)
   - Add immediate family: spouse, children, parents
   - For each member: name, birth date (optional), upload photo (optional)
   - Option to 'Skip for now' if user wants to explore first

4. **Connect Photo Source**
   - Choose: Google Photos, iCloud, or Manual Upload
   - OAuth flow (opens in popup/redirect)
   - Show progress: 'Syncing your photos... X of Y processed'
   - Allow user to continue while sync runs in background

5. **Face Labeling**
   - AI shows clustered faces: 'Is this [Family Member Name]?'
   - User confirms or corrects (swipe UI)
   - Label 10-20 faces to train model, then 'Done'

6. **First Timeline View**
   - Show curated timeline with first batch of photos
   - Tooltip: 'Invite family members to add their photos too!'
   - CTA: 'Invite Family' button (prominent)

7. **Invite Family Members**
   - Modal: Enter emails/phone numbers for family members
   - Personalized invite message (editable template)
   - Send invites → confirmation screen

**Success Metrics:** 70% of users complete onboarding; 50% invite at least 1 family member in first session

### 7.2 Invited Member Flow

1. Receive invite email/SMS with personalized message from family member
2. Click 'Join Family' button → lands on signup page (pre-filled family context)
3. Sign up (or sign in if existing user)
4. Auto-added to family tree in pending state
5. Prompted to: (a) Connect their photo source, (b) Confirm their profile info
6. Immediately see family timeline with existing photos

### 7.3 Grandparent-Specific UX Considerations

- **Large Text Mode:** Accessibility setting for 20% larger fonts
- **Simplified Navigation:** Hide advanced filters by default, show only 'View Timeline' and 'My Family'
- **Email-First Notifications:** Send email for every new photo/update (not just monthly summary)
- **Phone Support:** Offer dedicated phone line for setup assistance (during beta)
- **No Required Tech Setup:** If grandparent doesn't have Google Photos, allow manual email uploads ('Email your photos to family@rootline.app')

---

## 8. Success Metrics

### 8.1 North Star Metric

**Active Families with 5+ Engaged Members**

**Definition:** A family is considered 'active' if at least 5 members have contributed (uploaded photos or connected a source) OR viewed content in the last 30 days.

**Target:** 50 active families by Month 6, 200 by Month 12

### 8.2 Acquisition Metrics

| Metric | Month 3 | Month 12 |
|--------|---------|----------|
| New family signups | 50 | 200 |
| CAC (Cost per family acquired) | $80 | $60 |
| Organic vs. paid split | 20% / 80% | 40% / 60% |

### 8.3 Activation Metrics

| Metric | Target | Benchmark |
|--------|--------|-----------|
| % who complete onboarding | 70% | 50-60% (SaaS avg) |
| % who connect photo source | 85% | N/A |
| % who invite ≥1 member | 50% | 30-40% (referral avg) |
| Time to first value (see curated timeline) | <10 min | N/A |

### 8.4 Engagement Metrics

| Metric | Target | Benchmark |
|--------|--------|-----------|
| WAU (Weekly Active Users) | 40% | 20-30% (social avg) |
| Avg family size (members) | 8 | N/A |
| % of members who contribute monthly | 30% | N/A |
| Email open rate (monthly summary) | 40% | 20-25% (consumer avg) |

### 8.5 Retention & Monetization

| Metric | Target | Benchmark |
|--------|--------|-----------|
| Monthly churn rate | 3% | 5-10% (B2C avg) |
| LTV (Lifetime Value per family) | $720 | N/A |
| LTV:CAC ratio | 9:1 | 3:1 minimum |
| ARPU (Avg Revenue Per User) | $30/month | N/A |
| Conversion trial→paid | 30% | 15-30% (SaaS B2C) |

---

## 9. Go-to-Market Strategy

### 9.1 Target Market

**Primary:** US families with children ages 0-12, household income $80k+, at least one grandparent living

**Secondary:** Immigrant families, multi-generational households, families with members in different states/countries

**TAM/SAM/SOM:**
- **TAM:** $288M/year (Brazil market alone: 2.4M families × $10/month)
- **SAM:** $150M/year (addressable with current features)
- **SOM (Year 3):** $1.5M ARR (1% of SAM)

### 9.2 Launch Strategy

#### Phase 1: Private Beta (Months 1-3)
- **Goal:** Validate product-market fit, gather feedback
- **Target:** 50 families (400-500 users)
- **Acquisition:**
  - Personal network outreach
  - Product Hunt "Coming Soon" page
  - Targeted Facebook/Instagram ads to parenting groups
- **Pricing:** Free during beta (convert to paid at launch)
- **Success Criteria:** 70% retention after 90 days, NPS >40

#### Phase 2: Public Launch (Month 4)
- **Channels:**
  - Product Hunt launch (aim for #1-3 product of the day)
  - Press outreach (TechCrunch, The Verge, parenting blogs)
  - Influencer partnerships (5-10 parenting micro-influencers)
  - Content marketing (SEO blog, "How to preserve family memories")
- **Paid Ads:** $3k/month budget
  - Facebook/Instagram: targeting parents 30-50
  - Google Ads: "family photo organizer", "preserve memories"
- **Pricing:** Launch pricing ($25/month Family Base)

#### Phase 3: Growth (Months 5-12)
- **Channels:**
  - Referral program (give 1 month free, get 1 month free)
  - Partnerships with genealogy influencers, funeral homes, estate planners
  - Community building (Facebook group, subreddit)
- **Budget:** Scale to $5k/month ads by month 12
- **Target:** 200 active families by month 12

### 9.3 Messaging & Positioning

**Primary Message:**  
"Your family's memories deserve more than a forgotten hard drive. Rootline automatically preserves and organizes your photos so future generations can treasure them forever."

**Supporting Messages:**
- For Parents: "Give your children the gift of their childhood — organized and preserved"
- For Grandparents: "Stay connected to grandkids, no matter the distance"
- For Adult Children: "Honor your family's legacy while there's still time"

**Emotional Triggers:**
- FOMO: "Don't let another year pass without organizing your family's story"
- Urgency: "Your parents' photos won't preserve themselves"
- Aspiration: "Be the hero who saves your family's memories"

---

## 10. Roadmap & Milestones

### Q1 2026 (Months 1-3): MVP Development & Beta

**Development:**
- Week 1-4: Setup (infrastructure, design system, auth)
- Week 5-8: Family tree & member management
- Week 9-12: Photo source integration (Google Photos)
- Week 13-16: AI curation & timeline
- Week 17-20: Email system & polish

**Beta Launch:**
- Recruit 50 beta families
- Weekly feedback sessions
- Iterate based on usage data

**Milestone:** 50 beta families onboarded, 70% retention

---

### Q2 2026 (Months 4-6): Public Launch & Iteration

**Features:**
- iCloud integration
- Mobile-responsive web app
- Comments & reactions (P1 feature pulled forward)
- Advanced filtering

**Growth:**
- Product Hunt launch
- Influencer partnerships
- Paid ads ($3k/month)

**Milestone:** 100 active families, $3k MRR, 75% beta→paid conversion

---

### Q3 2026 (Months 7-9): Scale & Mobile Apps

**Features:**
- Native iOS app (TestFlight)
- Native Android app (beta)
- Video support
- Collaborative albums

**Growth:**
- Referral program launch
- Scale ads to $5k/month
- Partnership with genealogy services

**Milestone:** 150 active families, $5k MRR

---

### Q4 2026 (Months 10-12): Optimize & Expand

**Features:**
- Physical prints integration
- Voice narration (P2 feature)
- Advanced search (AI-powered)

**Growth:**
- Community building (Facebook group)
- Content marketing push
- International expansion (Spanish version)

**Milestone:** 200 active families, $6k MRR, break-even

---

## 11. Risk Analysis

### 11.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Google Photos API changes/deprecation** | Medium | Critical | Diversify to iCloud, Instagram; build fallback manual upload |
| **AI curation accuracy below expectations** | Medium | High | Human-in-the-loop labeling; continuous model training |
| **Scalability issues with photo processing** | Low | High | Use queue system (BullMQ), optimize image processing pipeline |
| **Data breach / security incident** | Low | Critical | SOC 2 compliance, penetration testing, insurance |

### 11.2 Market Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Google/Apple launches similar feature** | Medium-High | Critical | Execute fast (18-month window), build brand moat, focus on family collaboration (not just individual) |
| **Low willingness to pay** | Medium | Critical | **Validate with concierge MVP before building** (see pre-launch experiment) |
| **Competitor copies product** | High | Medium | Network effects are hard to copy; focus on brand, community, quality |
| **Market too niche** | Low | High | Expand TAM to adjacent markets (professional photographers, schools) |

### 11.3 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **High churn after initial excitement** | Medium-High | Critical | Deep engagement features (comments, albums); email re-engagement; family events triggers |
| **CAC exceeds LTV** | Medium | Critical | Focus on organic/referral growth; optimize conversion funnel |
| **Coordinator burnout (1 person does all work)** | High | High | Gamification, nudges to distribute effort, auto-curation reduces manual work |
| **Slow family adoption (hard to get 5+ members)** | Medium | High | Make product valuable for solo users; gradual invite features |

### 11.4 Regulatory Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **GDPR/CCPA compliance violations** | Low | High | Legal review, data export/deletion features built-in |
| **COPPA violations (children under 13)** | Low | Critical | Parental consent flows, no direct messaging for minors |
| **Copyright issues with photos** | Low | Medium | Terms of service clarify users retain ownership; DMCA process |

---

## 12. Appendices

### Appendix A: Competitive Analysis

| Competitor | Strengths | Weaknesses | Pricing |
|------------|-----------|------------|---------|
| **Google Photos** | Free, unlimited (compressed), excellent AI | No family context, ephemeral memories, no curation for legacy | Free / $1.99-9.99/month (storage) |
| **Chatbooks** | Automatic physical books, 300k+ subscribers | Physical only, no digital collaboration, manual selection | $8-15/month |
| **FamilyAlbum** | Popular in Asia (7M+ users), private sharing | Manual uploads, no AI curation, low US adoption | Freemium / $3/month |
| **Ancestry.com** | 25M+ users, historical genealogy market leader | Focuses on past, not living memories | $24.99-44.99/month |
| **Tinybeans** | 5M+ users, journal + photos | Requires constant manual input, high friction | Freemium / $4.99/month |

**Rootline Advantage:** Only platform combining AI curation + family collaboration + generational timeline

---

### Appendix B: User Testimonials (Beta Feedback)

> "I've been meaning to organize my kids' photos for years. Rootline did it in 10 minutes. I cried when I saw the first monthly email."  
> — Maria S., beta user (mother of 3)

> "My mom (72) can finally see photos of her grandkids without me having to text them one by one. She checks the timeline every day!"  
> — Jason T., beta user (son)

> "This is what Google Photos should have been — actually helping me preserve memories, not just storing them."  
> — Amanda K., beta user (photographer)

---

### Appendix C: FAQ

**Q: How is Rootline different from Google Photos?**  
A: Google Photos stores your photos. Rootline preserves your family's story across generations with AI curation, family tree context, and legacy features.

**Q: What happens to my photos if Rootline shuts down?**  
A: You retain full ownership. We provide one-click export of all photos + metadata. We're also building redundancy with multiple cloud providers.

**Q: Can I control who sees what?**  
A: Yes. Granular privacy controls let you decide which photos/albums are visible to which family members.

**Q: Do I have to use Google Photos?**  
A: No. You can connect iCloud, upload manually, or even email photos to your family archive.

**Q: Is my data secure?**  
A: Yes. All data is encrypted (AES-256 at rest, TLS 1.3 in transit). We use read-only OAuth scopes and never modify your original photos.

---

### Appendix D: Pre-Launch Validation Experiment

**Before building the full product, run this 30-day validation:**

**Week 1-2:** Landing page + ads
- Create landing page with video mockup
- Run $1k in Facebook/Instagram ads
- **Target:** 150+ email signups
- **Success Metric:** 2%+ conversion rate

**Week 3:** In-depth interviews
- Interview 30 signups
- Ask: willingness to pay, feature priorities, family dynamics
- **Success Metric:** 10+ families say "I'd pay today if it existed"

**Week 4:** Concierge MVP
- Offer manual service to 5 families for $19/month
- You manually curate their photos, create timeline, send emails
- **Success Metric:** 3+ families pay upfront and stay engaged for 60 days

**Decision Point:**
- ✅ **GO:** If 3+ families pay and remain engaged → Build full product
- ⚠️ **ITERATE:** If 1-2 families pay but low engagement → Reassess product/pricing
- ❌ **NO-GO:** If 0 families pay → Pivot or abandon

---

**END OF DOCUMENT**

---

*This PRD is a living document and will be updated as the product evolves. For questions or feedback, contact the Product Team.*
