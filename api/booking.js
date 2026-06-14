const requiredFields = [
  "name",
  "email",
  "organization",
  "event_type",
  "event_date",
  "format",
  "audience_size",
  "desired_topic",
  "message",
];

const optionalFields = ["location", "budget_range"];
const trackingFields = ["path", "url", "title", "referrer", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

const fieldLabels = {
  name: "Name",
  email: "Email",
  organization: "Organization",
  event_type: "Event type",
  event_date: "Event date",
  format: "Format",
  audience_size: "Audience size",
  location: "Location",
  budget_range: "Budget range",
  desired_topic: "Desired topic",
  message: "Audience context",
};

const textValue = (value, maxLength = 500) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";

const multilineValue = (value, maxLength = 3000) =>
  typeof value === "string" ? value.trim().replace(/\r\n/g, "\n").slice(0, maxLength) : "";

const emailValue = (value) => textValue(value, 320).toLowerCase();

const splitEmails = (value) =>
  textValue(value, 1000)
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const json = (response, status, payload) => response.status(status).json(payload);

const parseBody = (request) => {
  if (!request.body) return {};
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }
  return request.body;
};

const validateInquiry = (body) => {
  const inquiry = {};

  for (const field of requiredFields) {
    inquiry[field] = field === "message" ? multilineValue(body[field]) : textValue(body[field]);
    if (!inquiry[field]) {
      return { error: `${fieldLabels[field]} is required.` };
    }
  }

  for (const field of optionalFields) {
    inquiry[field] = textValue(body[field]);
  }

  inquiry.email = emailValue(inquiry.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) {
    return { error: "A valid email address is required." };
  }

  inquiry.tracking = {};
  const tracking = body.tracking && typeof body.tracking === "object" ? body.tracking : {};
  for (const field of trackingFields) {
    const value = textValue(tracking[field], 1000);
    if (value) inquiry.tracking[field] = value;
  }

  return { inquiry };
};

const recaptchaIsRequired = () => {
  if (process.env.RECAPTCHA_REQUIRED === "true") return true;
  if (process.env.RECAPTCHA_REQUIRED === "false") return false;
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
};

const verifyRecaptcha = async (body) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || "";

  if (!secretKey) {
    if (recaptchaIsRequired()) {
      return { status: 503, error: "Booking verification is not configured." };
    }
    return {};
  }

  const recaptchaToken = textValue(body.recaptchaToken, 4000);
  if (!recaptchaToken) {
    return { status: 400, error: "reCAPTCHA token missing." };
  }

  const verification = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: secretKey,
      response: recaptchaToken,
    }),
  });

  if (!verification.ok) {
    return { status: 503, error: "reCAPTCHA verification is unavailable." };
  }

  const result = await verification.json();
  const minimumScore = Number(process.env.RECAPTCHA_MIN_SCORE || 0.5);

  if (!result.success || result.action !== "booking_inquiry" || typeof result.score !== "number" || result.score < minimumScore) {
    return { status: 403, error: "reCAPTCHA verification failed." };
  }

  return {};
};

const buildInquiryText = (inquiry) => {
  const lines = [
    "New booking inquiry from josetteperrone.com",
    "",
    ...[...requiredFields, ...optionalFields].map((field) => `${fieldLabels[field]}: ${inquiry[field] || "Not provided"}`),
  ];

  if (Object.keys(inquiry.tracking).length) {
    lines.push("", "Tracking context:");
    for (const [key, value] of Object.entries(inquiry.tracking)) {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("", `Submitted: ${new Date().toISOString()}`);
  return lines.join("\n");
};

const providerConfig = () => {
  const to = splitEmails(process.env.BOOKING_TO_EMAIL);
  const from = textValue(process.env.BOOKING_FROM_EMAIL, 320);
  const fromName = textValue(process.env.BOOKING_FROM_NAME, 120) || "Josette Perrone Speaking";

  if (process.env.RESEND_API_KEY && to.length && from) {
    return { provider: "resend", to, from, fromName };
  }

  if (process.env.SENDGRID_API_KEY && to.length && from) {
    return { provider: "sendgrid", to, from, fromName };
  }

  if (process.env.BOOKING_WEBHOOK_URL) {
    return { provider: "webhook", webhookUrl: process.env.BOOKING_WEBHOOK_URL };
  }

  return null;
};

const assertWebhookUrl = (rawUrl) => {
  const url = new URL(rawUrl);
  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(local && process.env.VERCEL_ENV !== "production")) {
    throw new Error("BOOKING_WEBHOOK_URL must use https.");
  }
  return url;
};

const sendWithResend = async (config, inquiry, subject, text) => {
  const delivery = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${config.fromName} <${config.from}>`,
      to: config.to,
      reply_to: inquiry.email,
      subject,
      text,
    }),
  });

  if (!delivery.ok) {
    throw new Error(`Resend delivery failed with ${delivery.status}.`);
  }
};

const sendWithSendGrid = async (config, inquiry, subject, text) => {
  const delivery = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: config.to.map((email) => ({ email })), subject }],
      from: { email: config.from, name: config.fromName },
      reply_to: { email: inquiry.email, name: inquiry.name },
      content: [{ type: "text/plain", value: text }],
    }),
  });

  if (!delivery.ok) {
    throw new Error(`SendGrid delivery failed with ${delivery.status}.`);
  }
};

const sendWithWebhook = async (config, inquiry) => {
  const url = assertWebhookUrl(config.webhookUrl);
  const headers = { "Content-Type": "application/json" };
  if (process.env.BOOKING_WEBHOOK_SECRET) {
    headers.Authorization = `Bearer ${process.env.BOOKING_WEBHOOK_SECRET}`;
  }

  const delivery = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ inquiry, submittedAt: new Date().toISOString() }),
  });

  if (!delivery.ok) {
    throw new Error(`Booking webhook failed with ${delivery.status}.`);
  }
};

const deliverInquiry = async (inquiry) => {
  const config = providerConfig();
  if (!config) {
    return { status: 503, error: "Booking email delivery is not configured." };
  }

  const subject = `Booking inquiry: ${inquiry.organization} - ${inquiry.event_type}`.slice(0, 140);
  const text = buildInquiryText(inquiry);

  if (config.provider === "resend") await sendWithResend(config, inquiry, subject, text);
  if (config.provider === "sendgrid") await sendWithSendGrid(config, inquiry, subject, text);
  if (config.provider === "webhook") await sendWithWebhook(config, inquiry);

  return {};
};

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { error: "Method not allowed" });
  }

  const body = parseBody(request);
  const recaptcha = await verifyRecaptcha(body);
  if (recaptcha.error) {
    return json(response, recaptcha.status, { error: recaptcha.error });
  }

  const { inquiry, error } = validateInquiry(body);
  if (error) {
    return json(response, 400, { error });
  }

  try {
    const delivery = await deliverInquiry(inquiry);
    if (delivery.error) {
      return json(response, delivery.status, { error: delivery.error });
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Booking delivery failed.");
    return json(response, 502, { error: "Booking email delivery failed." });
  }

  return json(response, 200, { ok: true });
}
