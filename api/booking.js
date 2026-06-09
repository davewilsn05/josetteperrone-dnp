export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY || "";
  const recaptchaToken = request.body?.recaptchaToken;

  if (secretKey) {
    if (!recaptchaToken) {
      return response.status(400).json({ error: "reCAPTCHA token missing." });
    }

    const verification = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: recaptchaToken,
      }),
    });
    const result = await verification.json();

    if (!result.success || result.score < 0.5 || result.action !== "booking_inquiry") {
      return response.status(403).json({ error: "reCAPTCHA verification failed." });
    }
  }

  return response.status(503).json({
    error: "Booking email delivery is not configured yet.",
  });
}
