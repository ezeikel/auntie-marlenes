import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

const siteUrl = 'https://auntiemarlenes.com';

const colors = {
  terracotta: '#C1666B',
  sageGreen: '#6B8F71',
  cocoa: '#4A3728',
  cream: '#FDF6EC',
  lightGray: '#F5F5F5',
  gray: '#6B7280',
  white: '#FFFFFF',
};

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export default function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={siteUrl} style={logoLink}>
              <Text style={logoText}>Auntie Marlene's</Text>
            </Link>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={divider} />
            <Text style={footerText}>
              Auntie Marlene's — Black-Owned & Family-Run
            </Text>
            <Text style={footerSubtext}>
              Where Beautiful Skin Meets Gorgeous Hair
            </Text>
            <Text style={footerLinks}>
              <Link href={siteUrl} style={footerLink}>
                Shop
              </Link>
              {' | '}
              <Link href={`${siteUrl}/contact`} style={footerLink}>
                Contact Us
              </Link>
              {' | '}
              <Link href={`${siteUrl}/faq`} style={footerLink}>
                FAQ
              </Link>
            </Text>
            <Text style={footerSmall}>
              You're receiving this email because you interacted with Auntie
              Marlene's. If you'd prefer not to hear from us, you can{' '}
              <Link href={`${siteUrl}/unsubscribe`} style={footerLink}>
                unsubscribe
              </Link>
              .
            </Text>
            <Text style={footerSmall}>
              &copy; {new Date().getFullYear()} Auntie Marlene's. All rights
              reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const body: React.CSSProperties = {
  backgroundColor: colors.lightGray,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: colors.white,
};

const header: React.CSSProperties = {
  backgroundColor: colors.cream,
  padding: '24px 0',
  textAlign: 'center' as const,
};

const logoLink: React.CSSProperties = {
  textDecoration: 'none',
};

const logoText: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  color: colors.cocoa,
  fontFamily: '"Playfair Display", Georgia, serif',
  margin: 0,
  textAlign: 'center' as const,
};

const content: React.CSSProperties = {
  padding: '32px 24px',
};

const footer: React.CSSProperties = {
  padding: '0 24px 32px',
};

const divider: React.CSSProperties = {
  borderColor: '#E5E7EB',
  margin: '24px 0',
};

const footerText: React.CSSProperties = {
  color: colors.cocoa,
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '0 0 8px',
  fontWeight: 600,
};

const footerSubtext: React.CSSProperties = {
  color: colors.gray,
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0 0 12px',
};

const footerLinks: React.CSSProperties = {
  color: colors.gray,
  fontSize: '13px',
  textAlign: 'center' as const,
  margin: '0 0 16px',
};

const footerLink: React.CSSProperties = {
  color: colors.sageGreen,
  textDecoration: 'underline',
};

const footerSmall: React.CSSProperties = {
  color: colors.gray,
  fontSize: '11px',
  textAlign: 'center' as const,
  margin: '0 0 4px',
  lineHeight: '16px',
};

export { colors, siteUrl };
