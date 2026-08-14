import { authenticate } from "@/lib/middleware";
import { getUsage } from "@/lib/usage";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * GET /api/usage
 * Return the authenticated user's current plan usage snapshot
 * (resume count/limit, AI credits used/remaining, reset date).
 */
export async function GET(request) {
  try {
    const { userId } = await authenticate(request);
    const usage = await getUsage(userId);

    if (!usage) {
      return apiError("User not found", 404);
    }

    return apiSuccess(usage);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Get usage error:", error);
    return apiError("Internal server error");
  }
}
