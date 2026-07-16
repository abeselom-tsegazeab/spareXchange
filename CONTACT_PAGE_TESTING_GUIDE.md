# Contact Page Email Testing Guide

## Quick Smoke Test (2 minutes)

### Prerequisites
1. Ensure frontend dev server is running: `cd frontend && npm run dev`
2. Open browser console (F12)
3. Navigate to: `http://localhost:5173/contact`

### Test Steps

#### ✅ Test 1: Form Renders Correctly
1. Visit `/contact` page
2. Verify you see:
   - [ ] Full Name input field
   - [ ] Email Address input field
   - [ ] Subject input field
   - [ ] Message textarea
   - [ ] Send Message button
   - [ ] Contact information (email, phone, address)

**Expected Result:** All form fields and contact info visible

---

#### ✅ Test 2: Email Sends Successfully
1. Fill out the form:
   - **Name:** Your Name
   - **Email:** your.email@example.com
   - **Subject:** Test Contact Form
   - **Message:** This is a test message from the contact form

2. Open Browser Console (F12 → Console tab)
3. Click **"Send Message"**
4. Check console for logs:
   ```
   EmailJS Config: { serviceId: '✓ Set', templateId: '✓ Set', publicKey: '✓ Set' }
   Sending email with params: { from_name: '...', from_email: '...', ... }
   EmailJS Response: { status: 200, text: 'OK' }
   ```

5. Verify:
   - [ ] Button shows "Sending..." with spinner
   - [ ] Success toast notification appears
   - [ ] Success message box appears (green)
   - [ ] Form clears automatically
   - [ ] Check your EmailJS dashboard for the sent email

**Expected Result:** Email sent successfully, success message displayed

---

#### ✅ Test 3: Form Validation Works
1. Try to submit empty form
2. **Expected:** HTML5 validation prevents submission

3. Enter invalid email: `not-an-email`
4. Try to submit
5. **Expected:** Browser shows email format error

---

## Comprehensive Testing (10 minutes)

### Test 4: Error Handling - Network Failure
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Fill out the form
4. Click "Send Message"
5. **Expected:**
   - Error toast appears
   - Red error message box shows
   - Console shows error details

---

### Test 5: Error Handling - Invalid Credentials
1. Temporarily modify `frontend/.env`:
   ```
   VITE_EMAILJS_SERVICE_ID=invalid_service
   ```
2. Restart dev server
3. Fill and submit form
4. **Expected:**
   - Error message in console
   - Toast shows error
   - EmailJS error displayed

5. **Revert** the `.env` change after testing

---

### Test 6: Loading State
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Fill out the form
4. Click "Send Message"
5. **Expected:**
   - Button shows "Sending..." with spinner
   - All form fields are disabled
   - Button is disabled
   - After sending completes, form re-enables

---

### Test 7: Multiple Submissions
1. Fill out the form
2. Submit successfully
3. Verify form clears
4. Fill out again with different data
5. Submit again
6. **Expected:** Second email sends successfully

---

### Test 8: Special Characters
1. Fill form with special characters:
   - **Name:** José García-O'Müller
   - **Subject:** Question about products & services
   - **Message:** Hello! I'm interested in your services. Can you help me? Thanks! 😊

2. Submit
3. **Expected:** Email sends with special characters preserved

---

### Test 9: Long Content
1. Fill message field with 500+ characters
2. Submit
3. **Expected:** Email sends successfully with full message

---

### Test 10: Mobile Responsiveness
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on different screen sizes:
   - [ ] iPhone SE (375px)
   - [ ] iPad (768px)
   - [ ] Desktop (1920px)

4. **Expected:**
   - Mobile: Single column layout, logo visible
   - Tablet: Form centered
   - Desktop: Split layout with image

---

## EmailJS Dashboard Verification

### Check Email Was Sent
1. Go to: https://dashboard.emailjs.com/
2. Navigate to **Email History**
3. Verify:
   - [ ] Your test email appears
   - [ ] Correct recipient email
   - [ ] All form data captured (name, email, subject, message)
   - [ ] Status shows "Sent"

### Check Template Variables
In EmailJS template (`template_et2wvus`), ensure these variables are used:
```
{{from_name}}
{{from_email}}
{{subject}}
{{message}}
{{to_name}}
{{reply_to}}
```

---

## Troubleshooting

### Issue: "Email service not configured"
**Solution:**
1. Check `frontend/.env` exists
2. Verify all three variables are set:
   ```
   VITE_EMAILJS_SERVICE_ID=service_lix03wa
   VITE_EMAILJS_TEMPLATE_ID=template_et2wvus
   VITE_EMAILJS_PUBLIC_KEY=35mp7E8Wbq60-dktV
   ```
3. Restart dev server: `npm run dev`

---

### Issue: Console shows "Missing EmailJS configuration"
**Solution:**
1. Check browser console for which variable is missing
2. Verify `.env` file is in `frontend/` directory (not root)
3. Ensure variables start with `VITE_`
4. Restart dev server

---

### Issue: EmailJS returns 400 error
**Possible causes:**
1. Invalid Service ID
2. Invalid Template ID
3. Template variables don't match
4. Email service not activated in EmailJS

**Solution:**
1. Verify credentials in EmailJS dashboard
2. Check template uses correct variable names
3. Ensure email service is connected and active

---

### Issue: Emails not received
**Check:**
1. EmailJS dashboard → Email History (was it sent?)
2. Spam/Junk folder
3. Email service connection (Gmail/Outlook/etc.)
4. Template "To Email" setting

---

## Console Debug Checklist

When testing, verify these console logs appear:

```javascript
// ✅ Should see on page load:
(no errors)

// ✅ Should see when submitting:
EmailJS Config: { serviceId: '✓ Set', templateId: '✓ Set', publicKey: '✓ Set' }
Sending email with params: { from_name: '...', from_email: '...', subject: '...', message: '...', to_name: 'SpareXchange Team', reply_to: '...' }

// ✅ On success:
EmailJS Response: { status: 200, text: 'OK' }

// ❌ On error:
Error sending email: { ... }
Error details: { message: '...', text: '...', status: 400 }
```

---

## Performance Benchmarks

- **Form Load Time:** < 1 second
- **Email Send Time:** 1-3 seconds (depends on network)
- **Success/Error Feedback:** Immediate
- **Form Reset:** Immediate after success

---

## Test Results Template

```markdown
### Test Execution Date: YYYY-MM-DD

| Test | Status | Notes |
|------|--------|-------|
| Test 1: Form Renders | ✅/❌ | |
| Test 2: Email Sends | ✅/❌ | |
| Test 3: Validation | ✅/❌ | |
| Test 4: Network Error | ✅/❌ | |
| Test 5: Invalid Creds | ✅/❌ | |
| Test 6: Loading State | ✅/❌ | |
| Test 7: Multiple Submit | ✅/❌ | |
| Test 8: Special Chars | ✅/❌ | |
| Test 9: Long Content | ✅/❌ | |
| Test 10: Mobile | ✅/❌ | |

**Overall Result:** PASS/FAIL
**Issues Found:** (list any)
```

---

## Post-Deployment Checklist

After deploying to production:

1. [ ] Update `.env` with production EmailJS credentials
2. [ ] Test email sending on production URL
3. [ ] Verify CORS settings in EmailJS
4. [ ] Check email delivery to production inbox
5. [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
6. [ ] Remove console.log statements from production code (optional)
