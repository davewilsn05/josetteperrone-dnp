export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const token =
    process.env.POSTHOG_PROJECT_API_KEY ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY ||
    "phc_nWx62fCav8mzSqL5nvA4WfSrjJck7nKszMygBvD3wXCn";
  const apiHost = process.env.POSTHOG_HOST || "https://us.i.posthog.com";

  response.setHeader("Cache-Control", "no-store");
  return response.status(200).json({
    enabled: Boolean(token),
    projectId: "438687",
    token,
    apiHost,
  });
}
