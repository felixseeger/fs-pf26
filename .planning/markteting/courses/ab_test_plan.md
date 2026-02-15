# A/B Test Plan: Intro to AI Agents – Landing Page Copy

## Test Overview

| Field | Detail |
|:---|:---|
| **Test Name** | AI Agents Course – Hero Copy Variant |
| **Objective** | Determine which messaging angle (Emotional/Safe vs. Direct/Aspirational) drives higher enrollment for the "Intro to AI Agents" course |
| **Test Type** | A/B Split (50/50 traffic allocation) |
| **Primary Metric** | Conversion Rate (CTA click -> enrollment) |
| **Secondary Metrics** | Bounce rate, scroll depth, time on page, CTA click-through rate |
| **Min. Sample Size** | 500 visitors per variant (1,000 total) for 95% confidence |
| **Expected Duration** | 2–4 weeks (depending on traffic volume) |
| **Traffic Source** | Paid ads (Meta, LinkedIn), organic social, email list |

---

## Hypothesis

> **Variant A ("The Bridge"):** Addressing the beginner's feeling of inadequacy directly will build trust and lower the barrier to entry, leading to a higher conversion rate from visitors who feel emotionally "stuck."
>
> **Variant B ("The Upgrade"):** Focusing on the tangible superpower of Agents and aspirational identity shift will trigger curiosity and desire, leading to a higher conversion rate from action-oriented visitors.

**Null Hypothesis:** There is no statistically significant difference in conversion rate between Variant A and Variant B.

---

## Variant A: "The Bridge" (Emotional/Safe)

**Angle:** Relatable -- validates insecurity, offers a safe path forward.

