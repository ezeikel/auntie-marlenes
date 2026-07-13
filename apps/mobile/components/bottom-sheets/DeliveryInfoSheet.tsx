import {
  faRotateLeft,
  faShieldCheck,
  faTruck,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  BottomSheetModal,
  type BottomSheetModalProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useMemo } from 'react';
import { Text, View } from 'react-native';
import BottomSheetHeader from '@/components/ui/BottomSheetHeader';

type DeliveryInfoSheetProps = Omit<
  BottomSheetModalProps,
  'children' | 'snapPoints'
>;

const DeliveryInfoSheet = forwardRef<BottomSheetModal, DeliveryInfoSheetProps>(
  (props, ref) => {
    const snapPoints = useMemo(() => ['50%', '75%'], []);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        {...props}
      >
        <BottomSheetHeader title="Delivery & Returns" />

        <BottomSheetScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        >
          {/* Delivery Information */}
          <View className="mb-6">
            <View className="flex-row items-start mb-3">
              <View className="w-10 h-10 bg-warm-beige rounded-full items-center justify-center mr-3">
                <FontAwesomeIcon icon={faTruck} size={20} color="#5D4037" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-inter-semibold text-foreground mb-1">
                  Free Standard Delivery
                </Text>
                <Text className="text-sm font-inter text-muted-foreground leading-5">
                  On orders over £40. Standard delivery takes 3-5 working days.
                </Text>
              </View>
            </View>

            <View className="ml-13 gap-2">
              <View className="flex-row justify-between py-2">
                <Text className="text-sm font-inter text-foreground">
                  Standard (3-5 days)
                </Text>
                <Text className="text-sm font-inter-semibold text-foreground">
                  £3.95
                </Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-sm font-inter text-foreground">
                  Express (1-2 days)
                </Text>
                <Text className="text-sm font-inter-semibold text-foreground">
                  £5.95
                </Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-sm font-inter text-foreground">
                  Next Day
                </Text>
                <Text className="text-sm font-inter-semibold text-foreground">
                  £7.95
                </Text>
              </View>
            </View>
          </View>

          <View className="h-px bg-border mb-6" />

          {/* Returns Information */}
          <View className="mb-6">
            <View className="flex-row items-start mb-3">
              <View className="w-10 h-10 bg-warm-beige rounded-full items-center justify-center mr-3">
                <FontAwesomeIcon
                  icon={faRotateLeft}
                  size={20}
                  color="#5D4037"
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-inter-semibold text-foreground mb-1">
                  Free Returns
                </Text>
                <Text className="text-sm font-inter text-muted-foreground leading-5">
                  Return within 30 days of delivery for a full refund. Items
                  must be unworn, unwashed, and in original packaging with tags
                  attached.
                </Text>
              </View>
            </View>
          </View>

          <View className="h-px bg-border mb-6" />

          {/* Secure Shopping */}
          <View className="mb-6">
            <View className="flex-row items-start">
              <View className="w-10 h-10 bg-warm-beige rounded-full items-center justify-center mr-3">
                <FontAwesomeIcon
                  icon={faShieldCheck}
                  size={20}
                  color="#5D4037"
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-inter-semibold text-foreground mb-1">
                  Secure Shopping
                </Text>
                <Text className="text-sm font-inter text-muted-foreground leading-5">
                  Your payment information is processed securely. We do not
                  store credit card details.
                </Text>
              </View>
            </View>
          </View>

          <View className="h-px bg-border mb-6" />

          {/* Additional Info */}
          <View className="bg-warm-beige rounded-lg p-4">
            <Text className="text-sm font-inter-semibold text-foreground mb-2">
              Shipped by Auntie Marlene's
            </Text>
            <Text className="text-xs font-inter text-muted-foreground leading-5">
              This item is dispatched from our warehouse. You'll receive
              tracking information once your order ships.
            </Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

DeliveryInfoSheet.displayName = 'DeliveryInfoSheet';

export default DeliveryInfoSheet;
