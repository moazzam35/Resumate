import { requireAdmin } from "@/lib/middleware";
import { apiSuccess, apiError, safeBody } from "@/lib/api-response";
import { SITE_CONFIG } from "@/lib/constants";

/**
 * GET /api/admin/settings
 * Return current application settings (admin only).
 * Settings are sourced from environment variables and defaults.
 */
export async function GET(request) {
  try {
    await requireAdmin(request);

    const settings = {
      siteName: process.env.SITE_NAME || SITE_CONFIG.name,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || SITE_CONFIG.url,
      aiModel: process.env.AI_MODEL || "meta-llama/llama-3.3-70b-instruct",
      aiEnabled: process.env.AI_ENABLED !== "false",
      stripeEnabled: !!process.env.STRIPE_SECRET_KEY,
      emailEnabled: !!process.env.SMTP_HOST,
      maxResumesPerUser: parseInt(process.env.MAX_RESUMES_PER_USER || "10"),
      freeAiRequestsPerDay: parseInt(process.env.FREE_AI_REQUESTS_PER_DAY || "5"),
      proAiRequestsPerDay: parseInt(process.env.PRO_AI_REQUESTS_PER_DAY || "50"),
    };

    return apiSuccess(settings);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin get settings error:", error);
    return apiError("Internal server error");
  }
}

/**
 * PUT /api/admin/settings
 * Update application settings (admin only).
 *
 * Settings are sourced from environment variables (.env), so there is nothing
 * to persist. We deliberately return an error instead of a fake success so the
 * admin UI can never claim a save happened when nothing changed.
 */
export async function PUT(request) {
  try {
    await requireAdmin(request);

    const body = await safeBody(request);
    if (!body) {
      return apiError("Invalid request body", 400);
    }

    return apiError(
      "Platform settings are configured via environment variables (.env) and can only be changed on the server. Saving from this panel is not supported yet.",
      400
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin update settings error:", error);
    return apiError("Internal server error");
  }
}
