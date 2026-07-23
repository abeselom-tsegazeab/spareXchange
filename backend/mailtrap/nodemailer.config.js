import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const fromEmail = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL;

export const getResendFromAddress = (env = process.env) => {
  const configuredAddress = env.RESEND_FROM_EMAIL || env.FROM_EMAIL;
  if (!configuredAddress) {
    return "onboarding@resend.dev";
  }

  const normalized = configuredAddress.toLowerCase();
  if (
    normalized.endsWith("@gmail.com") ||
    normalized.endsWith("@googlemail.com") ||
    normalized.includes("gmail.com")
  ) {
    return "onboarding@resend.dev";
  }

  return configuredAddress;
};

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

  const fromAddress = getResendFromAddress();
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

// new configuration for Brevo email sending;
export const sendEmail = async (to, subject, html) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME || "SpareXchange";

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!fromEmail) {
    throw new Error("BREVO_FROM_EMAIL is not configured");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: [
        {
          email: to,
        },
      ],
      subject,
      htmlContent: html,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Brevo API error:", result);
    throw new Error(
      `Brevo email failed: ${result.message || response.statusText}`
    );
  }

  console.log("Email sent successfully via Brevo:", result.messageId);

  return true;
};
