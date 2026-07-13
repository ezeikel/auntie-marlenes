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
  quantity: number;
  image?: string;
}

interface ShippingUpdateEmailProps {
  orderNumber: string;
  customerName: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  lineItems: LineItem[];
}

export default function ShippingUpdateEmail({
  orderNumber = '#1001',
  customerName = 'Customer',
  trackingNumber,
  trackingUrl,
  carrier,
  lineItems = [],
}: ShippingUpdateEmailProps) {
  return (
    <EmailLayout preview={`Your order ${orderNumber} is on its way!`}>
      <Text style={heading}>Your Order Is On Its Way!</Text>
      <Text style={subtext}>
        Hi {customerName}, great news — your order {orderNumber} has been
        shipped and is heading your way.
      </Text>

      {(trackingNumber || carrier) && (
        <Section style={trackingBox}>
          {carrier && (
            <Row>
              <Column>
                <Text style={trackingLabel}>Carrier</Text>
              </Column>
              <Column>
                <Text style={trackingValue}>{carrier}</Text>
              </Column>
            </Row>
          )}
          {trackingNumber && (
            <Row>
              <Column>
                <Text style={trackingLabel}>Tracking Number</Text>
              </Column>
              <Column>
                <Text style={trackingValue}>{trackingNumber}</Text>
              </Column>
            </Row>
          )}
        </Section>
      )}

      {trackingUrl && (
        <Section style={ctaSection}>
          <Button href={trackingUrl} style={ctaButton}>
            Track Your Package
          </Button>
        </Section>
      )}

      {lineItems.length > 0 && (
        <Section style={itemsSection}>
          <Text style={itemsHeading}>What's in your package</Text>
          {lineItems.map((item, i) => (
            <React.Fragment key={i}>
              <Row style={itemRow}>
                <Column style={imageCol}>
                  {item.image ? (
                    <Img
                      src={item.image}
                      width="48"
                      height="48"
                      alt={item.title}
                      style={itemImage}
                    />
                  ) : (
                    <div style={imagePlaceholder} />
                  )}
                </Column>
                <Column style={detailCol}>
                  <Text style={itemTitle}>
                    {item.title}
                    {item.quantity > 1 ? ` (x${item.quantity})` : ''}
                  </Text>
                </Column>
              </Row>
              {i < lineItems.length - 1 && <Hr style={itemDivider} />}
            </React.Fragment>
          ))}
        </Section>
      )}

      <Text style={note}>
        Delivery times may vary. If you have any questions about your shipment,
        don't hesitate to reach out.
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

const trackingBox: React.CSSProperties = {
  backgroundColor: '#FAFAFA',
  borderRadius: '8px',
  padding: '16px 20px',
  marginBottom: '24px',
};

const trackingLabel: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: colors.gray,
  margin: '4px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const trackingValue: React.CSSProperties = {
  fontSize: '14px',
  color: colors.cocoa,
  fontWeight: 600,
  margin: '4px 0',
  textAlign: 'right' as const,
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: colors.sageGreen,
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 700,
  padding: '12px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
};

const itemsSection: React.CSSProperties = {
  marginBottom: '24px',
};

const itemsHeading: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: colors.cocoa,
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const itemRow: React.CSSProperties = {
  marginBottom: '8px',
};

const imageCol: React.CSSProperties = {
  width: '48px',
  verticalAlign: 'middle' as const,
};

const itemImage: React.CSSProperties = {
  borderRadius: '4px',
  objectFit: 'cover' as const,
};

const imagePlaceholder: React.CSSProperties = {
  width: '48px',
  height: '48px',
  backgroundColor: '#E5E7EB',
  borderRadius: '4px',
};

const detailCol: React.CSSProperties = {
  paddingLeft: '12px',
  verticalAlign: 'middle' as const,
};

const itemTitle: React.CSSProperties = {
  fontSize: '14px',
  color: colors.cocoa,
  margin: 0,
};

const itemDivider: React.CSSProperties = {
  borderColor: '#E5E7EB',
  margin: '8px 0',
};

const note: React.CSSProperties = {
  fontSize: '13px',
  color: colors.gray,
  textAlign: 'center' as const,
  lineHeight: '20px',
};
