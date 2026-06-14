export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.POSTHOG_PROJECT_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
  const apiHost = process.env.POSTHOG_HOST || "https://us.i.posthog.com";
  const projectId = process.env.POSTHOG_PROJECT_ID || "";

  response.setHeader("Cache-Control", "no-store");
  return response.status(200).json({
    enabled: Boolean(token),
    projectId,
    token,
    apiHost,
  });
}
