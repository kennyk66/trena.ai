# PRD #0005: Outreach Generation Agent

## 1. Introduction/Overview

This PRD defines the Outreach Generation Agent - an AI-powered system that creates hyper-personalized emails, LinkedIn messages, and call scripts based on buyer research, AI personas, buying signals, and the user's unique selling style. The agent generates outreach that feels handcrafted, not AI-written, by learning from the user's own examples and adapting to each buyer's context.

**Problem it solves:** Sales reps struggle to write personalized outreach at scale. Generic templates get ignored. Writing custom messages for every prospect is time-consuming and mentally draining. Even when reps have great research, they struggle to translate insights into compelling, authentic outreach that resonates with buyers.

**Goal:** Generate hyper-personalized, authentic outreach (email, LinkedIn, call scripts) in under 10 seconds per prospect, using AI that adapts to the user's voice and the buyer's specific context, pain points, and buying signals.

## 2. Goals

1. Generate personalized email, LinkedIn message, and call script for any researched lead
2. Use buyer persona, buying signals, and user's selling style to create authentic, human-sounding outreach
3. Allow users to optionally provide example emails so AI learns their unique voice and style
4. Enable users to edit and regenerate outreach with different angles/tones
5. Surface buying signals and conversation starters naturally in the outreach
6. Deliver outreach copy-ready in under 10 seconds
7. Support follow-up message generation (user requests next message in sequence)
8. Ensure outreach never sounds "AI-written" or generic

## 3. User Stories

**As a sales rep**, I want to:
- Generate a personalized email for a lead in seconds instead of spending 15 minutes writing
- Have the AI write in MY voice, not a generic corporate tone
- See buying signals and pain points woven naturally into the message
- Edit the AI's draft if I want to tweak something
- Regenerate with a different angle if the first version doesn't feel right
- Get LinkedIn messages and call scripts in addition to email
- Copy outreach to my clipboard and paste into Gmail/LinkedIn quickly
- Generate follow-up messages when leads don't respond
- Trust that my outreach feels authentic and won't get flagged as spam

**As a product owner**, I want to:
- Dramatically reduce time reps spend writing outreach (from 10+ min to <1 min per lead)
- Increase response rates by ensuring every message is personalized and relevant
- Make Trena feel like an extension of the rep, not a generic AI tool
- Track which generated messages get sent and responded to (future analytics)

## 4. Functional Requirements

### Outreach Generation Trigger (FR-TRIGGER)

