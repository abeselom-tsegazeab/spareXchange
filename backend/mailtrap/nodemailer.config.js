import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const fromEmail = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL;

const createTransporters = () => {
  // If no SMTP credentials are provided, return null (for development mode)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  const auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };

  const baseConfig = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  };

  const transporters = [baseConfig];

  if (process.env.SMTP_HOST?.includes("gmail.com")) {
    transporters.unshift({
      ...baseConfig,
      port: 465,
      secure: true,
      requireTLS: true,
    });
    transporters.push({
      ...baseConfig,
      port: 587,
      secure: false,
      requireTLS: true,
    });
  }

  return transporters.map((config) => nodemailer.createTransport(config));
};

const sendWithResend = async (to, subject, html) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  const fromAddress = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || "onboarding@resend.dev";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`Resend API error: ${response.status} ${errorPayload}`);
  }

  return true;
};

export const sendEmail = async (to, subject, html) => {
  const hasResendKey = Boolean(process.env.RESEND_API_KEY);
  if (hasResendKey) {
    try {
      console.log("Using Resend API for outgoing email");
      const result = await sendWithResend(to, subject, html);
      if (result) {
        console.log("Email sent successfully via Resend");
        return true;
      }
    } catch (error) {
      console.error("Resend email failed:", error);
    }
  }

  // Check if we have SMTP credentials
  const hasCredentials = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (!hasCredentials) {
    const missingVars = [];
    if (!process.env.SMTP_HOST) missingVars.push("SMTP_HOST");
    if (!process.env.SMTP_USER) missingVars.push("SMTP_USER");
    if (!process.env.SMTP_PASS) missingVars.push("SMTP_PASS");

    console.error(`Email sending failed: missing SMTP env vars: ${missingVars.join(", ")}`);
    return false;
  }

  if (!fromEmail) {
    console.error("Email sending failed: FROM_EMAIL is not configured");
    return false;
  }

  const transporters = createTransporters();

  // If transporter is null, we're in development without credentials
  if (!transporters || transporters.length === 0) {
    console.log("Email sending skipped (no transporter available)");
    return true;
  }

  for (const transporter of transporters) {
    try {
      const host = transporter.options?.host || process.env.SMTP_HOST;
      const port = transporter.options?.port || process.env.SMTP_PORT || 587;
      console.log(`Verifying SMTP connection via ${host}:${port}...`);
      await transporter.verify();
      console.log(`SMTP connection is ready via ${host}:${port}`);
      console.log(`Attempting to send email to: ${to}`);
      console.log(`Using SMTP host: ${host}:${port}`);
      console.log(`From: SpareXchange <${fromEmail}>`);

      const info = await transporter.sendMail({
        from: `SpareXchange <${fromEmail}>`,
        to,
        subject,
        html,
      });

      console.log("Email sent successfully: %s", info.messageId);
      return true;
    } catch (error) {
      console.error(`SMTP attempt failed for ${transporter.options?.host || process.env.SMTP_HOST}:${transporter.options?.port || process.env.SMTP_PORT || 587}`);
      console.error("Error sending email:", error);
      if (error.code) {
        console.error(`SMTP Error Code: ${error.code}`);
      }
      if (error.response) {
        console.error(`SMTP Response: ${error.response}`);
      }
      if (error.code === "EAUTH") {
        console.error("Authentication failed. Please check your SMTP credentials.");
        console.error("Make sure you are using an App Password, not your regular Gmail password.");
      }
    }
  }

  return false;
};
