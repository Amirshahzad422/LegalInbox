-- ============================================
-- LegalInbox Seed Data
-- ============================================

-- Clients
insert into clients (id, name, contact_email, contact_phone) values
  ('11111111-1111-1111-1111-111111111111', 'Meridian Holdings LLC', 'contact@meridianholdings.com', '555-0101'),
  ('22222222-2222-2222-2222-222222222222', 'Dana Whitfield', 'dana.whitfield@email.com', '555-0102');

-- Staff (voice_profile = sample of their own past writing style)
insert into staff (id, name, email, voice_profile) values
  ('33333333-3333-3333-3333-333333333333', 'James Harrow', 'jharrow@harrowbennett.com',
   'Thank you for reaching out. I have reviewed the matter and want to make sure we move forward carefully and thoroughly. Please let me know if you have any questions in the meantime.'),
  ('44444444-4444-4444-4444-444444444444', 'Priya Bennett', 'pbennett@harrowbennett.com',
   'Thanks for the note! Happy to help get this sorted quickly. Let me know if anything below needs adjusting.'),
  ('55555555-5555-5555-5555-555555555555', 'Marcus Ellery', 'mellery@harrowbennett.com',
   'I appreciate you bringing this to my attention. Below is a summary of next steps, and I am available to discuss further at your convenience.');

-- Matters
insert into matters (id, client_id, name, status) values
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Meridian Holdings - Contract Review', 'open'),
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'Whitfield v. Carson - Custody Matter', 'open');

-- Templates (one per category)
insert into templates (category, body, version) values
  ('new_inquiry', 'Thank you for contacting Harrow & Bennett. We have received your inquiry and an attorney will follow up within 1-2 business days to discuss next steps.', 1),
  ('document_request', 'This confirms we have received the requested documents. Our team is reviewing them and will follow up with any questions or next steps shortly.', 1),
  ('scheduling', 'Thank you for reaching out to schedule a time. The following times are available: [PROPOSED_TIMES]. Please confirm which works best for you.', 1),
  ('billing', 'Thank you for your billing inquiry. Please find the requested invoice details attached, and let us know if you have any questions.', 1),
  ('court_deadline', 'This is a reminder regarding the upcoming deadline for [MATTER_NAME]. Please review the attached details and confirm receipt at your earliest convenience.', 1),
  ('opposing_counsel', 'Thank you for your correspondence. We are reviewing the matter and will respond substantively within the appropriate timeframe.', 1),
  ('spam', 'No response required.', 1);

-- Sample emails (varied categories and urgency)
insert into emails (sender, subject, body, category, urgency_score, matter_id, client_id, status) values
  ('newclient@example.com', 'Need help with a contract dispute', 'Hi, I was referred to your firm and I need help reviewing a contract dispute with a vendor. Can someone call me?', 'new_inquiry', 0.40, null, null, 'needs_reply'),
  ('dana.whitfield@email.com', 'Sending over the documents you requested', 'Attached are the documents from our last conversation regarding custody arrangements.', 'document_request', 0.35, '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'needs_reply'),
  ('contact@meridianholdings.com', 'Can we reschedule our call?', 'Something came up on my end, could we push our Thursday call to next week?', 'scheduling', 0.25, '66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'needs_reply'),
  ('billing@meridianholdings.com', 'Question about last invoice', 'We noticed a discrepancy on invoice #4521, could someone clarify the hours billed?', 'billing', 0.45, '66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'needs_reply'),
  ('clerk@countycourt.gov', 'URGENT: Filing deadline tomorrow', 'This is a reminder that the filing deadline for case #2024-CV-3391 is tomorrow at 5PM. Failure to file may result in dismissal.', 'court_deadline', 0.95, '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'needs_reply'),
  ('opposing.counsel@rivalfirm.com', 'Settlement terms - response needed', 'We need your client''s position on the settlement terms proposed last week by end of day Friday.', 'opposing_counsel', 0.80, '66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'needs_reply'),
  ('promo@legalsoftwaredeals.com', 'Save 50% on case management software!', 'Limited time offer for law firms...', 'spam', 0.05, null, null, 'needs_reply'),
  ('newclient2@example.com', 'Family law consultation request', 'I am looking for representation regarding a divorce proceeding. What are your rates?', 'new_inquiry', 0.30, null, null, 'needs_reply'),
  ('dana.whitfield@email.com', 'Quick question before Monday', 'Before our meeting Monday, can you clarify what documents I still need to bring?', 'scheduling', 0.50, '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'needs_reply'),
  ('opposing.counsel@rivalfirm.com', 'Motion to compel - your response', 'Please see attached motion to compel filed this morning regarding discovery in the Carson matter.', 'opposing_counsel', 0.90, '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'needs_reply');