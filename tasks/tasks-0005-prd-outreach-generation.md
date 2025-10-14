# Task List: PRD #0005 - Personalized Outreach Generation

## Relevant Files

### Database & Migrations
- `trena-app/supabase-schema-outreach.sql` - SQL migration for outreach tables
- `trena-app/types/outreach.ts` - Outreach-specific TypeScript types
- `trena-app/types/database.ts` - Update with outreach types

### Services & Logic
- `trena-app/lib/outreach/generation-service.ts` - AI outreach generation logic
- `trena-app/lib/outreach/template-service.ts` - Template management
- `trena-app/lib/outreach/coaching-service.ts` - Inline coaching tips logic
- `trena-app/lib/outreach/tone-service.ts` - Tone adjustment utilities

### API Routes
- `trena-app/app/api/outreach/generate/route.ts` - Generate outreach message
- `trena-app/app/api/outreach/messages/route.ts` - Get/update messages
- `trena-app/app/api/outreach/[id]/route.ts` - Single message operations
- `trena-app/app/api/outreach/[id]/regenerate/route.ts` - Regenerate message
- `trena-app/app/api/outreach/templates/route.ts` - Template management

### UI Components
- `trena-app/components/outreach/message-composer.tsx` - Rich text editor
- `trena-app/components/outreach/tone-selector.tsx` - Tone control UI
- `trena-app/components/outreach/context-sidebar.tsx` - Lead insights panel
- `trena-app/components/outreach/coaching-highlight.tsx` - Coaching tips display
- `trena-app/components/outreach/message-preview.tsx` - Preview before sending
- `trena-app/components/outreach/message-card.tsx` - Message history card
- `trena-app/components/outreach/template-selector.tsx` - Template picker

### Pages
- `trena-app/app/(dashboard)/outreach/page.tsx` - Outreach hub (message list)
- `trena-app/app/(dashboard)/outreach/compose/page.tsx` - Compose new message
- `trena-app/app/(dashboard)/outreach/[id]/page.tsx` - View/edit message
- Update `app/(dashboard)/research/leads/[id]/page.tsx` - Add "Generate Outreach" button

### Constants
- `trena-app/lib/constants/outreach-options.ts` - Message types, tones, templates

### Notes
- AI generation uses OpenAI GPT-4 or Anthropic Claude
- Coaching tips identify weak phrases and suggest alternatives
- Support email, LinkedIn, and call scripts
- Track message status: draft, sent, opened, clicked, replied
- Use RLS for data isolation

## Tasks

- [ ] 1.0 Database Schema & Type Definitions
  - [ ] 1.1 Create `supabase-schema-outreach.sql` with outreach_messages table (message_id, user_id, lead_id, message_type, generated_content, edited_content, final_content, tone, coaching_applied, sent_at, status, created_at, updated_at)
  - [ ] 1.2 Add index on outreach_messages (user_id, lead_id, created_at)
  - [ ] 1.3 Create `message_events` table (event_id, message_id, event_type, timestamp, metadata JSONB)
  - [ ] 1.4 Add index on message_events (message_id, event_type, timestamp)
  - [ ] 1.5 Add RLS policies for outreach_messages (user can only see/edit own messages)
  - [ ] 1.6 Add RLS policies for message_events
  - [ ] 1.7 Run SQL migration in Supabase SQL Editor
  - [ ] 1.8 Create `types/outreach.ts` with interfaces: OutreachMessage, MessageEvent, MessageType, ToneOption, CoachingTip, MessageTemplate
  - [ ] 1.9 Update `types/database.ts` with outreach table types
  - [ ] 1.10 Test schema by running migrations

