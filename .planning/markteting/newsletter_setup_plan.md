# Newsletter & Email Marketing Setup Plan

## Context

| Field | Detail |
|:---|:---|
| **Site** | felixseeger.de (Next.js 15 static export, WordPress headless CMS) |
| **Backend** | fs26-back.felixseeger.de (WordPress REST API) |
| **Existing Assets** | Lead magnet strategy, 5-email nurture sequence, A/B test copy variants |
| **Target Audience** | Beginners curious about AI Agents (non-technical, ChatGPT users) |
| **Compliance** | GDPR (German-based), double opt-in mandatory |
| **Constraint** | Static export -- no Next.js API routes, client-side or WP-based integration only |

---

## 1. Email Service Provider (ESP) Selection

### Recommended: **MailerLite**

| Criteria | MailerLite | ConvertKit (Kit) | Brevo (Sendinblue) |
|:---|:---|:---|:---|
| **Free Tier** | 1,000 subs / 12,000 emails/mo | 1,000 subs (limited automations) | 300 emails/day (unlimited contacts) |
| **Automation** | Yes (visual builder) | Yes (visual builder) | Yes |
| **Landing Pages** | Yes (built-in) | Yes | Yes |
| **GDPR Compliance** | EU-based (Lithuania), built-in double opt-in | US-based, GDPR tools available | EU-based (France), built-in |
| **API / Embeds** | REST API + embeddable forms | REST API + embeddable forms | REST API + embeddable forms |
| **WordPress Plugin** | Yes (official) | Yes (official) | Yes (official) |
| **Pricing at Scale** | $10/mo for 500-1k subs | $29/mo for 1k subs | Free up to 300/day |
| **Best For** | Creators, course sellers | Creators, newsletters | Transactional + marketing |

**Why MailerLite:**
- EU-based = GDPR native (data stored in EU)
- Generous free tier to start
- Visual automation builder for the nurture sequence
- Built-in landing page builder for the lead magnet
- Embeddable forms work with static sites
- Cost-effective scaling for a personal brand

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  felixseeger.de                  │
│              (Next.js Static Export)             │
│                                                 │
│  ┌──────────────┐    ┌──────────────────────┐   │
│  │ Blog Posts    │    │ Course Landing Page   │   │
│  │ (inline form)│    │ (hero opt-in form)    │   │
│  └──────┬───────┘    └──────────┬───────────┘   │
│         │                       │               │
│  ┌──────┴───────┐    ┌─────────┴────────────┐   │
│  │ Footer       │    │ Lead Magnet Popup /   │   │
│  │ (signup form)│    │ Exit Intent           │   │
│  └──────┬───────┘    └──────────┬───────────┘   │
│         │                       │               │
└─────────┼───────────────────────┼───────────────┘
          │                       │
          ▼                       ▼
┌─────────────────────────────────────────────────┐
│            MailerLite API / Embed                │
│                                                 │
│  ┌──────────────┐    ┌──────────────────────┐   │
│  │ Group:        │    │ Group:                │   │
│  │ "Blog Updates"│    │ "AI Agents Course"    │   │
│  └──────┬───────┘    └──────────┬───────────┘   │
│         │                       │               │
│         ▼                       ▼               │
│  ┌──────────────┐    ┌──────────────────────┐   │
│  │ Automation:   │    │ Automation:           │   │
│  │ Welcome +     │    │ Lead Magnet Delivery  │   │
│  │ Weekly Digest │    │ + 5-Email Nurture     │   │
│  └──────────────┘    └──────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 3. Subscriber Groups & Tags

### Groups (Lists)

| Group | Purpose | Entry Point |
|:---|:---|:---|
| **Blog Updates** | General newsletter, blog digests | Footer form, blog inline form |
| **AI Agents Course** | Course nurture sequence | Lead magnet download, course landing page |

### Tags (for Segmentation)

| Tag | Applied When |
|:---|:---|
| `lead-magnet-downloaded` | Downloads the AI Agent Starter Kit |
| `course-interested` | Clicks course link in nurture emails |
| `course-purchased` | Completes purchase (manual or webhook) |
| `source-blog` | Signs up from blog/footer |
| `source-landing` | Signs up from course landing page |
| `source-ad-meta` | From Meta ads (UTM-tracked) |
| `source-ad-linkedin` | From LinkedIn ads (UTM-tracked) |

---

## 4. Opt-In Forms (Integration Points)

Since the site is a static export, there are **three integration approaches**:

### Option A: MailerLite Embedded Forms (Recommended for Start)

MailerLite generates an HTML/JS embed snippet. Drop it into React components.

**Pros:** Zero backend needed, GDPR double opt-in handled by MailerLite, instant setup.
**Cons:** Styling requires CSS overrides, slight flash of unstyled content.

### Option B: MailerLite API (Client-Side Fetch)

Submit from a custom React form directly to the MailerLite API.

**Pros:** Full design control, seamless UX.
**Cons:** API key exposed client-side (use subscriber-write-only key), need to build double opt-in flow manually or rely on MailerLite's group settings.