| Element | Copy |
|:---|:---|
| **Headline** | You use ChatGPT every day. So why does it feel like everyone else is miles ahead? |
| **Subheadline** | Stop just chatting with AI. Start building with it. A step-by-step path for non-coders to build real apps, automations, and agents -- no technical background required. |
| **CTA Button** | Start Building (Even If You Can't Code) |
| **Problem Block** | You see the posts on X and LinkedIn. People building entire apps in minutes. Automating their whole workflow. Meanwhile, you're still just... asking questions and getting text answers. You know AI is powerful, but you don't know how to cross the bridge from "user" to "builder." |
| **Solution Block** | The secret isn't learning to code. It's learning **Agents**. While ChatGPT waits for you to type, AI Agents *do work for you*. They are the missing link that turns your ideas into working software. |

**Psychological Levers:** Identification (validates insecurity), Hope (safe step-by-step path), Labeling (redefines from "falling behind" to "future builder"), Simplicity (emphasizes safety).

---

## Variant B: "The Upgrade" (Direct/Aspirational)

**Angle:** Empowerment -- highlights the capability gap, triggers aspiration.

| Element | Copy |
|:---|:---|
| **Headline** | Stop Chatting. Start Building. |
| **Subheadline** | Most people use AI as a smart search engine. Learn the "Agentic" workflow that turns you into a software builder overnight -- without writing a single line of code. |
| **CTA Button** | Build Your First AI Agent |
| **Problem Block** | ChatGPT is a tool. **Agentic AI is a workforce.** If you're only using AI to write emails or summarize text, you are leaving 90% of its power on the table. The gap between you and the "tech wizards" isn't code -- it's knowing how to command agents. |
| **Solution Block** | Imagine an AI that doesn't just talk back, but *executes*. It writes files, runs code, and browses the web to finish tasks. This course is your manual for the new engine of creation. |

**Psychological Levers:** Curiosity (what is "Agentic AI?"), Belief (tangible superpower), Labeling (redefines from "chatter" to "commander"), Simplicity (emphasizes power).

---

## Test Matrix: What Changes vs. What Stays Constant

| Element | Changes Between Variants? | Notes |
|:---|:---|:---|
| Headline | Yes | Core variable |
| Subheadline | Yes | Core variable |
| CTA button text | Yes | Core variable |
| Problem/Agitation block | Yes | Core variable |
| Solution block | Yes | Core variable |
| Page layout / design | No | Identical structure |
| Pricing / offer | No | Same course, same price |
| Social proof / testimonials | No | Same section |
| Navigation / footer | No | Same site chrome |
| Traffic source mix | No | Same campaign split |

---

## Audience Segmentation

Both variants target the **Beginner Avatar**:

- Uses ChatGPT regularly but feels stuck at "surface level"
- Non-technical, no coding background
- Emotionally: curiosity mixed with inadequacy
- Desire: wants to "build things" but doesn't know how
- Fear: being left behind by the AI revolution

### Optional Sub-Segmentation (Phase 2)

If sample size allows, segment results by:
- **Traffic source** (paid vs. organic vs. email) -- messaging resonance may differ
- **Device** (mobile vs. desktop) -- shorter copy may win on mobile
- **Geography** (EN vs. DE markets) -- cultural tone preference

---

## Success Criteria

| Metric | Target | How to Measure |
|:---|:---|:---|
| **Primary: Conversion Rate** | > 3% baseline | Enrollments / Unique visitors |
| **CTA Click-Through Rate** | > 8% | CTA clicks / Page views |
| **Bounce Rate** | < 60% | Single-page sessions |
| **Avg. Time on Page** | > 45 seconds | Analytics |
| **Scroll Depth (75%+)** | > 40% of visitors | Scroll tracking event |

**Winner Declaration:**
- Minimum 95% statistical confidence (p < 0.05)
- Minimum 500 visitors per variant
- Test runs for at least 7 full days (to account for weekday/weekend patterns)
- If no clear winner after 4 weeks: declare inconclusive, iterate

---

## Implementation Checklist

### Pre-Launch
- [ ] Build landing page with both variant copy sets
- [ ] Set up A/B split tool (Google Optimize, VWO, or custom UTM-based routing)
- [ ] Configure conversion tracking (enrollment event as goal)
- [ ] Set up scroll depth and CTA click tracking events
- [ ] QA both variants on desktop + mobile
- [ ] Verify 50/50 traffic split is working
- [ ] Align ad creatives -- use neutral ad copy that doesn't pre-bias toward either variant

### During Test
- [ ] Monitor daily for technical issues (broken tracking, uneven split)
- [ ] Do NOT peek at results before minimum sample size is reached
- [ ] Document any external events that could affect results (e.g., viral post, newsletter send)

### Post-Test
- [ ] Export raw data (visitors, clicks, conversions per variant)
- [ ] Run statistical significance test (chi-squared or z-test for proportions)
- [ ] Document winner + margin of improvement
- [ ] Create follow-up test plan (iterate on winning variant's weak points)

---

## Ad Creative Alignment

To avoid biasing the test, ad creatives should use **neutral** messaging that doesn't lean toward either variant's angle:

| Channel | Suggested Neutral Ad Copy |
|:---|:---|
| **Meta (Facebook/Instagram)** | "Learn Agentic AI -- the skill that turns non-coders into builders. Free intro course." |
| **LinkedIn** | "AI Agents are changing how non-technical professionals work. Start with this free course." |
| **Email Subject Lines** | "Your next step with AI (it's not what you think)" / "From ChatGPT user to AI builder" |

---

## Follow-Up Tests (Roadmap)

| Priority | Test | Dependent On |
|:---|:---|:---|
| 1 | **CTA color/size** on winning variant | This test concludes |
| 2 | **Social proof placement** (above fold vs. below) | This test concludes |
| 3 | **Video vs. text hero** | Winning copy variant |
| 4 | **Price anchoring** (free trial vs. discount vs. full price) | Conversion baseline established |
| 5 | **Audience-specific landing pages** (ads target beginner vs. intermediate) | Avatar research complete |

---

## Decision Framework

```
IF Variant A wins by > 10% relative lift:
  -> Deploy Variant A as default
  -> Next test: iterate on A's CTA (test urgency vs. safety language)

IF Variant B wins by > 10% relative lift:
  -> Deploy Variant B as default
  -> Next test: iterate on B's headline (test shorter vs. longer)

IF difference < 10% relative lift (either direction):
  -> Combine best elements (A's subheadline + B's headline)
  -> Run a new "hybrid" variant test

IF inconclusive after 4 weeks:
  -> Increase traffic budget OR
  -> Simplify test (headline-only change) to reduce noise
```
