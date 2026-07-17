/**
 * Instagram & Facebook publishing via Meta Graph API.
 * Adapted from PTP's apps/web/app/actions/social.ts.
 * Adds product tagging for Instagram Shopping.
 */

const GRAPH_API = 'https://graph.facebook.com/v20.0';

function getConfig() {
  const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const fbPageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!token) throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is required');

  return { igAccountId, fbPageId, token };
}

// ─── Instagram ───────────────────────────────────────────────────────────────

interface ProductTag {
  product_id: string;
  x: number;
  y: number;
}

/**
 * Create an Instagram image post media container.
 */
export async function createInstagramMediaContainer(
  imageUrl: string,
  caption: string,
  productTags?: ProductTag[],
): Promise<string> {
  const { igAccountId, token } = getConfig();
  if (!igAccountId) throw new Error('INSTAGRAM_ACCOUNT_ID is required');

  const payload: Record<string, unknown> = {
    image_url: imageUrl,
    caption,
    access_token: token,
  };

  if (productTags?.length) {
    payload.product_tags = productTags;
  }

  const res = await fetch(`${GRAPH_API}/${igAccountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!data.id) {
    throw new Error(
      `Failed to create IG media container: ${JSON.stringify(data)}`,
    );
  }

  return data.id;
}

/**
 * Create an Instagram Reel media container.
 */
export async function createInstagramReelContainer(
  videoUrl: string,
  caption: string,
  coverUrl?: string,
  productTags?: ProductTag[],
): Promise<string> {
  const { igAccountId, token } = getConfig();
  if (!igAccountId) throw new Error('INSTAGRAM_ACCOUNT_ID is required');

  const payload: Record<string, unknown> = {
    video_url: videoUrl,
    caption,
    media_type: 'REELS',
    share_to_feed: true,
    access_token: token,
  };

  if (coverUrl) payload.cover_url = coverUrl;
  // Reels don't support x/y positions — only product_id
  if (productTags?.length) {
    payload.product_tags = productTags.map(({ product_id }) => ({
      product_id,
    }));
  }

  const res = await fetch(`${GRAPH_API}/${igAccountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!data.id) {
    throw new Error(
      `Failed to create IG Reel container: ${JSON.stringify(data)}`,
    );
  }

  return data.id;
}

/**
 * Check Instagram media container processing status.
 */
export async function checkInstagramMediaStatus(
  creationId: string,
): Promise<{ status: string; error?: string }> {
  const { token } = getConfig();

  const res = await fetch(
    `${GRAPH_API}/${creationId}?fields=status_code,status&access_token=${token}`,
  );
  const data = await res.json();

  return {
    status: data.status_code || 'UNKNOWN',
    error: data.status,
  };
}

/**
 * Wait for Instagram media container to be ready.
 * Polls every 2 seconds for up to 60 seconds.
 */
export async function waitForInstagramMediaReady(
  creationId: string,
): Promise<void> {
  const maxAttempts = 30;
  const delayMs = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const { status, error } = await checkInstagramMediaStatus(creationId);

    if (status === 'FINISHED') return;

    if (status === 'ERROR') {
      throw new Error(`IG media processing failed: ${error}`);
    }

    console.log(
      `[Social] Waiting for IG media... (${i + 1}/${maxAttempts}, status: ${status})`,
    );

    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error('IG media processing timed out');
}

/**
 * Publish an Instagram media container.
 * Retries up to 3 times on transient errors (code 2).
 */
export async function publishInstagramMedia(
  creationId: string,
): Promise<string> {
  const { igAccountId, token } = getConfig();
  if (!igAccountId) throw new Error('INSTAGRAM_ACCOUNT_ID is required');

  await waitForInstagramMediaReady(creationId);

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(`${GRAPH_API}/${igAccountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: token,
      }),
    });

    const data = await res.json();

    if (data.id) return data.id;

    const isTransient = data.error?.is_transient || data.error?.code === 2;
    if (isTransient && attempt < maxRetries) {
      const delay = attempt * 5000;
      console.warn(
        `[Social] IG publish transient error (attempt ${attempt}/${maxRetries}), retrying in ${delay / 1000}s...`,
      );
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    throw new Error(`Failed to publish IG media: ${JSON.stringify(data)}`);
  }

  throw new Error('IG publish: exhausted retries');
}

// ─── Facebook ────────────────────────────────────────────────────────────────

/**
 * Post an image to Facebook Page.
 */
export async function postToFacebookPage(
  message: string,
  imageUrl: string,
): Promise<string> {
  const { fbPageId, token } = getConfig();
  if (!fbPageId) throw new Error('FACEBOOK_PAGE_ID is required');

  const res = await fetch(`${GRAPH_API}/${fbPageId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: imageUrl,
      message,
      access_token: token,
    }),
  });

  const data = await res.json();
  if (!data.id) {
    throw new Error(`Failed to post to FB: ${JSON.stringify(data)}`);
  }

  return data.id;
}