### Option C: WordPress Plugin Bridge

Install MailerLite WordPress plugin. Submit form to WordPress, which forwards to MailerLite.

**Pros:** API key stays server-side, can leverage WP form infrastructure.
**Cons:** Extra hop, tied to WP availability.

### Recommended: Start with **Option A** (embedded), migrate to **Option B** (API) when design polish matters.

---

## 5. Form Placement Strategy

### 5.1 Footer Newsletter Signup (Site-Wide)

| Detail | Value |
|:---|:---|
| **Location** | Footer component, all pages |
| **Group** | Blog Updates |
| **Fields** | Email only (+ hidden source tag) |
| **Copy** | "Get weekly insights on AI, web development, and building digital products." |
| **CTA** | "Subscribe" |
| **GDPR** | Checkbox: "I agree to receive emails. You can unsubscribe anytime." + link to privacy policy |

### 5.2 Blog Post Inline CTA

| Detail | Value |
|:---|:---|
| **Location** | After every blog post (before comments/footer) |
| **Group** | Blog Updates |
| **Fields** | Email + First Name |
| **Copy** | "Enjoyed this post? Get more like it straight to your inbox." |
| **CTA** | "Join the Newsletter" |

### 5.3 Course Landing Page Hero

| Detail | Value |
|:---|:---|
| **Location** | Hero section of `/courses/ai-agents` (new page) |
| **Group** | AI Agents Course |
| **Fields** | Email + First Name |
| **Copy** | "Download the free AI Agent Starter Kit -- 3 copy-paste workflows to automate your first task." |
| **CTA** | "Send Me the Kit" |
| **Tag** | `lead-magnet-downloaded`, `source-landing` |

### 5.4 Exit-Intent Popup (Optional, Phase 2)

| Detail | Value |
|:---|:---|
| **Location** | Blog pages + course page, triggers on exit intent |
| **Group** | AI Agents Course |
| **Fields** | Email only |
| **Copy** | "Wait -- grab 3 free AI workflows before you go." |
| **CTA** | "Get the Free Kit" |

---

## 6. Email Automation Flows

### Flow 1: Blog Welcome Sequence

```
Trigger: Joins "Blog Updates" group
    │
    ├── [Immediately] Email: Welcome + what to expect
    │     Subject: "Welcome! Here's what you signed up for"
    │     Content: Intro, what topics you cover, link to best posts
    │
    ├── [Day 3] Email: Top 3 posts
    │     Subject: "3 posts you shouldn't miss"
    │     Content: Curated best content links
    │
    └── [Ongoing] Weekly Digest (RSS-to-Email or manual broadcast)
          Subject: "This week: [Topic]"
          Content: Latest blog post + one personal insight
```

### Flow 2: Lead Magnet Nurture Sequence (5 Emails)

Directly implements the existing strategy from `email_sequence_and_lead_magnet.md`:

```
Trigger: Joins "AI Agents Course" group + tagged "lead-magnet-downloaded"
    │
    ├── [Immediately] Email 1: Kit Delivery + New Identity
    │     Subject: "Your Agent Starter Kit is inside (Open to start building)"
    │
    ├── [Day 1] Email 2: The "Chat Trap" (Problem Agitation)
    │     Subject: "Why ChatGPT feels like a dead end"
    │
    ├── [Day 2] Email 3: The Epiphany (Education)
    │     Subject: "The difference between an Encyclopedia and an Intern"
    │
    ├── [Day 3] Email 4: Soft Sell (Social Proof)
    │     Subject: "I built this in 20 minutes (No code)"
    │
    └── [Day 4] Email 5: Hard Sell (Offer)
          Subject: "Stop falling behind. Start building."
          │
          ├── IF opened Email 5 + clicked → Tag: "course-interested"
          │     → Move to "Post-Offer" follow-up (resend after 3 days)
          │
          └── IF no open after Day 7 → Tag: "cold-lead"
                → Move to monthly newsletter (Blog Updates group)
```

### Flow 3: Post-Purchase (Phase 2)

```
Trigger: Tagged "course-purchased"
    │
    ├── [Immediately] Email: Welcome + access instructions
    ├── [Day 3] Email: How's it going? (engagement check)
    ├── [Day 7] Email: Quick wins showcase
    └── [Day 14] Email: Request for testimonial/review
```

---

## 7. GDPR Compliance Checklist

| Requirement | Implementation |
|:---|:---|
| **Double Opt-In** | MailerLite sends confirmation email automatically (enabled in group settings) |
| **Consent Record** | MailerLite stores timestamp + IP of opt-in |
| **Privacy Policy** | Link to `/datenschutz` (or `/privacy`) in every form |
| **Unsubscribe Link** | Automatic in every MailerLite email footer |
| **Data Deletion** | MailerLite supports subscriber deletion on request |
| **Cookie Consent** | Newsletter form does NOT set cookies (no consent needed for the form itself). MailerLite tracking pixels require mention in privacy policy |
| **Imprint/Impressum** | Must include in every email footer (German law) |
| **Opt-In Checkbox** | Explicit, unchecked by default, with clear text |
| **Data Processing Agreement** | Sign DPA with MailerLite (available in dashboard) |

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

