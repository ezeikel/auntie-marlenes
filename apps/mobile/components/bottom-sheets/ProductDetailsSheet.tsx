import {
  BottomSheetModal,
  type BottomSheetModalProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHTML, { type MixedStyleRecord } from 'react-native-render-html';
import BottomSheetHeader from '@/components/ui/BottomSheetHeader';

type ProductDetailsSheetProps = Omit<
  BottomSheetModalProps,
  'children' | 'snapPoints'
> & {
  description: string;
};

const ProductDetailsSheet = forwardRef<
  BottomSheetModal,
  ProductDetailsSheetProps
>(({ description, ...props }, ref) => {
  const { width } = useWindowDimensions();
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  const htmlSource = {
    html: description || '<p>No description available</p>',
  };

  const tagsStyles: MixedStyleRecord = {
    body: {
      fontFamily: 'Inter18pt-Regular',
      fontSize: 15,
      lineHeight: 24,
      color: '#171717',
    },
    p: {
      marginBottom: 12,
    },
    h1: {
      fontFamily: 'PlayfairDisplay-Bold',
      fontSize: 24,
      lineHeight: 32,
      marginBottom: 16,
      color: '#5D4037',
    },
    h2: {
      fontFamily: 'PlayfairDisplay-Bold',
      fontSize: 20,
      lineHeight: 28,
      marginBottom: 12,
      color: '#5D4037',
    },
    h3: {
      fontFamily: 'Inter18pt-SemiBold',
      fontSize: 18,
      lineHeight: 24,
      marginBottom: 8,
      color: '#171717',
    },
    ul: {
      marginBottom: 12,
    },
    ol: {
      marginBottom: 12,
    },
    li: {
      marginBottom: 8,
    },
    strong: {
      fontFamily: 'Inter18pt-Bold',
    },
    em: {
      fontFamily: 'Inter18pt-Italic',
    },
    a: {
      color: '#C5705D',
      textDecorationLine: 'underline',
    },
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      {...props}
    >
      <BottomSheetHeader title="Product Details" />

      <BottomSheetScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
      >
        <RenderHTML
          contentWidth={width - 48} // Account for 24px padding on each side
          source={htmlSource}
          tagsStyles={tagsStyles}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

ProductDetailsSheet.displayName = 'ProductDetailsSheet';

export default ProductDetailsSheet;
