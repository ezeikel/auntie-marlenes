import {
  Button,
  Column,
  Hr,
  Img,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout, { colors, siteUrl } from './components/layout';

interface LineItem {
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  lineItems: LineItem[];
  subtotal: string;
  shipping: string;
  total: string;
  currency: string;
  shippingAddress?: {
    address1?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  };
  orderStatusUrl?: string;
}

export default function OrderConfirmationEmail({
  orderNumber = '#1001',
  customerName = 'Customer',
  lineItems = [],
  subtotal = '0.00',
  shipping = '0.00',
  total = '0.00',
  currency = 'GBP',
  shippingAddress,
  orderStatusUrl,
}: OrderConfirmationEmailProps) {
  const currencySymbol =
    currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';

  return (
    <EmailLayout
      preview={`Order ${orderNumber} confirmed — thank you for your order!`}
    >
      <Text style={heading}>Order Confirmed</Text>
      <Text style={subtext}>
        Hi {customerName}, thank you for your order! We're getting it ready for
        you.
      </Text>

      <Section style={orderBox}>
        <Text style={orderNumberStyle}>Order {orderNumber}</Text>

        {lineItems.map((item, i) => (
          <React.Fragment key={i}>
            <Row style={itemRow}>
              <Column style={imageCol}>
                {item.image ? (
                  <Img
                    src={item.image}
                    width="64"
                    height="64"
                    alt={item.title}
                    style={itemImage}
                  />
                ) : (
                  <div style={imagePlaceholder} />
                )}
              </Column>
              <Column style={detailCol}>
                <Text style={itemTitle}>{item.title}</Text>
                <Text style={itemMeta}>
                  Qty: {item.quantity} &middot; {currencySymbol}
                  {item.price.toFixed(2)}
                </Text>
              </Column>
            </Row>
            {i < lineItems.length - 1 && <Hr style={itemDivider} />}
          </React.Fragment>
        ))}

        <Hr style={totalDivider} />
        <Row>
          <Column>
            <Text style={summaryLabel}>Subtotal</Text>
          </Column>
          <Column>
            <Text style={summaryValue}>
              {currencySymbol}
              {subtotal}
            </Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={summaryLabel}>Shipping</Text>
          </Column>
          <Column>
            <Text style={summaryValue}>
              {parseFloat(shipping) === 0
                ? 'Free'
                : `${currencySymbol}${shipping}`}
            </Text>
          </Column>
        </Row>
        <Hr style={itemDivider} />
        <Row>
          <Column>
            <Text style={totalLabel}>Total</Text>
          </Column>
          <Column>
            <Text style={totalValue}>
              {currencySymbol}
              {total}
            </Text>
          </Column>
        </Row>
      </Section>

      {shippingAddress && (
        <Section style={addressSection}>
          <Text style={addressHeading}>Shipping to</Text>
          <Text style={addressText}>
            {[
              shippingAddress.address1,
              shippingAddress.city,
              shippingAddress.province,
              shippingAddress.zip,
              shippingAddress.country,
            ]
              .filter(Boolean)
              .join(', ')}
          </Text>
        </Section>
      )}

      {orderStatusUrl && (
        <Section style={ctaSection}>
          <Button href={orderStatusUrl} style={ctaButton}>
            Track Your Order
          </Button>
        </Section>
      )}

      <Text style={helpText}>
        Questions about your order?{' '}
        <Link href={`${siteUrl}/contact`} style={helpLink}>
          Get in touch
        </Link>{' '}
        — we're happy to help.
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

const orderBox: React.CSSProperties = {
  backgroundColor: '#FAFAFA',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const orderNumberStyle: React.CSSProperties = {
  fontSize: '13px',
  color: colors.gray,
  fontWeight: 600,
  margin: '0 0 16px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const itemRow: React.CSSProperties = {
  marginBottom: '12px',
};

const imageCol: React.CSSProperties = {
  width: '64px',
  verticalAlign: 'top' as const,
};

const itemImage: React.CSSProperties = {
  borderRadius: '6px',
  objectFit: 'cover' as const,
};

const imagePlaceholder: React.CSSProperties = {
  width: '64px',
  height: '64px',
  backgroundColor: '#E5E7EB',
  borderRadius: '6px',
};

const detailCol: React.CSSProperties = {
  paddingLeft: '12px',
  verticalAlign: 'top' as const,
};

const itemTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: colors.cocoa,
  margin: '0 0 4px',
};

const itemMeta: React.CSSProperties = {
  fontSize: '13px',
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

const summaryLabel: React.CSSProperties = {
  fontSize: '13px',
  color: colors.gray,
  margin: '4px 0',
};

const summaryValue: React.CSSProperties = {
  fontSize: '13px',
  color: colors.cocoa,
  margin: '4px 0',
  textAlign: 'right' as const,
};

const totalLabel: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: colors.cocoa,
  margin: '4px 0',
};

const totalValue: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: colors.cocoa,
  margin: '4px 0',
  textAlign: 'right' as const,
};

const addressSection: React.CSSProperties = {
  marginBottom: '24px',
};

const addressHeading: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: colors.cocoa,
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const addressText: React.CSSProperties = {
  fontSize: '14px',
  color: '#4B5563',
  margin: 0,
  lineHeight: '20px',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: colors.sageGreen,
  color: colors.white,
  fontSize: '14px',
  fontWeight: 700,
  padding: '12px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
};

const helpText: React.CSSProperties = {
  fontSize: '13px',
  color: colors.gray,
  textAlign: 'center' as const,
  margin: '16px 0 0',
};

const helpLink: React.CSSProperties = {
  color: colors.sageGreen,
  textDecoration: 'underline',
};