- [ ] 2.0 AI Outreach Generation Service
  - [ ] 2.1 Create `lib/outreach/generation-service.ts` with generateOutreach() function
  - [ ] 2.2 Design AI prompt template for email generation (include lead context, persona, signals, user tone)
  - [ ] 2.3 Design AI prompt template for LinkedIn message generation (shorter, more casual)
  - [ ] 2.4 Design AI prompt template for call script generation (structured talking points)
  - [ ] 2.5 Implement tone adjustment logic (warm, direct, formal, casual)
  - [ ] 2.6 Add user's selling style from onboarding to generation context
  - [ ] 2.7 Add lead's persona and buying signals to generation context
  - [ ] 2.8 Implement structured JSON output parsing
  - [ ] 2.9 Add error handling and fallback for AI failures
  - [ ] 2.10 Create saveOutreachMessage() function to save to database
  - [ ] 2.11 Test generation with various lead types and tones

- [ ] 3.0 Coaching Tips Service
  - [ ] 3.1 Create `lib/outreach/coaching-service.ts` with analyzeMessage() function
  - [ ] 3.2 Define weak phrase patterns ("Just checking in", "Touching base", "Circle back", "Following up", etc.)
  - [ ] 3.3 Define strong alternatives for each weak phrase
  - [ ] 3.4 Implement phrase detection algorithm (regex or AI-based)
  - [ ] 3.5 Calculate coaching score (0-100)
  - [ ] 3.6 Generate improvement suggestions with explanations
  - [ ] 3.7 Highlight weak phrases with positions (start/end character indices)
  - [ ] 3.8 Add best practice tips (personalization, value prop, clear CTA)
  - [ ] 3.9 Test coaching analysis with sample messages

- [ ] 4.0 Template System
  - [ ] 4.1 Create `lib/outreach/template-service.ts` with template management
  - [ ] 4.2 Define default email templates (cold outreach, follow-up, meeting request, value share)
  - [ ] 4.3 Define default LinkedIn templates (connection request, intro message, follow-up)
  - [ ] 4.4 Define default call script templates (discovery, demo, follow-up)
  - [ ] 4.5 Implement template variable replacement ({{lead_name}}, {{company_name}}, {{buying_signal}}, etc.)
  - [ ] 4.6 Create getTemplates() function to fetch templates
  - [ ] 4.7 Create applyTemplate() function to generate from template
  - [ ] 4.8 Add custom template support (user can save their own templates)
  - [ ] 4.9 Test template system with various scenarios

