import { NextResponse } from "next/server";

/**
 * Consistent API response helper.
 * Every endpoint should return responses through this helper for consistency.
 *
 * @param {object} options
 * @param {*} options.data - Response data
 * @param {string} options.message - Success message
 * @param {number} options.status - HTTP status code
 * @param {boolean} options.success - Whether the request succeeded
 */
export function apiSuccess(data = null, message = "Success", status = 200) {
  return NextResponse.json(
    { success: true, message, data },
    { status }
  );
}

export function apiCreated(data = null, message = "Created successfully") {
  return NextResponse.json(
    { success: true, message, data },
    { status: 201 }
  );
}

export function apiError(message = "Internal server error", status = 500, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return NextResponse.json(body, { status });
}

export function apiNotFound(message = "Resource not found") {
  return apiError(message, 404);
}

export function apiValidationError(errors, message = "Validation failed") {
  return NextResponse.json(
    { success: false, message, errors },
    { status: 422 }
  );
}

export function apiRateLimited(message = "Rate limit exceeded. Please try again later.") {
  return apiError(message, 429);
}

/**
 * Pagination helper for list endpoints.
 * @param {object} params
 * @param {number} params.total
 * @param {number} params.page
 * @param {number} params.limit
 * @param {object} [extra] - Optional extra top-level fields merged into the response
 */
export function apiPaginated(data, { total, page, limit }, extra = {}) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    ...extra,
  });
}

/**
 * Safely parse request body, returning null on failure.
 */
export async function safeBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Validate required fields in request body.
 * @param {object} body
 * @param {string[]} requiredFields
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateRequired(body, requiredFields) {
  if (!body) return { valid: false, missing: requiredFields };
  const missing = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ""
  );
  return { valid: missing.length === 0, missing };
}

/**
 * Safely parse pagination query params. Non-numeric or out-of-range values
 * fall back to the defaults instead of producing NaN/negative skips.
 * @param {URLSearchParams} searchParams
 * @param {{ page?: number, limit?: number, maxLimit?: number }} [opts]
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function parsePagination(searchParams, { page: defaultPage = 1, limit: defaultLimit = 20, maxLimit = 100 } = {}) {
  const rawPage = Number.parseInt(searchParams.get("page"), 10);
  const rawLimit = Number.parseInt(searchParams.get("limit"), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : defaultPage;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, maxLimit)
    : defaultLimit;

  return { page, limit, skip: (page - 1) * limit };
}
