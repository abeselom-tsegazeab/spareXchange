# EmailJS Template Setup Guide

## Template Configuration for Contact Form

### Step 1: Access Your Template
1. Go to https://dashboard.emailjs.com/
2. Navigate to **Email Templates**
3. Click on your template: `template_et2wvus`

---

### Step 2: Configure Template Settings

**To Email:** `a.abeselom.t@gmail.com` (or your team email)
**From Name:** `{{from_name}}`
**From Email:** `{{from_email}}`
**Reply-To:** `{{reply_to}}`
**Subject:** `Contact Form: {{subject}}`

---

### Step 3: Email Body Template

Copy and paste this into your EmailJS template body:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f9f9f9;
        }
        .header {
            background: #16a34a;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
        }
        .contact-info {
            background: #f0fdf4;
            border-left: 4px solid #16a34a;
            padding: 15px;
            margin: 20px 0;
        }
        .contact-info h3 {
            margin-top: 0;
            color: #16a34a;
        }
        .contact-info p {
            margin: 5px 0;
        }
        .message-box {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #16a34a;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 New Contact Form Submission</h1>
            <p>SpareXchange Website</p>
        </div>
        
        <div class="content">
            <h2>Contact Information</h2>
            
            <div class="contact-info">
                <h3>👤 User Details</h3>
                <p><strong>Name:</strong> {{from_name}}</p>
                <p><strong>Email:</strong> {{from_email}}</p>
                <p><strong>Reply-To:</strong> {{reply_to}}</p>
            </div>
            
            <h2>Message Details</h2>
            <p><strong>Subject:</strong> {{subject}}</p>
            
            <div class="message-box">
                <h3>💬 Message:</h3>
                <p>{{message}}</p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
            
            <h3>✉️ Quick Reply</h3>
            <p>Click below to reply directly to {{from_name}}:</p>
            <a href="mailto:{{from_email}}?subject=Re: {{subject}}" class="button">
                Reply to {{from_name}}
            </a>
            
            <p style="margin-top: 20px;">
                <strong>Contact Info Summary:</strong><br>
                {{contact_info}}
            </p>
        </div>
        
        <div class="footer">
            <p>This email was sent from the SpareXchange contact form.</p>
            <p>© 2026 SpareXchange. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

### Step 4: Plain Text Version (Optional)

For email clients that don't support HTML:

```
NEW CONTACT FORM SUBMISSION
===========================

USER CONTACT INFORMATION:
Name: {{from_name}}
Email: {{from_email}}
Reply-To: {{reply_to}}

MESSAGE DETAILS:
Subject: {{subject}}

Message:
{{message}}

---------------------------
Contact Summary:
{{contact_info}}

---------------------------
Reply directly to: {{from_email}}

© 2026 SpareXchange
```

---

### Step 5: Available Template Variables

Your email template can use these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{from_name}}` | User's full name | "John Doe" |
| `{{from_email}}` | User's email address | "john@example.com" |
| `{{subject}}` | Message subject | "Question about products" |
| `{{message}}` | User's message | "Hello, I need help with..." |
| `{{to_name}}` | Recipient name | "SpareXchange Team" |
| `{{reply_to}}` | Reply-to email | "john@example.com" |
| `{{user_name}}` | User's name (alias) | "John Doe" |
| `{{user_email}}` | User's email (alias) | "john@example.com" |
| `{{contact_info}}` | Formatted contact info | "Name: John Doe\nEmail: john@example.com..." |

---

### Step 6: Test Your Template

1. Click **"Send Test"** in EmailJS dashboard
2. Fill in test values:
   - from_name: Test User
   - from_email: test@example.com
   - subject: Test Subject
   - message: This is a test message
3. Check your inbox for the formatted email

---

### Expected Email Output

When a user submits the contact form, your team will receive an email like this:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 New Contact Form Submission
SpareXchange Website
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Contact Information

👤 User Details
Name: Abebe Kebede
Email: abebe@example.com
Reply-To: abebe@example.com

Message Details
Subject: Question about spare parts

💬 Message:
Hello, I'm looking for spare parts for 
my car. Can you help me find what I need?
I have a 2020 Toyota Corolla.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✉️ Quick Reply
Click below to reply directly to Abebe Kebede:
[Reply to Abebe Kebede] (button)

Contact Info Summary:
Name: Abebe Kebede
Email: abebe@example.com
Subject: Question about spare parts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This email was sent from the SpareXchange contact form.
© 2026 SpareXchange. All rights reserved.
```

---

### Troubleshooting

**Variables not showing?**
- Check variable names match exactly (case-sensitive)
- Verify all variables are defined in the template

**Email not received?**
- Check EmailJS Email History
- Verify "To Email" is set correctly
- Check spam folder

**Formatting broken?**
- Ensure HTML is properly formatted
- Check for missing closing tags
- Test with plain text version first

---

### Pro Tips

1. ✅ Always include `{{reply_to}}` so you can click "Reply" in your email client
2. ✅ Use `{{from_email}}` in the email body for easy copying
3. ✅ Include `{{contact_info}}` for a quick summary
4. ✅ Add a "Reply" button for one-click responses
5. ✅ Use HTML formatting for better readability

---

**Template ID:** `template_et2wvus`  
**Service ID:** `service_lix03wa`  
**Last Updated:** 2026-05-25
