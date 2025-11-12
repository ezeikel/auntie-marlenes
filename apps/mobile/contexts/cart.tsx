import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ShopifyCart } from "@auntie-marlenes/types";
import * as cartApi from "../lib/api/cart";
import * as cartStorage from "../lib/asyncStorage/cart";
import { useAuthContext } from "./auth";
import { toast } from "sonner-native";

type CartContextType = {
  cart: ShopifyCart | null;
  cartId: string | null;
  isLoading: boolean;
  totalQuantity: number;
  addToCart: (
    productVariantId: string,
    quantity?: number,
  ) => Promise<ShopifyCart | null>;
  removeFromCart: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartId, setCartId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthContext();

  // Load cartId from AsyncStorage on mount
  useEffect(() => {
    const loadCartId = async () => {
      const storedCartId = await cartStorage.getCartId();
      if (storedCartId) {
        setCartId(storedCartId);
      }
    };
    loadCartId();
  }, []);

  // Fetch cart data using React Query
  const {
    data: cart,
    isLoading,
    refetch,
  } = useQuery<ShopifyCart | null>({
    queryKey: ["cart", cartId],
    queryFn: async () => {
      if (!cartId) return null;
      try {
        const cartData = await cartApi.getCart(cartId);
        return cartData;
      } catch (error) {
        console.error("Error fetching cart:", error);
        // If cart doesn't exist, clear the stored cartId
        await cartStorage.removeCartId();
        setCartId(null);
        return null;
      }
    },
    enabled: !!cartId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Calculate total quantity
  const totalQuantity =
    cart?.lines?.edges?.reduce((acc, edge) => acc + edge.node.quantity, 0) || 0;

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({
      productVariantId,
      quantity = 1,
    }: {
      productVariantId: string;
      quantity?: number;
    }) => {
      let currentCartId = cartId;

      // Create cart if it doesn't exist
      if (!currentCartId) {
        const response = await cartApi.createCart(productVariantId);
        const newCart = response?.cart;

        if (!newCart || !newCart.id) {
          throw new Error("Failed to create cart - no cart ID returned");
        }

        currentCartId = newCart.id;
        setCartId(currentCartId);
        await cartStorage.setCartId(currentCartId as string);
        return newCart;
      }

      // Add to existing cart
      const response = await cartApi.addProductToCart(
        currentCartId,
        productVariantId,
      );
      return response?.cart;
    },
    onMutate: async ({ productVariantId, quantity = 1 }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cart", cartId] });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<ShopifyCart | null>([
        "cart",
        cartId,
      ]);

      // Optimistically update cart
      if (previousCart && previousCart.lines?.edges) {
        queryClient.setQueryData<ShopifyCart>(["cart", cartId], {
          ...previousCart,
          lines: {
            edges: [
              ...previousCart.lines.edges,
              // Note: We can't create a perfect optimistic update without product data
              // The actual update will come from the server response
            ],
          },
        });
      }

      return { previousCart };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(["cart", cartId], context.previousCart);
      }
      toast.error("Failed to add item to bag");
      console.error("Add to cart error:", error);
    },
    onSuccess: (data) => {
      // Update cart data with server response
      queryClient.setQueryData(["cart", data?.id], data);
      toast.success("Added to bag");
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (lineId: string) => {
      if (!cartId) throw new Error("No cart ID");
      const response = await cartApi.removeProductFromCart(cartId, lineId);
      return response?.cart;
    },
    onMutate: async (lineId) => {
      await queryClient.cancelQueries({ queryKey: ["cart", cartId] });

      const previousCart = queryClient.getQueryData<ShopifyCart | null>([
        "cart",
        cartId,
      ]);

      // Optimistically remove item
      if (previousCart && previousCart.lines?.edges) {
        queryClient.setQueryData<ShopifyCart>(["cart", cartId], {
          ...previousCart,
          lines: {
            edges: previousCart.lines.edges.filter(
              (edge) => edge.node.id !== lineId,
            ),
          },
        });
      }

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart", cartId], context.previousCart);
      }
      toast.error("Failed to remove item");
      console.error("Remove from cart error:", error);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart", cartId], data);
      toast.success("Removed from bag");
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      lineId,
      quantity,
    }: {
      lineId: string;
      quantity: number;
    }) => {
      if (!cartId) throw new Error("No cart ID");
      const response = await cartApi.updateCartLineQuantity(cartId, lineId, quantity);
      return response?.cart;
    },
    onMutate: async ({ lineId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart", cartId] });

      const previousCart = queryClient.getQueryData<ShopifyCart | null>([
        "cart",
        cartId,
      ]);

      // Optimistically update quantity
      if (previousCart && previousCart.lines?.edges) {
        queryClient.setQueryData<ShopifyCart>(["cart", cartId], {
          ...previousCart,
          lines: {
            edges: previousCart.lines.edges.map((edge) =>
              edge.node.id === lineId
                ? { ...edge, node: { ...edge.node, quantity } }
                : edge,
            ),
          },
        });
      }

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart", cartId], context.previousCart);
      }
      toast.error("Failed to update quantity");
      console.error("Update quantity error:", error);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart", cartId], data);
    },
  });

  // Helper functions
  const addToCart = useCallback(
    async (productVariantId: string, quantity = 1) => {
      try {
        const result = await addToCartMutation.mutateAsync({
          productVariantId,
          quantity,
        });
        return result;
      } catch (error) {
        console.error("Error in addToCart:", error);
        return null;
      }
    },
    [addToCartMutation],
  );

  const removeFromCart = useCallback(
    async (lineId: string) => {
      await removeFromCartMutation.mutateAsync(lineId);
    },
    [removeFromCartMutation],
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      await updateQuantityMutation.mutateAsync({ lineId, quantity });
    },
    [updateQuantityMutation],
  );

  const clearCart = useCallback(async () => {
    await cartStorage.removeCartId();
    setCartId(null);
    queryClient.setQueryData(["cart", cartId], null);
  }, [cartId, queryClient]);

  const refetchCart = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        isLoading,
        totalQuantity,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
