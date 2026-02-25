import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function isJwtDecryptionError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  const name = (err as Error & { name?: string })?.name;
  return (
    name === "JWEDecryptionFailed" ||
    message.includes("decryption operation failed") ||
    message.includes("JWEDecryptionFailed")
  );
}

/**
 * Returns the current session. On invalid JWT (e.g. wrong NEXTAUTH_SECRET),
 * returns null so callers (e.g. API routes) can return 401.
 */
export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch (err) {
    if (isJwtDecryptionError(err)) return null;
    throw err;
  }
}

/**
 * Use in root layout only. Returns session or redirects to signout so the
 * invalid JWT cookie is cleared and the user can log in again.
 */
export async function getSessionOrRedirect() {
  try {
    return await getServerSession(authOptions);
  } catch (err) {
    if (isJwtDecryptionError(err)) {
      const { redirect } = await import("next/navigation");
      redirect("/api/auth/signout?callbackUrl=/login");
    }
    throw err;
  }
}
