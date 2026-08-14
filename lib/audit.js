import prisma from "@/lib/prisma";

export async function logAuditAction({ adminId, action, targetUser, targetEmail, details, ipAddress }) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetUser,
        targetEmail,
        details: details || {},
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}
