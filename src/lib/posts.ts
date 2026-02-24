import type { PrismaClient } from "@/generated/prisma";
import { MediaAssetStatus } from "@/generated/prisma";
import { getPublicMediaUrl } from "@/lib/s3";

export interface ValidationProblem {
  title: string;
  status: number;
  detail?: string;
}

/**
 * Validate mediaAssetIds for post creation: min 1, each must exist, be READY, and have profileId === activeProfileId.
 * Returns problem detail for 400 response when validation fails.
 */
export async function validateMediaAssetIdsForPost(
  prisma: PrismaClient,
  mediaAssetIds: string[],
  activeProfileId: string
): Promise<{ ok: true } | { ok: false; problem: ValidationProblem }> {
  if (!Array.isArray(mediaAssetIds) || mediaAssetIds.length === 0) {
    return {
      ok: false,
      problem: {
        title: "Bad Request",
        status: 400,
        detail: "mediaAssetIds is required and must contain at least one id",
      },
    };
  }

  const assets = await prisma.mediaAsset.findMany({
    where: { id: { in: mediaAssetIds } },
    select: { id: true, status: true, profileId: true },
  });

  const foundIds = new Set(assets.map((a) => a.id));
  const missing = mediaAssetIds.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    return {
      ok: false,
      problem: {
        title: "Bad Request",
        status: 400,
        detail: `MediaAsset(s) not found: ${missing.join(", ")}`,
      },
    };
  }

  for (const asset of assets) {
    if (asset.status !== MediaAssetStatus.READY) {
      return {
        ok: false,
        problem: {
          title: "Bad Request",
          status: 400,
          detail: `MediaAsset ${asset.id} is not READY`,
        },
      };
    }
    if (asset.profileId !== activeProfileId) {
      return {
        ok: false,
        problem: {
          title: "Bad Request",
          status: 400,
          detail: `MediaAsset ${asset.id} does not belong to the active profile`,
        },
      };
    }
  }

  return { ok: true };
}

export interface PostAuthor {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface PostMediaItem {
  id: string;
  mimeType: string;
  key: string;
  publicUrl: string;
}

export interface PostResponseShape {
  id: string;
  body: string | null;
  createdAt: string;
  author: PostAuthor;
  media: PostMediaItem[];
  likeCount: number;
  saveCount: number;
  commentCount: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
}

type PostWithRelations = {
  id: string;
  body: string | null;
  createdAt: Date;
  authorProfile: { handle: string; displayName: string; avatarUrl: string | null };
  media: Array<{ order: number | null; mediaAsset: { id: string; mimeType: string; key: string } }>;
  _count?: { likes: number; saves: number; comments: number };
};

export interface PostInteractionOverlay {
  likedByMe: boolean;
  savedByMe: boolean;
}

/**
 * Map a post with author and media relations to the API response shape (including publicUrl and interaction counts).
 * Pass _count on the post for counts; pass overlay only when authenticated with active profile for likedByMe/savedByMe.
 */
export function toPostResponseShape(
  post: PostWithRelations,
  overlay?: PostInteractionOverlay
): PostResponseShape {
  const sorted = [...post.media].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const likeCount = post._count?.likes ?? 0;
  const saveCount = post._count?.saves ?? 0;
  const commentCount = post._count?.comments ?? 0;
  return {
    id: post.id,
    body: post.body,
    createdAt: post.createdAt.toISOString(),
    author: {
      handle: post.authorProfile.handle,
      displayName: post.authorProfile.displayName,
      avatarUrl: post.authorProfile.avatarUrl,
    },
    media: sorted.map((pm) => ({
      id: pm.mediaAsset.id,
      mimeType: pm.mediaAsset.mimeType,
      key: pm.mediaAsset.key,
      publicUrl: getPublicMediaUrl(pm.mediaAsset.key),
    })),
    likeCount,
    saveCount,
    commentCount,
    ...(overlay && {
      likedByMe: overlay.likedByMe,
      savedByMe: overlay.savedByMe,
    }),
  };
}