/**
 * Post a video to Facebook Page.
 */
export async function postVideoToFacebookPage(
  videoUrl: string,
  description: string,
  title: string,
): Promise<string> {
  const { fbPageId, token } = getConfig();
  if (!fbPageId) throw new Error('FACEBOOK_PAGE_ID is required');

  // Note: the `thumb` parameter requires multipart file upload, not a URL.
  // FB auto-extracts a thumbnail from the video, which works well enough.
  const res = await fetch(`${GRAPH_API}/${fbPageId}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_url: videoUrl,
      description,
      title,
      access_token: token,
    }),
  });

  const data = await res.json();
  if (!data.id) {
    throw new Error(`Failed to post video to FB: ${JSON.stringify(data)}`);
  }

  return data.id;
}

// ─── Combined Publishing ─────────────────────────────────────────────────────

export interface PublishResult {
  platform: string;
  type: string;
  success: boolean;
  mediaId?: string;
  error?: string;
}

/**
 * Publish content to Instagram (image post + optional reel).
 */
export async function publishToInstagram(options: {
  imageUrl?: string;
  videoUrl?: string;
  postCaption: string;
  reelCaption: string;
  productTags?: ProductTag[];
}): Promise<PublishResult[]> {
  const results: PublishResult[] = [];

  // Image post
  if (options.imageUrl) {
    try {
      console.log('[Social] Publishing IG image post...');
      const containerId = await createInstagramMediaContainer(
        options.imageUrl,
        options.postCaption,
        options.productTags,
      );
      const mediaId = await publishInstagramMedia(containerId);
      results.push({
        platform: 'instagram',
        type: 'post',
        success: true,
        mediaId,
      });
      console.log(`[Social] IG post published: ${mediaId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Social] IG post failed:', msg);
      results.push({
        platform: 'instagram',
        type: 'post',
        success: false,
        error: msg,
      });
    }
  }

  // Reel
  if (options.videoUrl) {
    try {
      console.log('[Social] Publishing IG reel...');
      const containerId = await createInstagramReelContainer(
        options.videoUrl,
        options.reelCaption,
        options.imageUrl,
        options.productTags,
      );
      const mediaId = await publishInstagramMedia(containerId);
      results.push({
        platform: 'instagram',
        type: 'reel',
        success: true,
        mediaId,
      });
      console.log(`[Social] IG reel published: ${mediaId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Social] IG reel failed:', msg);
      results.push({
        platform: 'instagram',
        type: 'reel',
        success: false,
        error: msg,
      });
    }
  }

  return results;
}

/**
 * Publish content to Facebook Page (image + optional video).
 */
export async function publishToFacebook(options: {
  imageUrl?: string;
  videoUrl?: string;
  postCaption: string;
  reelCaption: string;
  productName: string;
}): Promise<PublishResult[]> {
  const results: PublishResult[] = [];

  if (options.imageUrl) {
    try {
      console.log('[Social] Publishing FB image post...');
      const postId = await postToFacebookPage(
        options.postCaption,
        options.imageUrl,
      );
      results.push({
        platform: 'facebook',
        type: 'post',
        success: true,
        mediaId: postId,
      });
      console.log(`[Social] FB post published: ${postId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Social] FB post failed:', msg);
      results.push({
        platform: 'facebook',
        type: 'post',
        success: false,
        error: msg,
      });
    }
  }

  if (options.videoUrl) {
    try {
      console.log('[Social] Publishing FB video...');
      const postId = await postVideoToFacebookPage(
        options.videoUrl,
        options.reelCaption,
        options.productName,
      );
      results.push({
        platform: 'facebook',
        type: 'video',
        success: true,
        mediaId: postId,
      });
      console.log(`[Social] FB video published: ${postId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Social] FB video failed:', msg);
      results.push({
        platform: 'facebook',
        type: 'video',
        success: false,
        error: msg,
      });
    }
  }

  return results;
}
