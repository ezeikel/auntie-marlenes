import gql from 'graphql-tag';

export const GET_CART_QUERY = gql`
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

export const CREATE_CART_MUTATION = gql`
  mutation CREATE_CART_MUTATION($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        buyerIdentity {
          email
          countryCode
        }
        lines(first: 5) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    id
                    title
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export const ADD_PRODUCTS_TO_CART_MUTATION = gql`
  mutation ADD_PRODUCTS_TO_CART_MUTATION(
    $cartId: ID!
    $lines: [CartLineInput!]!
  ) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 5) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINE_REMOVE_MUTATION = gql`
  mutation CART_LINE_REMOVE_MUTATION($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        lines(first: 10) {
          edges {
            node {
              id
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = gql`
  mutation CART_LINES_UPDATE_MUTATION(
    $cartId: ID!
    $lines: [CartLineUpdateInput!]!
  ) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 50) {
          edges {
            node {
              id
              quantity
            }
          }
        }
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_BUYER_IDENTITY_UPDATE_MUTATION = gql`
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
      userErrors {
        field
        message
      }
    }
  }
`;

export const GET_PRODUCT_QUERY = gql`
  query GET_PRODUCT_QUERY($id: ID!) {
    product(id: $id) {
      id
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
      variants(first: 100) {
        edges {
          node {
            id
            title
            price {
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
      metafields(
        identifiers: [
          { namespace: "custom", key: "rating" }
          { namespace: "custom", key: "review_count" }
        ]
      ) {
        key
        value
      }
    }
  }
`;

export const GET_PRODUCTS_QUERY = gql`
  query GET_PRODUCTS_QUERY(
    $first: Int = 20
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(
      first: $first
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        node {
          id
          title
          descriptionHtml
          vendor
          productType
          images(first: 5) {
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
          options {
            name
            values
          }
          metafields(
            identifiers: [
              { namespace: "custom", key: "rating" }
              { namespace: "custom", key: "review_count" }
            ]
          ) {
            key
            value
          }
        }
      }
    }
  }
`;
