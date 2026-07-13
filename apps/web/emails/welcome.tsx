import { Button, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import EmailLayout, { colors, siteUrl } from './components/layout';

interface WelcomeEmailProps {
  customerName?: string;
}

export default function WelcomeEmail({ customerName }: WelcomeEmailProps) {
  const greeting = customerName ? `Hi ${customerName},` : 'Hi there,';

  return (
    <EmailLayout preview="Welcome to Auntie Marlene's — your go-to for Black hair & beauty essentials.">
      <Text style={heading}>Welcome to the Family</Text>
      <Text style={subtext}>
        {greeting} we're so glad you're here! Auntie Marlene's is your modern
        Black beauty supply store — premium braiding hair, wigs, extensions,
        skin care, and styling essentials, all in one place.
      </Text>

      <Section style={highlightBox}>
        <Text style={highlightTitle}>What you can look forward to:</Text>
        <Text style={highlightItem}>
          &bull; New arrivals and exclusive drops
        </Text>
        <Text style={highlightItem}>
          &bull; Hair and skin care tips for melanin-rich beauty
        </Text>
        <Text style={highlightItem}>
          &bull; Early access to sales and special offers
        </Text>
      </Section>

      <Section style={ctaSection}>
        <Button href={`${siteUrl}/shop`} style={ctaButton}>
          Start Shopping
        </Button>
      </Section>

      <Text style={note}>
        Questions? We're always here to help.{' '}
        <Link href={`${siteUrl}/contact`} style={noteLink}>
          Get in touch
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

const highlightBox: React.CSSProperties = {
  backgroundColor: '#FAFAFA',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const highlightTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: colors.cocoa,
  margin: '0 0 12px',
};

const highlightItem: React.CSSProperties = {
  fontSize: '14px',
  color: '#4B5563',
  margin: '0 0 6px',
  lineHeight: '20px',
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

const noteLink: React.CSSProperties = {
  color: colors.sageGreen,
  textDecoration: 'underline',
};
