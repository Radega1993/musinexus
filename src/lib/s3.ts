import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  type HeadObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const globalForS3 = globalThis as unknown as { s3Client: S3Client };

function createS3Client(): S3Client {
  const region = process.env.AWS_REGION ?? process.env.AWS_S3_REGION ?? "us-east-1";
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const credentials =
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined;

  return new S3Client({
    region,
    ...(endpoint && { endpoint }),
    ...(credentials && { credentials }),
  });
}

export function getS3Client(): S3Client {
  if (!globalForS3.s3Client) {
    globalForS3.s3Client = createS3Client();
  }
  return globalForS3.s3Client;
}

export function getBucket(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error("AWS_S3_BUCKET is not set");
  return bucket;
}

/**
 * Build public URL for a media object key (MVP: public bucket or CDN base).
 * Set NEXT_PUBLIC_MEDIA_BASE_URL or MEDIA_PUBLIC_BASE_URL (e.g. https://bucket.region.digitaloceanspaces.com).
 */
export function getPublicMediaUrl(key: string): string {
  const base =
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
    process.env.MEDIA_PUBLIC_BASE_URL ||
    "";
  if (!base) return "";
  const separator = base.endsWith("/") ? "" : "/";
  return `${base}${separator}${encodeURIComponent(key)}`;
}

const DEFAULT_PRESIGN_TTL_SECONDS = 15 * 60; // 15 min

/**
 * Generate a presigned PUT URL for uploading an object to the configured bucket.
 * @param key - Object key in the bucket
 * @param ttlSeconds - URL expiry in seconds (default 15 min)
 * @returns Presigned URL string
 */
export async function getPresignedPutUrl(
  key: string,
  ttlSeconds: number = DEFAULT_PRESIGN_TTL_SECONDS
): Promise<string> {
  const client = getS3Client();
  const bucket = getBucket();
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: ttlSeconds });
}

/**
 * Check if an object exists and return its Content-Length (size).
 * @param key - Object key in the bucket
 * @returns Size in bytes if object exists, null if not found
 */
export async function headObject(key: string): Promise<HeadObjectCommandOutput | null> {
  const client = getS3Client();
  const bucket = getBucket();
  try {
    const response = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key })
    );
    return response;
  } catch {
    return null;
  }
}