- [ ] Create MailerLite account
- [ ] Sign DPA (Data Processing Agreement)
- [ ] Create groups: "Blog Updates", "AI Agents Course"
- [ ] Configure double opt-in for both groups
- [ ] Set up email footer with Impressum + unsubscribe
- [ ] Design email template (match site branding: dark/light, Unbounded + Poppins fonts)
- [ ] Create embedded form for **Footer Newsletter Signup**
- [ ] Integrate footer form into Next.js `Footer.tsx` component
- [ ] Update Privacy Policy page with email marketing disclosure
- [ ] Test: subscribe, confirm, receive welcome email

### Phase 2: Course Funnel (Week 3-4)

- [ ] Upload lead magnet PDF to MailerLite (or host on site at `/downloads/ai-agent-starter-kit.pdf`)
- [ ] Build **Lead Magnet Nurture Automation** (5-email sequence from existing copy)
- [ ] Create course landing page `/courses/ai-agents` with hero opt-in form
- [ ] Set up UTM parameter passthrough for source tagging
- [ ] Test: full funnel from signup → kit delivery → 5 emails → course link
- [ ] Connect A/B test variants (landing page copy) to the form

### Phase 3: Content Engine (Week 5-6)

- [ ] Create **Blog Post Inline CTA** component
- [ ] Add inline CTA to blog post template
- [ ] Set up **Weekly Digest** automation (manual broadcast or RSS trigger)
- [ ] Create first 2-3 newsletter editions as templates

### Phase 4: Optimization (Ongoing)

- [ ] Implement exit-intent popup (using MailerLite popup or custom React modal)
- [ ] Set up post-purchase email flow
- [ ] A/B test subject lines within MailerLite
- [ ] Monitor: open rates, click rates, unsubscribe rates
- [ ] Segment cold leads → re-engagement campaign after 30 days

---

## 9. Key Metrics & Targets

| Metric | Target | Tool |
|:---|:---|:---|
| **List Growth Rate** | +50 subs/month (Phase 1) | MailerLite dashboard |
| **Opt-In Conversion Rate** | > 2% of site visitors | Form impressions vs. subs |
| **Welcome Email Open Rate** | > 60% | MailerLite analytics |
| **Nurture Sequence Open Rate** | > 40% average | MailerLite automation stats |
| **Nurture → Course CTR** | > 5% (Email 4 + 5) | Link click tracking |
| **Unsubscribe Rate** | < 0.5% per email | MailerLite analytics |
| **Spam Complaint Rate** | < 0.1% | MailerLite deliverability |

---

## 10. Technical Integration Notes

### Footer Form Component (Phase 1 Implementation)

```tsx
// src/components/ui/NewsletterForm.tsx
'use client';

import { useState, FormEvent } from 'react';

interface NewsletterFormProps {
  group?: 'blog' | 'course';
  source?: string;
  compact?: boolean;
}

export default function NewsletterForm({ 
  group = 'blog', 
  source = 'footer',
  compact = false 
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Option A: MailerLite embedded form (use their JS snippet)
      // Option B: Direct API call with write-only API key
      const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MAILERLITE_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          groups: [group === 'course' 
            ? process.env.NEXT_PUBLIC_ML_GROUP_COURSE 
            : process.env.NEXT_PUBLIC_ML_GROUP_BLOG
          ],
          fields: { source },
        }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <p className="text-sm text-green-500">
        Check your inbox to confirm your subscription.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground 
                   border border-border text-sm"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-5 py-2 bg-primary text-primary-foreground rounded-lg 
                   text-sm font-semibold hover:opacity-90 transition-opacity
                   disabled:opacity-50"
      >
        {status === 'loading' ? '...' : 'Subscribe'}
      </button>
    </form>
  );
}
```

### Environment Variables Needed

```env
# .env.local
NEXT_PUBLIC_MAILERLITE_API_KEY=your-subscriber-write-only-key
NEXT_PUBLIC_ML_GROUP_BLOG=group-id-for-blog
NEXT_PUBLIC_ML_GROUP_COURSE=group-id-for-course
```

---

## 11. Email Template Design Guidelines

| Element | Specification |
|:---|:---|
| **Max Width** | 600px |
| **Font (Headings)** | Unbounded (web-safe fallback: Arial Black) |
| **Font (Body)** | Poppins (web-safe fallback: Helvetica, Arial) |
| **Colors (Dark)** | Background: #0a0a0a, Text: #fafafa, Accent: brand primary |
| **Colors (Light)** | Background: #ffffff, Text: #171717, Accent: brand primary |
| **Logo** | felix.svg (centered, top) |
| **Footer** | Impressum link, Privacy Policy link, Unsubscribe link |
| **Responsive** | Single-column layout, 16px min font size on mobile |
