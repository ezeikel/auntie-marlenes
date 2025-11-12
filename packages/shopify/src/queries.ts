/**
 * Shopify Storefront GraphQL Queries
 * These queries work with both web and mobile
 */

export const GET_PRODUCTS_QUERY = `
  query GET_PRODUCTS_QUERY($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          descriptionHtml
          vendor
          productType
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
          metafields(identifiers: [
            { namespace: "custom", key: "rating" }
            { namespace: "custom", key: "review_count" }
          ]) {
            key
            value
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_QUERY = `
  query GET_PRODUCT_QUERY($id: ID!) {
    product(id: $id) {
      id
      handle
      title
      descriptionHtml
      vendor
      productType
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
      metafields(identifiers: [
        { namespace: "custom", key: "rating" }
        { namespace: "custom", key: "review_count" }
      ]) {
        key
        value
      }
    }
  }
`;

export const GET_PRODUCT_BY_HANDLE_QUERY = `
  query GET_PRODUCT_BY_HANDLE_QUERY($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      vendor
      productType
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
      metafields(identifiers: [
        { namespace: "custom", key: "rating" }
        { namespace: "custom", key: "review_count" }
      ]) {
        key
        value
      }
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = `
  query SEARCH_PRODUCTS_QUERY($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          handle
          title
          descriptionHtml
          vendor
          productType
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
          metafields(identifiers: [
            { namespace: "custom", key: "rating" }
            { namespace: "custom", key: "review_count" }
          ]) {
            key
            value
          }
        }
      }
    }
  }
`;

export const GET_CART_QUERY = `
  query GET_CART_QUERY($id: ID!) {
    cart(id: $id) {
      id
      lines(first: 50) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                priceV2 {
                  amount
                  currencyCode
                }
                compareAtPriceV2 {
                  amount
                  currencyCode
                }
                product {
                  id
                  title
                  handle
                  vendor
                  productType
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                }
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
      checkoutUrl
      cost {
        checkoutChargeAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
        subtotalAmountEstimated
        totalAmount {
          amount
          currencyCode
        }
        totalAmountEstimated
      }
      createdAt
    }
  }
`;

export const CREATE_CART_MUTATION = `
  mutation CREATE_CART_MUTATION($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        buyerIdentity {
          email
          countryCode
        }
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                  compareAtPriceV2 {
                    amount
                    currencyCode
                  }
                  product {
                    id
                    title
                    handle
                    vendor
                    productType
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
        cost {
          checkoutChargeAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          subtotalAmountEstimated
          totalAmount {
            amount
            currencyCode
          }
          totalAmountEstimated
        }
      }
    }
  }
`;

export const ADD_PRODUCTS_TO_CART_MUTATION = `
  mutation ADD_PRODUCTS_TO_CART_MUTATION($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                  compareAtPriceV2 {
                    amount
                    currencyCode
                  }
                  product {
                    id
                    title
                    handle
                    vendor
                    productType
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
        cost {
          checkoutChargeAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          subtotalAmountEstimated
          totalAmount {
            amount
            currencyCode
          }
          totalAmountEstimated
        }
      }
    }
  }
`;

export const CART_LINE_REMOVE_MUTATION = `
  mutation CART_LINE_REMOVE_MUTATION($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                  compareAtPriceV2 {
                    amount
                    currencyCode
                  }
                  product {
                    id
                    title
                    handle
                    vendor
                    productType
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
        cost {
          checkoutChargeAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          subtotalAmountEstimated
          totalAmount {
            amount
            currencyCode
          }
          totalAmountEstimated
        }
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation CART_LINES_UPDATE_MUTATION($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                  compareAtPriceV2 {
                    amount
                    currencyCode
                  }
                  product {
                    id
                    title
                    handle
                    vendor
                    productType
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
        cost {
          checkoutChargeAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          subtotalAmountEstimated
          totalAmount {
            amount
            currencyCode
          }
          totalAmountEstimated
        }
      }
    }
  }
`;

export const CART_BUYER_IDENTITY_UPDATE_MUTATION = `
  mutation CART_BUYER_IDENTITY_UPDATE_MUTATION(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
  ) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        buyerIdentity {
          email
          countryCode
        }
      }
    }
  }
`;