- [ ] 5.0 Outreach API Routes
  - [ ] 5.1 Create POST /api/outreach/generate endpoint (generate outreach for a lead)
  - [ ] 5.2 Implement request validation (lead_id, message_type, tone required)
  - [ ] 5.3 Create GET /api/outreach/messages endpoint (list user's messages with filters)
  - [ ] 5.4 Support pagination (limit, offset)
  - [ ] 5.5 Support filtering (by lead_id, message_type, status)
  - [ ] 5.6 Support sorting (created_at, sent_at)
  - [ ] 5.7 Create GET /api/outreach/[id] endpoint (single message with events)
  - [ ] 5.8 Create PUT /api/outreach/[id] endpoint (update message content/status)
  - [ ] 5.9 Create POST /api/outreach/[id]/regenerate endpoint (regenerate with same parameters)
  - [ ] 5.10 Create DELETE /api/outreach/[id] endpoint (delete draft message)
  - [ ] 5.11 Create GET /api/outreach/templates endpoint (get available templates)
  - [ ] 5.12 Test all API endpoints

- [ ] 6.0 Message Composer Component
  - [ ] 6.1 Create `components/outreach/message-composer.tsx` with rich text editor
  - [ ] 6.2 Install and configure rich text editor library (TipTap or similar)
  - [ ] 6.3 Add formatting toolbar (bold, italic, underline, lists, links)
  - [ ] 6.4 Implement "Generate" button with loading state
  - [ ] 6.5 Implement "Regenerate" button
  - [ ] 6.6 Add subject line input (for emails)
  - [ ] 6.7 Add message body editor
  - [ ] 6.8 Implement character count display
  - [ ] 6.9 Add "Save Draft" button
  - [ ] 6.10 Add "Preview" button
  - [ ] 6.11 Add "Copy to Clipboard" button
  - [ ] 6.12 Add coaching tips display below editor
  - [ ] 6.13 Implement auto-save (every 30 seconds)
  - [ ] 6.14 Test composer with keyboard shortcuts

- [ ] 7.0 Tone Selector Component
  - [ ] 7.1 Create `components/outreach/tone-selector.tsx`
  - [ ] 7.2 Implement radio button group for tone options (warm, direct, formal, casual)
  - [ ] 7.3 Add tone descriptions/examples for each option
  - [ ] 7.4 Add visual icons for each tone
  - [ ] 7.5 Implement formality slider (optional, more granular control)
  - [ ] 7.6 Store selected tone in component state
  - [ ] 7.7 Pass tone to generation function
  - [ ] 7.8 Test tone selector UI

- [ ] 8.0 Context Sidebar Component
  - [ ] 8.1 Create `components/outreach/context-sidebar.tsx`
  - [ ] 8.2 Display lead name, title, company
  - [ ] 8.3 Display priority badge and score
  - [ ] 8.4 Display top 3 buying signals
  - [ ] 8.5 Display key persona insights (pain points, goals)
  - [ ] 8.6 Display suggested talk tracks from persona
  - [ ] 8.7 Add collapsible sections for each context type
  - [ ] 8.8 Make sidebar sticky on scroll
  - [ ] 8.9 Test sidebar with various lead data

- [ ] 9.0 Coaching Highlights Component
  - [ ] 9.1 Create `components/outreach/coaching-highlight.tsx`
  - [ ] 9.2 Display coaching score (0-100) with color coding
  - [ ] 9.3 List weak phrases detected with highlighting
  - [ ] 9.4 Show suggested alternatives for each weak phrase
  - [ ] 9.5 Add explanations for why changes improve response rates
  - [ ] 9.6 Implement tooltip on hover for detailed tips
  - [ ] 9.7 Add "Apply Suggestion" button for one-click fixes
  - [ ] 9.8 Track applied suggestions in database
  - [ ] 9.9 Test coaching display with various messages

- [ ] 10.0 Message Preview Component
  - [ ] 10.1 Create `components/outreach/message-preview.tsx`
  - [ ] 10.2 Display email preview with subject and body
  - [ ] 10.3 Display LinkedIn message preview (max 300 characters)
  - [ ] 10.4 Display call script preview (structured sections)
  - [ ] 10.5 Add "Edit" button to return to composer
  - [ ] 10.6 Add "Copy to Clipboard" button
  - [ ] 10.7 Add "Send" button (placeholder for now)
  - [ ] 10.8 Show character count and validation errors
  - [ ] 10.9 Test preview with different message types

- [ ] 11.0 Compose Page
  - [ ] 11.1 Create `app/(dashboard)/outreach/compose/page.tsx`
  - [ ] 11.2 Accept lead_id as query parameter
  - [ ] 11.3 Fetch lead data for context
  - [ ] 11.4 Display message type selector (Email, LinkedIn, Call Script)
  - [ ] 11.5 Display tone selector
  - [ ] 11.6 Display context sidebar with lead info
  - [ ] 11.7 Display message composer
  - [ ] 11.8 Display coaching highlights below composer
  - [ ] 11.9 Implement generate flow (fetch from API, populate editor)
  - [ ] 11.10 Implement regenerate flow
  - [ ] 11.11 Implement save draft flow
  - [ ] 11.12 Implement preview modal
  - [ ] 11.13 Add loading states for all async operations
  - [ ] 11.14 Add error handling and error messages
  - [ ] 11.15 Test compose page end-to-end

- [ ] 12.0 Outreach Hub Page
  - [ ] 12.1 Create `app/(dashboard)/outreach/page.tsx`
  - [ ] 12.2 Display message list (drafts and sent)
  - [ ] 12.3 Add filters (All, Drafts, Sent, Replied)
  - [ ] 12.4 Add sorting (Most Recent, Oldest, By Lead)
  - [ ] 12.5 Create `components/outreach/message-card.tsx` for list items
  - [ ] 12.6 Display message type icon, subject/preview, lead name, status, date
  - [ ] 12.7 Add "Continue Editing" button for drafts
  - [ ] 12.8 Add "View" button for sent messages
  - [ ] 12.9 Add "Delete" button for drafts
  - [ ] 12.10 Add "Compose New" button
  - [ ] 12.11 Add empty state (no messages yet)
  - [ ] 12.12 Implement pagination
  - [ ] 12.13 Test hub page with multiple messages

- [ ] 13.0 Integration with Lead Detail Page
  - [ ] 13.1 Update `app/(dashboard)/research/leads/[id]/page.tsx`
  - [ ] 13.2 Enable "Generate Outreach" button (remove disabled state)
  - [ ] 13.3 Link button to `/outreach/compose?lead_id={id}`
  - [ ] 13.4 Track "generated_outreach" action when button clicked
  - [ ] 13.5 Test navigation from lead detail to compose page

- [ ] 14.0 Template Management
  - [ ] 14.1 Create `components/outreach/template-selector.tsx`
  - [ ] 14.2 Display available templates by message type
  - [ ] 14.3 Show template preview on hover
  - [ ] 14.4 Add "Use Template" button
  - [ ] 14.5 Implement template application (replace variables, populate editor)
  - [ ] 14.6 Add "Start from Scratch" option
  - [ ] 14.7 Test template selector

- [ ] 15.0 Navigation & Constants
  - [ ] 15.1 Create `lib/constants/outreach-options.ts`
  - [ ] 15.2 Define MESSAGE_TYPE_OPTIONS (Email, LinkedIn, Call Script)
  - [ ] 15.3 Define TONE_OPTIONS (Warm, Direct, Formal, Casual) with descriptions
  - [ ] 15.4 Define MESSAGE_STATUS_OPTIONS (Draft, Sent, Opened, Clicked, Replied)
  - [ ] 15.5 Define WEAK_PHRASES array with alternatives
  - [ ] 15.6 Update sidebar navigation to include "Outreach" link (📧 icon)
  - [ ] 15.7 Test constants in components

- [ ] 16.0 Testing & Polish
  - [ ] 16.1 Test full flow: generate → edit → save draft → preview → copy
  - [ ] 16.2 Test AI generation with various lead types
  - [ ] 16.3 Test tone variations (warm vs formal)
  - [ ] 16.4 Test coaching tips with weak phrases
  - [ ] 16.5 Test template system
  - [ ] 16.6 Test message list and filtering
  - [ ] 16.7 Test delete draft functionality
  - [ ] 16.8 Test mobile responsiveness
  - [ ] 16.9 Verify character limits (LinkedIn 300 chars)
  - [ ] 16.10 Run production build and verify 0 errors
  - [ ] 16.11 Update CHANGELOG.md with PRD #0005 deliverables
  - [ ] 16.12 Update README.md with outreach features
  - [ ] 16.13 Update COMPLETION_STATUS.md
  - [ ] 16.14 Create session summary for PRD #0005

## Estimated Complexity

**Total Estimated Time:** 40-50 hours

**Breakdown:**
- Database & Types: 3-4 hours
- AI Generation Service: 8-10 hours
- Coaching Service: 6-8 hours
- Template System: 4-5 hours
- API Routes: 5-6 hours
- Message Composer: 6-8 hours
- Supporting Components: 6-8 hours
- Pages: 5-6 hours
- Testing & Documentation: 3-4 hours

**Challenges:**
- AI prompt engineering for quality outputs
- Rich text editor integration
- Coaching phrase detection accuracy
- Character limits for LinkedIn
- Mobile-friendly composer UI

## Features for Future Iterations (Not in MVP)

- Email sending integration (Gmail, Outlook OAuth)
- LinkedIn API integration for direct sending
- Message event tracking (opens, clicks, replies)
- A/B testing different message variations
- Custom template creation and management
- Multi-step sequences (cadences)
- Email signature management
- Personalization variables management
- Message scheduling
- Team template sharing
