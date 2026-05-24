export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  return response.status(503).json({
    error: "Booking email delivery is not configured yet.",
  });
}
