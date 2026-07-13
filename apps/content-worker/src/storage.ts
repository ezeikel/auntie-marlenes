/**
 * R2 Storage for generated content.
 * Same pattern as PTP worker.
 */

import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2Client) {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'R2 configuration missing. Required: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL',
      );
    }

    r2Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return r2Client;
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error('R2_BUCKET is required');
  return bucket;
}

function getPublicUrl(): string {
  const url = process.env.R2_PUBLIC_URL;
  if (!url) throw new Error('R2_PUBLIC_URL is required');
  return url.replace(/\/$/, '');
}

export interface UploadResult {
  url: string;
  pathname: string;
}

/**
 * Upload a file to R2.
 */
export async function uploadFile(
  pathname: string,
  body: Buffer,
  contentType: string,
): Promise<UploadResult> {
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: pathname,
      Body: body,
      ContentType: contentType,
    }),
  );

  const url = `${getPublicUrl()}/${pathname}`;
  console.log(`[R2] Uploaded: ${url}`);

  return { url, pathname };
}

/**
 * Upload a product post image.
 */
export async function uploadProductPost(
  handle: string,
  image: Buffer,
): Promise<UploadResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const pathname = `content/products/${handle}/post-${timestamp}.jpg`;
  return uploadFile(pathname, image, 'image/jpeg');
}

/**
 * Upload a product reel video.
 */
export async function uploadProductReel(
  handle: string,
  video: Buffer,
): Promise<UploadResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const pathname = `content/products/${handle}/reel-${timestamp}.mp4`;
  return uploadFile(pathname, video, 'video/mp4');
}

/**
 * List all generated content.
 */
export async function listContent(
  prefix = 'content/products/',
): Promise<string[]> {
  const client = getR2Client();

  const result = await client.send(
    new ListObjectsV2Command({
      Bucket: getBucket(),
      Prefix: prefix,
    }),
  );

  return (result.Contents || [])
    .map((obj) => {
      const key = obj.Key || '';
      return `${getPublicUrl()}/${key}`;
    })
    .filter(Boolean);
}
