import { db } from "@/lib/db";

const RESOLVED_RETENTION_HOURS = 24;

export async function cleanupResolvedSupportConversations() {
  const cutoff = new Date(
    Date.now() -
      RESOLVED_RETENTION_HOURS * 60 * 60 * 1000
  );

  try {
    const result =
      await db.supportConversation.deleteMany({
        where: {
          status: "RESOLVED",

          resolvedAt: {
            not: null,
            lte: cutoff,
          },
        },
      });

    return {
      success: true,
      deletedCount: result.count,
    };
  } catch (error) {
    console.error(
      "Failed to clean up resolved support conversations:",
      error
    );

    return {
      success: false,
      deletedCount: 0,
    };
  }
}