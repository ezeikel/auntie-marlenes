/**
 * Shopify Admin API client for product management.
 * Handles product creation, image upload, and collection assignment.
 */

// ─── GraphQL Client ─────────────────────────────────────────────────────────

function getConfig() {
  const endpoint = process.env.SHOPIFY_ADMIN_API_ENDPOINT;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!endpoint || !token) {
    throw new Error('Missing SHOPIFY_ADMIN_API_ENDPOINT or SHOPIFY_ADMIN_ACCESS_TOKEN');
  }
  return { endpoint, token };
}

async function adminFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const { endpoint, token } = getConfig();

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Admin API error (${res.status}): ${text}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`Shopify Admin GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AdminProduct {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  descriptionHtml: string;
  images: { edges: Array<{ node: { id: string; url: string } }> };
}

export interface CreateProductInput {
  title: string;
  vendor: string;
  productType: string;
  descriptionHtml: string;
  tags: string[];
  status?: 'ACTIVE' | 'DRAFT';
}

// ─── Product Queries ────────────────────────────────────────────────────────

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      vendor
      productType
      descriptionHtml
      images(first: 10) {
        edges {
          node {
            id
            url
          }
        }
      }
    }
  }
`;

export async function getProductByHandle(handle: string): Promise<AdminProduct | null> {
  const data = await adminFetch<{ productByHandle: AdminProduct | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
  );
  return data.productByHandle;
}

