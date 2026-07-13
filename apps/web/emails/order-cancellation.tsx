import { Button, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import EmailLayout, { colors, siteUrl } from './components/layout';

interface OrderCancellationEmailProps {
  orderNumber: string;
  customerName: string;
  cancelReason?: string;
}

export default function OrderCancellationEmail({
  orderNumber = '#1001',
  customerName = 'Customer',
  cancelReason,
}: OrderCancellationEmailProps) {
  return (
    <EmailLayout preview={`Your order ${orderNumber} has been cancelled.`}>
      <Text style={heading}>Order Cancelled</Text>
      <Text style={subtext}>
        Hi {customerName}, your order {orderNumber} has been cancelled.
        {cancelReason ? ` Reason: ${cancelReason}.` : ''}
      </Text>

      <Section style={infoBox}>
        <Text style={infoText}>
          If a payment was taken, your refund will be processed automatically.
          It may take 5-10 business days to appear on your statement depending
          on your bank.
        </Text>
      </Section>

      <Text style={subtext}>
        If this wasn't expected or you have questions, please don't hesitate to
        reach out — we're happy to help.
      </Text>

      <Section style={ctaSection}>
        <Button href={`${siteUrl}/contact`} style={ctaButton}>
          Contact Us
        </Button>
      </Section>

      <Text style={note}>
        Changed your mind?{' '}
        <Link href={`${siteUrl}/shop`} style={noteLink}>
          Browse our latest products
        </Link>
        .
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

const infoBox: React.CSSProperties = {
  backgroundColor: '#FEF3C7',
  borderRadius: '8px',
  padding: '16px 20px',
  marginBottom: '24px',
};

const infoText: React.CSSProperties = {
  fontSize: '14px',
  color: '#92400E',
  margin: 0,
  lineHeight: '20px',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: colors.cocoa,
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 700,
  padding: '12px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
};

const note: React.CSSProperties = {
  fontSize: '13px',
  color: colors.gray,
  textAlign: 'center' as const,
  lineHeight: '20px',
};

const noteLink: React.CSSProperties = {
  color: colors.sageGreen,
  textDecoration: 'underline',
};
