/**
 * Validation and key building for media upload (presign flow).
 * Allow-list and size limits per scope per design.
 */

export type MediaScope = "POST_ATTACHMENT" | "PROFILE_AVATAR" | "GENERIC";

const PROFILE_AVATAR_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;
const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const POST_ATTACHMENT_MIMES = [
  ...PROFILE_AVATAR_MIMES,
  "video/mp4",
  "audio/mpeg",
] as const;
const POST_ATTACHMENT_MAX_BYTES = 50 * 1024 * 1024; // 50 MB

const SCOPE_CONFIG: Record<
  MediaScope,
  { mimes: readonly string[]; maxBytes: number }
> = {
  PROFILE_AVATAR: { mimes: [...PROFILE_AVATAR_MIMES], maxBytes: PROFILE_AVATAR_MAX_BYTES },
  POST_ATTACHMENT: { mimes: [...POST_ATTACHMENT_MIMES], maxBytes: POST_ATTACHMENT_MAX_BYTES },
  GENERIC: { mimes: [...POST_ATTACHMENT_MIMES], maxBytes: POST_ATTACHMENT_MAX_BYTES },
};

export interface ValidationProblem {
  title: string;
  status: number;
  detail?: string;
}

/**
 * Validate presign request: contentType in allow-list for scope, size within scope limit.
 * Size is required so the server can enforce limits.
 */
export function validatePresignRequest(
  scope: MediaScope,
  contentType: string,
  size: number | undefined
): { ok: true } | { ok: false; problem: ValidationProblem } {
  if (size == null || typeof size !== "number" || size < 0) {
    return {
      ok: false,
      problem: {
        title: "Bad Request",
        status: 400,
        detail: "size is required and must be a non-negative integer",
      },
    };
  }

  const config = SCOPE_CONFIG[scope];
  if (!config) {
    return {
      ok: false,
      problem: {
        title: "Bad Request",
        status: 400,
        detail: "Invalid scope",
      },
    };
  }

  const normalizedType = contentType.trim().toLowerCase();
  if (!config.mimes.includes(normalizedType)) {
    return {
      ok: false,
      problem: {
        title: "Bad Request",
        status: 400,
        detail: `Content type ${contentType} is not allowed for scope ${scope}. Allowed: ${config.mimes.join(", ")}`,
      },
    };
  }

  if (size > config.maxBytes) {
    return {
      ok: false,
      problem: {
        title: "Bad Request",
        status: 400,
        detail: `Size exceeds maximum for scope ${scope} (${config.maxBytes} bytes)`,
      },
    };
  }

  return { ok: true };
}

/** Sanitize filename: strip path, keep safe chars, limit length */
function sanitizeFilename(filename: string): string {
  const basename = filename.replace(/^.*[/\\]/, "").trim() || "file";
  const safe = basename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const maxLen = 200;
  const ext = safe.includes(".") ? safe.slice(safe.lastIndexOf(".")) : "";
  const name = safe.slice(0, safe.length - ext.length) || "file";
  const truncated = name.length > maxLen - ext.length ? name.slice(0, maxLen - ext.length) : name;
  return truncated + ext;
}

/**
 * Build object key: media/{userId}/{assetId}/{sanitizedFilename}
 */
export function buildMediaKey(userId: string, assetId: string, filename: string): string {
  const safe = sanitizeFilename(filename);
  return `media/${userId}/${assetId}/${safe}`;
}