const ALL_PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $cursor: String) {
    products(first: $first, after: $cursor) {
      edges {
        node {
          id
          handle
          title
          vendor
          productType
          images(first: 10) {
            edges {
              node {
                id
                url
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export async function getAllProducts(): Promise<AdminProduct[]> {
  const products: AdminProduct[] = [];
  let cursor: string | undefined;

  do {
    const data = await adminFetch<{
      products: {
        edges: Array<{ node: AdminProduct }>;
        pageInfo: { hasNextPage: boolean; endCursor: string };
      };
    }>(ALL_PRODUCTS_QUERY, { first: 50, cursor });

    products.push(...data.products.edges.map((e) => e.node));
    cursor = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : undefined;
  } while (cursor);

  return products;
}

// ─── Product Creation ───────────────────────────────────────────────────────

const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        handle
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createProduct(input: CreateProductInput): Promise<{ id: string; handle: string; title: string }> {
  const data = await adminFetch<{
    productCreate: {
      product: { id: string; handle: string; title: string } | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(CREATE_PRODUCT_MUTATION, {
    input: {
      title: input.title,
      vendor: input.vendor,
      productType: input.productType,
      descriptionHtml: input.descriptionHtml,
      tags: input.tags,
      status: input.status || 'ACTIVE',
    },
  });

  if (data.productCreate.userErrors.length > 0) {
    throw new Error(`Product creation failed: ${JSON.stringify(data.productCreate.userErrors)}`);
  }

  if (!data.productCreate.product) {
    throw new Error('Product creation returned null');
  }

  console.log(`[Shopify] Product created: ${data.productCreate.product.handle}`);
  return data.productCreate.product;
}

// ─── Image Upload ───────────────────────────────────────────────────────────

const STAGED_UPLOADS_MUTATION = `
  mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CREATE_MEDIA_MUTATION = `
  mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        ... on MediaImage {
          id
          image {
            url
          }
        }
      }
      mediaUserErrors {
        field
        message
      }
    }
  }
`;

const DELETE_MEDIA_MUTATION = `
  mutation ProductDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
    productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
      deletedMediaIds
      mediaUserErrors {
        field
        message
      }
    }
  }
`;

/**
 * Upload an image to Shopify via staged upload, then attach to product.
 */
export async function uploadImageToProduct(
  productId: string,
  imageBuffer: Buffer,
  filename: string,
  alt: string,
): Promise<string> {
  // Step 1: Create staged upload target
  const staged = await adminFetch<{
    stagedUploadsCreate: {
      stagedTargets: Array<{
        url: string;
        resourceUrl: string;
        parameters: Array<{ name: string; value: string }>;
      }>;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(STAGED_UPLOADS_MUTATION, {
    input: [
      {
        filename,
        mimeType: 'image/jpeg',
        resource: 'PRODUCT_IMAGE',
        httpMethod: 'POST',
      },
    ],
  });

  if (staged.stagedUploadsCreate.userErrors.length > 0) {
    throw new Error(`Staged upload failed: ${JSON.stringify(staged.stagedUploadsCreate.userErrors)}`);
  }

  const target = staged.stagedUploadsCreate.stagedTargets[0];

  // Step 2: Upload file to staged URL
  const formData = new FormData();
  for (const param of target.parameters) {
    formData.append(param.name, param.value);
  }
  formData.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), filename);

  const uploadRes = await fetch(target.url, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error(`Staged upload POST failed: ${uploadRes.status}`);
  }

  // Step 3: Attach to product
  const media = await adminFetch<{
    productCreateMedia: {
      media: Array<{ id: string; image?: { url: string } }>;
      mediaUserErrors: Array<{ field: string; message: string }>;
    };
  }>(CREATE_MEDIA_MUTATION, {
    productId,
    media: [
      {
        originalSource: target.resourceUrl,
        alt,
        mediaContentType: 'IMAGE',
      },
    ],
  });

  if (media.productCreateMedia.mediaUserErrors.length > 0) {
    throw new Error(`Media creation failed: ${JSON.stringify(media.productCreateMedia.mediaUserErrors)}`);
  }

  const mediaId = media.productCreateMedia.media[0]?.id;
  console.log(`[Shopify] Image uploaded: ${filename} → ${mediaId}`);
  return mediaId;
}

/**
 * Delete all existing images from a product.
 */
export async function deleteProductImages(productId: string, mediaIds: string[]): Promise<void> {
  if (mediaIds.length === 0) return;

  const data = await adminFetch<{
    productDeleteMedia: {
      deletedMediaIds: string[];
      mediaUserErrors: Array<{ field: string; message: string }>;
    };
  }>(DELETE_MEDIA_MUTATION, { productId, mediaIds });

  if (data.productDeleteMedia.mediaUserErrors.length > 0) {
    console.warn(`[Shopify] Some images failed to delete: ${JSON.stringify(data.productDeleteMedia.mediaUserErrors)}`);
  }

  console.log(`[Shopify] Deleted ${data.productDeleteMedia.deletedMediaIds.length} images`);
}

/**
 * Replace all product images with new ones.
 */
export async function replaceProductImages(
  productId: string,
  existingMediaIds: string[],
  images: Array<{ buffer: Buffer; filename: string; alt: string }>,
): Promise<void> {
  // Delete existing images
  await deleteProductImages(productId, existingMediaIds);

  // Upload new images in order
  for (const img of images) {
    await uploadImageToProduct(productId, img.buffer, img.filename, img.alt);
    // Small delay to preserve ordering
    await new Promise((r) => setTimeout(r, 500));
  }
}

// ─── Collection Assignment ──────────────────────────────────────────────────

const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

const COLLECTION_ADD_PRODUCTS_MUTATION = `
  mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
    collectionAddProducts(id: $id, productIds: $productIds) {
      collection {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Add a product to collections matching its category.
 */
export async function assignToCollections(productId: string, category: string): Promise<void> {
  const data = await adminFetch<{
    collections: { edges: Array<{ node: { id: string; title: string; handle: string } }> };
  }>(COLLECTIONS_QUERY, { first: 50 });

  const collections = data.collections.edges.map((e) => e.node);

  // Find matching collection by category name
  const categoryLower = category.toLowerCase();
  const match = collections.find(
    (c) =>
      c.handle.toLowerCase().includes(categoryLower.replace(/\s+/g, '-')) ||
      c.title.toLowerCase().includes(categoryLower),
  );

  if (match) {
    await adminFetch(COLLECTION_ADD_PRODUCTS_MUTATION, {
      id: match.id,
      productIds: [productId],
    });
    console.log(`[Shopify] Added to collection: ${match.title}`);
  } else {
    console.warn(`[Shopify] No collection found matching category: ${category}`);
  }
}

// ─── Publish to Online Store ────────────────────────────────────────────────

const PUBLISH_MUTATION = `
  mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        ... on Product {
          id
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PUBLICATIONS_QUERY = `
  query GetPublications {
    publications(first: 10) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

/**
 * Publish product to the Online Store sales channel.
 */
export async function publishToOnlineStore(productId: string): Promise<void> {
  const pubData = await adminFetch<{
    publications: { edges: Array<{ node: { id: string; name: string } }> };
  }>(PUBLICATIONS_QUERY);

  const onlineStore = pubData.publications.edges.find(
    (e) => e.node.name === 'Online Store',
  );

  if (!onlineStore) {
    console.warn('[Shopify] Online Store publication not found');
    return;
  }

  await adminFetch(PUBLISH_MUTATION, {
    id: productId,
    input: [{ publicationId: onlineStore.node.id }],
  });

  console.log('[Shopify] Published to Online Store');
}
