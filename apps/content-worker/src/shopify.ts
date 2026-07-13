/**
 * Fetch products from Shopify Storefront API for content generation.
 */

export interface ShopifyProduct {
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  descriptionHtml: string;
  images: { edges: Array<{ node: { url: string } }> };
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          handle
          title
          vendor
          productType
          descriptionHtml
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    productByHandle(handle: $handle) {
      handle
      title
      vendor
      productType
      descriptionHtml
      images(first: 3) {
        edges {
          node {
            url
          }
        }
      }
    }
  }
`;

async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const endpoint = process.env.SHOPIFY_STOREFRONT_API_ENDPOINT;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!endpoint || !token) {
    throw new Error(
      'Missing SHOPIFY_STOREFRONT_API_ENDPOINT or SHOPIFY_STOREFRONT_ACCESS_TOKEN',
    );
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}

/**
 * Fetch all products.
 */
export async function getAllProducts(): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{
    products: { edges: Array<{ node: ShopifyProduct }> };
  }>(PRODUCTS_QUERY, { first: 100 });

  return data.products.edges.map((e) => e.node);
}

/**
 * Fetch a single product by handle.
 */
export async function getProductByHandle(
  handle: string,
): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{
    productByHandle: ShopifyProduct | null;
  }>(PRODUCT_BY_HANDLE_QUERY, { handle });

  return data.productByHandle;
}