1. The system must allow users to generate outreach from:
   - Lead detail view (PRD #0003) - "Generate Outreach" button
   - Today's Focus list (PRD #0004) - "Generate Outreach" quick action
   - Researched Leads list - inline "Generate Outreach" button
2. The system must require a researched lead with AI persona to generate outreach
3. The system must show modal/drawer with outreach options:
   - Email
   - LinkedIn Message
   - Call Script
   - Generate All (default)
4. The system must allow users to select which type(s) to generate

### AI Outreach Generation - Email (FR-EMAIL)

5. The system must generate a personalized cold outreach email including:
   - **Subject Line**: Compelling, personalized (references company, signal, or pain point)
   - **Opening**: Natural greeting + personalized hook (buying signal, recent news, mutual connection)
   - **Body** (3-4 sentences):
     - Acknowledge buyer's likely pain point or goal (from AI persona)
     - Briefly introduce value proposition aligned to their context
     - Reference specific buying signal if present (funding, new role, company growth)
     - Include conversation starter or thought-provoking question
   - **Call-to-Action**: Low-friction ask (15-min call, quick question, resource share)
   - **Signature**: User's name, title, company (from profile)
6. The system must use these inputs for generation:
   - Lead's AI persona (pain points, goals, talk tracks)
   - Lead's buying signals
   - User's selling style (from onboarding: formal, casual, direct, consultative, enthusiastic)
   - User's example emails (if provided)
   - Lead's name, title, company, industry
7. The system must generate email in under 10 seconds
8. The system must ensure email length is 100-150 words (concise, scannable)
9. The system must avoid AI-sounding phrases like "I hope this email finds you well" or "leverage synergies"
10. The system must write in user's voice (if examples provided) or match their selected selling style

### AI Outreach Generation - LinkedIn Message (FR-LINKEDIN)

11. The system must generate a personalized LinkedIn connection request or InMail including:
    - **Opening**: Warm, conversational (mention mutual connection, group, or interest)
    - **Body** (2-3 sentences):
      - Acknowledge their role/company/recent achievement
      - Brief value proposition or reason to connect
      - Include buying signal reference if present
    - **Close**: Simple ask (connect, quick question, share insight)
12. The system must keep LinkedIn messages under 300 characters for connection requests
13. The system must generate longer InMail version (up to 200 words) if user selects that option
14. The system must adapt tone to be slightly more casual/friendly than email (LinkedIn culture)

### AI Outreach Generation - Call Script (FR-CALL)

15. The system must generate a call script including:
    - **Opening Line**: Warm intro with permission ("Is this a good time for a quick call?")
    - **Hook**: Reference to buying signal, recent news, or pain point
    - **Key Talking Points** (2-3 bullets):
      - Pain point acknowledgment
      - Value proposition tailored to their role/industry
      - Proof point or social proof (if available)
    - **Close**: Simple ask (schedule demo, send resource, next steps)
16. The system must keep call scripts under 200 words (30-60 second pitch)
17. The system must write in spoken, conversational language (not formal email tone)

### Example-Based Learning (FR-EXAMPLES)

18. The system must allow users to provide example emails to teach AI their style
19. The system must provide an "Add Example" interface where users can:
    - Paste 2-5 of their best cold emails
    - Label each example (optional: "cold outreach", "follow-up", "warm intro")
    - Save examples to their profile
20. The system must analyze example emails to extract:
    - Tone/voice patterns
    - Sentence structure and length
    - Common phrases and word choice
    - Signature style
21. The system must use examples as reference when generating new outreach (via AI prompt)
22. The system must store examples in `user_outreach_examples` table
23. The system must allow users to edit or delete examples anytime
24. The system must work without examples (use selling style as default)

### Personalization Elements (FR-PERSONALIZATION)

25. The system must incorporate buying signals naturally:
    - Funding: "Congrats on the Series B - as you scale..."
    - New hire: "Saw you recently joined as CTO - curious about..."
    - Growth: "Noticed you're expanding into [region]..."
26. The system must reference pain points from AI persona:
    - "Many [job titles] struggle with [pain point]..."
    - "Balancing [goal A] with [goal B] is tough..."
27. The system must use conversation starters from AI persona as hooks
28. The system must include lead's name, company, and title naturally (not forced)
29. The system must avoid over-personalization that feels creepy or overly researched

### Edit & Regenerate (FR-EDIT)

30. The system must display generated outreach in an editable text area
31. The system must allow users to edit any part of the generated text
32. The system must provide a "Regenerate" button with options:
    - Regenerate with same inputs (get variation)
    - Regenerate with different tone (select: more casual, more formal, more direct)
    - Regenerate with different angle (lead with different pain point or signal)
33. The system must preserve user edits unless they click "Regenerate"
34. The system must show loading state during regeneration (~5-10s)

### Copy & Send (FR-COPY)

35. The system must provide "Copy to Clipboard" buttons for:
    - Email (copies subject + body)
    - LinkedIn message
    - Call script
36. The system must show confirmation toast: "✓ Copied to clipboard"
37. The system must provide instructions for MVP:
    - "Paste into Gmail/Outlook to send"
    - "Paste into LinkedIn message to send"
38. The system must track when outreach is copied (save to `outreach_history` table)
39. The system must NOT send emails directly in MVP (copy-paste only)
40. The system must prepare for future email integration (Gmail/Outlook OAuth)

### Follow-Up Generation (FR-FOLLOWUP)

41. The system must allow users to generate follow-up messages
42. The system must show "Generate Follow-Up" button in lead detail view
43. The system must ask context before generating follow-up:
    - "Did they respond?" (Yes/No)
    - If No: "How long since last message?" (3 days, 1 week, 2 weeks)
    - If Yes: "What was their response?" (text input or selection)
44. The system must generate follow-up that:
    - References previous message naturally
    - Adds new value (different angle, resource, insight)
    - Adjusts tone based on time passed (more persistent if 2 weeks, softer if 3 days)
    - Avoids sounding pushy or desperate
45. The system must support generating multiple follow-ups in a sequence (user requests one at a time)

### Data Storage (FR-DATA)

46. The system must create a `user_outreach_examples` table:
    - id (UUID, primary key)
    - user_id (foreign key to user_profiles)
    - example_type (enum: 'cold', 'followup', 'warm', 'other')
    - example_text (text)
    - created_at (timestamp)
47. The system must create an `outreach_history` table:
    - id (UUID, primary key)
    - user_id (foreign key to user_profiles)
    - lead_id (foreign key to researched_leads)
    - outreach_type (enum: 'email', 'linkedin', 'call_script')
    - subject_line (text, nullable)
    - message_body (text)
    - ai_model_used (text, e.g., 'gpt-4', 'claude-3.5-sonnet')
    - generation_time_ms (integer)
    - user_edited (boolean, default false)
    - copied_at (timestamp, nullable)
    - sent_at (timestamp, nullable) - for future tracking
    - created_at (timestamp)
48. The system must save all generated outreach to history (for analytics and re-use)

### AI Model & Prompting (FR-AI)

49. The system must use GPT-4 or Claude 3.5 Sonnet for generation
50. The system must construct prompts with:
    - User's selling style
    - User's example emails (if provided)
    - Lead's AI persona (full JSON)
    - Lead's buying signals
    - Lead's name, title, company, industry
    - Instructions to write in user's voice, avoid AI phrases, keep concise
51. The system must include prompt instructions:
    - "Write as if you are {user_name}, not an AI"
    - "Avoid phrases like 'I hope this finds you well', 'circle back', 'touch base'"
    - "Be specific and personalized, not generic"
    - "Reference buying signals naturally, not forced"
    - "Keep it concise and scannable"
52. The system must validate AI output:
    - Check for minimum length (email: 50+ words)
    - Check for personalization (must include lead's name or company)
    - Reject generic output and regenerate if detected

## 5. Non-Goals (Out of Scope)

The following are explicitly **not** included in this PRD:

- Direct email sending via Gmail/Outlook (copy-paste only in MVP)
- LinkedIn automation or auto-sending (copy-paste only, avoid ToS violations)
- Email tracking (opens, clicks, replies) - post-MVP
- A/B testing different outreach variations
- Team templates or shared example library
- Automated follow-up sequences (user must manually request each follow-up)
- Multi-language outreach generation
- SMS/WhatsApp message generation
- Video script generation
- Integration with email sequencing tools (Outreach.io, SalesLoft)
- Spam score checking or deliverability optimization

## 6. Design Considerations

### Visual Design - Outreach Generator Modal

```
┌─────────────────────────────────────────────────────┐
│ Generate Outreach for John Smith                   │
│ VP of Sales @ Acme Corp                             │
├─────────────────────────────────────────────────────┤
│ [Email] [LinkedIn] [Call Script] [Generate All ✓]  │
├─────────────────────────────────────────────────────┤
│ 📧 Email                                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Subject: Scaling sales at Acme post-Series B    │ │
│ │                                                 │ │
│ │ Hi John,                                        │ │
│ │                                                 │ │
│ │ Congrats on Acme's $20M Series B! As you scale │ │
│ │ your sales team, one challenge many VPs face   │ │
│ │ is ensuring reps have time for high-value      │ │
│ │ conversations vs. manual research.              │ │
│ │                                                 │ │
│ │ We help sales teams automate buyer research    │ │
│ │ and personalize outreach, so reps focus on     │ │
│ │ closing deals, not Googling prospects.         │ │
│ │                                                 │ │
│ │ Worth a 15-min chat to explore?                │ │
│ │                                                 │ │
│ │ Best,                                           │ │
│ │ [Your Name]                                     │ │
│ └─────────────────────────────────────────────────┘ │
│ [Copy Email] [Regenerate ↻] [Edit Tone ▼]          │
├─────────────────────────────────────────────────────┤
│ 💬 LinkedIn Message                                 │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Hi John - saw Acme just raised a Series B,     │ │
│ │ congrats! I work with sales leaders scaling    │ │
│ │ teams post-funding. Quick question about how   │ │
│ │ you're handling prospect research at scale?    │ │
│ └─────────────────────────────────────────────────┘ │
│ [Copy LinkedIn] [Regenerate ↻]                      │
├─────────────────────────────────────────────────────┤
│ 📞 Call Script                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ "Hi John, this is [Name]. Is this a good time  │ │
│ │ for a quick call? ... I saw Acme raised $20M   │ │
│ │ recently - as you're scaling, curious how your │ │
│ │ team handles prospect research? We help VPs    │ │
│ │ like you automate that so reps focus on        │ │
│ │ selling. Worth a 15-min demo?"                 │ │
│ └─────────────────────────────────────────────────┘ │
│ [Copy Script] [Regenerate ↻]                        │
└─────────────────────────────────────────────────────┘
```

### Regenerate Options

```
┌────────────────────────────────┐
│ Regenerate Options             │
├────────────────────────────────┤
│ ○ Variation (same tone/angle) │
│ ○ More casual                  │
│ ○ More formal                  │
│ ○ More direct                  │
│ ○ Lead with different signal   │
│                                │
│ [Cancel] [Regenerate →]        │
└────────────────────────────────┘
```

### Add Example Interface

```
┌─────────────────────────────────────────────────────┐
│ Teach Trena Your Voice                              │
├─────────────────────────────────────────────────────┤
│ Paste 2-5 of your best cold emails so the AI can   │
│ learn your style, tone, and voice.                  │
│                                                     │
│ Example Type: [Cold Outreach ▼]                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Paste your email here...                        │ │
│ │                                                 │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│ [Add Another Example]                               │
│                                                     │
│ Your Examples (2):                                  │
│ • Cold outreach - SaaS VP target [Edit] [Delete]   │
│ • Warm intro - referral style [Edit] [Delete]      │
│                                                     │
│ [Save Examples]                                     │
└─────────────────────────────────────────────────────┘
```

### UX Flow
1. User clicks "Generate Outreach" from lead detail
2. Modal opens with options (Email, LinkedIn, Call Script)
3. User selects "Generate All" (or specific types)
4. AI generates in 5-10 seconds, shows results
5. User reviews, edits if needed
6. User clicks "Copy Email", pastes into Gmail
7. User clicks "Copy LinkedIn", pastes into LinkedIn
8. System logs activity to `outreach_history`

### Mobile Optimization
- Full-screen modal on mobile
- Swipeable tabs for Email/LinkedIn/Call Script
- Large "Copy" buttons at top and bottom
- Editable text area with mobile keyboard support

## 7. Technical Considerations

### AI Model Selection
- **Primary**: Claude 3.5 Sonnet (better at nuanced voice matching, follows instructions well)
- **Fallback**: GPT-4 or GPT-4o (if Claude unavailable)
- **Cost**: ~$0.01-0.05 per outreach generation (acceptable for MVP)

### Prompt Engineering

**Email Generation Prompt Template:**
```
You are a sales rep assistant. Generate a personalized cold outreach email.

CONTEXT:
- You are writing as: {user_name}, {user_title} at {user_company}
- Your selling style: {user_selling_style}
- Target buyer: {lead_name}, {lead_title} at {lead_company}

BUYER INTELLIGENCE:
{ai_persona_json}

BUYING SIGNALS:
{buying_signals_list}

YOUR VOICE (learn from these examples):
{user_examples}

INSTRUCTIONS:
1. Write in {user_name}'s voice (or {selling_style} if no examples)
2. Keep email 100-150 words, 3-4 sentences
3. Subject line: 5-8 words, personalized
4. Opening: Reference buying signal or pain point naturally
5. Body: Acknowledge pain point, introduce value prop, include conversation starter
6. CTA: Low-friction ask (15-min call, question, resource)
7. AVOID: "I hope this finds you well", "circle back", "touch base", "leverage", generic corporate speak
8. BE: Specific, personalized, conversational, human

OUTPUT FORMAT:
{
  "subject": "...",
  "body": "..."
}
```

### Example Analysis (if provided)
- Extract tone markers (formal vs casual)
- Identify common sentence starters
- Detect signature style
- Note length preferences
- Identify power words user favors

### Performance Optimization
- Cache AI persona to avoid re-fetching
- Stream AI responses for faster perceived load time
- Prefetch buyer data when user opens detail view
- Lazy load LinkedIn/Call Script (only generate when tab selected)

### Error Handling
- AI timeout (>30s): Show error, allow retry
- Generic output detected: Auto-regenerate once
- API failure: Show friendly error, save draft locally
- Network issue: Preserve user edits in local storage

### Database Schema

**user_outreach_examples:**
```sql
CREATE TABLE user_outreach_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  example_type TEXT CHECK (example_type IN ('cold', 'followup', 'warm', 'other')),
  example_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**outreach_history:**
```sql
CREATE TABLE outreach_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  lead_id UUID REFERENCES researched_leads(id),
  outreach_type TEXT CHECK (outreach_type IN ('email', 'linkedin', 'call_script')),
  subject_line TEXT,
  message_body TEXT NOT NULL,
  ai_model_used TEXT,
  generation_time_ms INTEGER,
  user_edited BOOLEAN DEFAULT false,
  copied_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_outreach (user_id, created_at DESC),
  INDEX idx_lead_outreach (lead_id)
);
```

## 8. Success Metrics

**Functional Success:**
1. ✅ User can generate email, LinkedIn, call script in <10 seconds
2. ✅ Generated outreach includes personalization (name, company, signals)
3. ✅ User can edit and regenerate with different tones
4. ✅ User can copy to clipboard successfully
5. ✅ User can add examples and AI uses them in generation
6. ✅ Follow-up generation works and references prior message

**Business Success:**
- 80%+ of researched leads have outreach generated
- Average generation time <10 seconds
- 70%+ of generated outreach is copied (intent to use)
- User rates outreach quality >4/5 stars
- Generated outreach achieves higher response rate than user's manual emails (measure post-launch)

**Technical Success:**
- AI generation success rate >98%
- Zero generic/low-quality outputs reach user (auto-regenerate if detected)
- Page remains responsive during generation (no UI freeze)
- All copied outreach logged to `outreach_history`

## 9. Open Questions

1. **AI Model**: Claude vs GPT-4 - which performs better for voice matching? Should we A/B test?
2. **Example Limit**: Should we cap user examples at 5, or allow unlimited?
3. **Voice Analysis**: Should we show users what the AI learned from their examples (tone, style summary)?
4. **Regeneration Limit**: Should we limit regenerations (e.g., 3 per lead) to control AI costs?
5. **Email Integration Timeline**: When should we prioritize direct Gmail/Outlook sending vs keeping copy-paste?
6. **Quality Check**: Should we add a "Report Low Quality" button for users to flag bad generations?
7. **Multi-language**: If user's examples are in another language, should AI generate in that language?
8. **Character Limits**: Should we enforce strict character limits (email <150 words) or make it flexible?
9. **Follow-up Intelligence**: Should we save "last response" context for smarter follow-up generation?

---

## Next Steps After Implementation

Once outreach generation is complete:
1. Users will have a full workflow: Research → Prioritize → Generate Outreach
2. Outreach activity will feed PRD #0006: Dashboard (show generated/sent counts)
3. Outreach actions will contribute to PRD #0007: Gamification ("Generated 10 emails this week!")
4. Post-MVP: Add email integration (Gmail/Outlook OAuth) for direct sending
5. Post-MVP: Track email performance (opens, replies) to refine AI prompts
