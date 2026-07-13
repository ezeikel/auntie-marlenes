import {
  BottomSheetModal,
  type BottomSheetModalProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useMemo } from 'react';
import { Text, View } from 'react-native';
import BottomSheetHeader from '@/components/ui/BottomSheetHeader';

type BrandInfoSheetProps = Omit<
  BottomSheetModalProps,
  'children' | 'snapPoints'
> & {
  brand: string;
};

const BrandInfoSheet = forwardRef<BottomSheetModal, BrandInfoSheetProps>(
  ({ brand, ...props }, ref) => {
    const snapPoints = useMemo(() => ['40%', '60%'], []);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        {...props}
      >
        <BottomSheetHeader title={brand} />

        <BottomSheetScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        >
          {/* Brand Information */}
          <View className="mb-6">
            <Text className="text-base font-inter-semibold text-foreground mb-3">
              About {brand}
            </Text>
            <Text className="text-sm font-inter text-muted-foreground leading-6 mb-4">
              This product is sold by {brand}, a trusted brand curated by Auntie
              Marlene's. We work with brands that share our commitment to
              quality, sustainability, and exceptional craftsmanship.
            </Text>
          </View>

          <View className="h-px bg-border mb-6" />

          {/* Seller Information */}
          <View className="mb-6">
            <Text className="text-base font-inter-semibold text-foreground mb-3">
              Seller Information
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between py-2">
                <Text className="text-sm font-inter text-muted-foreground">
                  Sold by
                </Text>
                <Text className="text-sm font-inter-semibold text-foreground">
                  {brand}
                </Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-sm font-inter text-muted-foreground">
                  Shipped by
                </Text>
                <Text className="text-sm font-inter-semibold text-foreground">
                  Auntie Marlene's
                </Text>
              </View>
            </View>
          </View>

          <View className="h-px bg-border mb-6" />

          {/* Additional Info */}
          <View className="bg-warm-beige rounded-lg p-4">
            <Text className="text-xs font-inter text-muted-foreground leading-5">
              All products are carefully selected and verified by Auntie
              Marlene's to ensure they meet our high standards for quality and
              authenticity.
            </Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

BrandInfoSheet.displayName = 'BrandInfoSheet';

export default BrandInfoSheet;
