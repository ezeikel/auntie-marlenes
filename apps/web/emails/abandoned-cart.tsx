import {
  Button,
  Column,
  Hr,
  Img,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout, { colors } from './components/layout';

interface LineItem {
  title: string;
  price: number;
  image?: string;
  quantity: number;
}

interface AbandonedCartEmailProps {
  customerName?: string;
  lineItems: LineItem[];
  totalPrice: string;
  currency: string;
  checkoutUrl: string;
}

export default function AbandonedCartEmail({
  customerName,
  lineItems = [],
  totalPrice = '0.00',
  currency = 'GBP',
  checkoutUrl = '#',
}: AbandonedCartEmailProps) {
  const currencySymbol =
    currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
  const greeting = customerName ? `Hi ${customerName},` : 'Hi there,';

  return (
    <EmailLayout preview="You left something beautiful behind — your items are still waiting for you.">
      <Text style={heading}>You Left Something Behind</Text>
      <Text style={subtext}>
        {greeting} we noticed you didn't finish your order. Your items are still
        in your bag — ready whenever you are.
      </Text>

      <Section style={itemsBox}>
        {lineItems.map((item, i) => (
          <React.Fragment key={i}>
            <Row style={itemRow}>
              <Column style={imageCol}>
                {item.image ? (
                  <Img
                    src={item.image}
                    width="80"
                    height="80"
                    alt={item.title}
                    style={itemImage}
                  />
                ) : (
                  <div style={imagePlaceholder} />
                )}
              </Column>
              <Column style={detailCol}>
                <Text style={itemTitle}>{item.title}</Text>
                <Text style={itemPrice}>
                  {currencySymbol}
                  {item.price.toFixed(2)}
                  {item.quantity > 1 ? ` x ${item.quantity}` : ''}
                </Text>
              </Column>
            </Row>
            {i < lineItems.length - 1 && <Hr style={itemDivider} />}
          </React.Fragment>
        ))}

        <Hr style={totalDivider} />
        <Text style={totalText}>
          Total: {currencySymbol}
          {totalPrice}
        </Text>
      </Section>

      <Section style={ctaSection}>
        <Button href={checkoutUrl} style={ctaButton}>
          Complete Your Order
        </Button>
      </Section>

      <Text style={reassurance}>
        Your bag is saved for a limited time. If you have any questions about
        our products, we're here to help.
      </Text>
    </EmailLayout>
  );
}

const heading: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  color: colors.cocoa,
  margin: '0 0 8px',
  fontFamily: '"Playfair Display", Georgia, serif',
};

const subtext: React.CSSProperties = {
  fontSize: '15px',
  color: '#4B5563',
  margin: '0 0 24px',
  lineHeight: '24px',
};

const itemsBox: React.CSSProperties = {
  backgroundColor: '#FAFAFA',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const itemRow: React.CSSProperties = {
  marginBottom: '12px',
};

const imageCol: React.CSSProperties = {
  width: '80px',
  verticalAlign: 'top' as const,
};

const itemImage: React.CSSProperties = {
  borderRadius: '6px',
  objectFit: 'cover' as const,
};

const imagePlaceholder: React.CSSProperties = {
  width: '80px',
  height: '80px',
  backgroundColor: '#E5E7EB',
  borderRadius: '6px',
};

const detailCol: React.CSSProperties = {
  paddingLeft: '16px',
  verticalAlign: 'middle' as const,
};

const itemTitle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: colors.cocoa,
  margin: '0 0 4px',
};

const itemPrice: React.CSSProperties = {
  fontSize: '14px',
  color: colors.gray,
  margin: 0,
};

const itemDivider: React.CSSProperties = {
  borderColor: '#E5E7EB',
  margin: '12px 0',
};

const totalDivider: React.CSSProperties = {
  borderColor: '#D1D5DB',
  margin: '16px 0 12px',
};

const totalText: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: colors.cocoa,
  margin: 0,
  textAlign: 'right' as const,
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: colors.terracotta,
  color: '#FFFFFF',
  fontSize: '15px',
  fontWeight: 700,
  padding: '14px 40px',
  borderRadius: '6px',
  textDecoration: 'none',
};

const reassurance: React.CSSProperties = {
  fontSize: '13px',
  color: colors.gray,
  textAlign: 'center' as const,
  lineHeight: '20px',
};
