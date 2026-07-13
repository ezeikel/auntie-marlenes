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
  handle?: string;
  image?: string;
}

interface RestockReminderEmailProps {
  customerName?: string;
  lineItems: LineItem[];
}

export default function RestockReminderEmail({
  customerName,
  lineItems = [],
}: RestockReminderEmailProps) {
  const greeting = customerName ? `Hi ${customerName},` : 'Hi there,';

  return (
    <EmailLayout preview="Time to restock? Your favourite products are waiting for you.">
      <Text style={heading}>Time to Restock?</Text>
      <Text style={subtext}>
        {greeting} it's been about a month since your last order. Running low on
        any of these?
      </Text>

      <Section style={productsGrid}>
        {lineItems.map((item, i) => (
          <React.Fragment key={i}>
            <Row style={productRow}>
              <Column style={imageCol}>
                {item.image ? (
                  <Img
                    src={item.image}
                    width="80"
                    height="80"
                    alt={item.title}
                    style={productImage}
                  />
                ) : (
                  <div style={imagePlaceholder} />
                )}
              </Column>
              <Column style={detailCol}>
                <Text style={productTitle}>{item.title}</Text>
                {item.handle && (
                  <Link
                    href={`${siteUrl}/product/${item.handle}`}
                    style={reorderLink}
                  >
                    Reorder &rarr;
                  </Link>
                )}
              </Column>
            </Row>
            {i < lineItems.length - 1 && <Hr style={itemDivider} />}
          </React.Fragment>
        ))}
      </Section>

      <Section style={ctaSection}>
        <Button href={`${siteUrl}/shop`} style={ctaButton}>
          Shop All Products
        </Button>
      </Section>

      <Text style={note}>
        We keep your favourites stocked and ready. Free shipping on orders over
        £50.
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

const productsGrid: React.CSSProperties = {
  backgroundColor: '#FAFAFA',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const productRow: React.CSSProperties = {
  marginBottom: '12px',
};

const imageCol: React.CSSProperties = {
  width: '80px',
  verticalAlign: 'top' as const,
};

const productImage: React.CSSProperties = {
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

const productTitle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: colors.cocoa,
  margin: '0 0 6px',
};

const reorderLink: React.CSSProperties = {
  fontSize: '13px',
  color: colors.sageGreen,
  fontWeight: 600,
  textDecoration: 'none',
};

const itemDivider: React.CSSProperties = {
  borderColor: '#E5E7EB',
  margin: '12px 0',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: colors.sageGreen,
  color: '#FFFFFF',
  fontSize: '15px',
  fontWeight: 700,
  padding: '14px 40px',
  borderRadius: '6px',
  textDecoration: 'none',
};

const note: React.CSSProperties = {
  fontSize: '13px',
  color: colors.gray,
  textAlign: 'center' as const,
  lineHeight: '20px',
};
