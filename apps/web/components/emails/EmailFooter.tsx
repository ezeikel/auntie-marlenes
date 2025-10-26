import { Section, Text, Link, Hr } from '@react-email/components';

const footer = {
  marginTop: '48px',
};

const divider = {
  borderTop: '1px solid #e5e7eb',
  margin: '24px 0',
};

const footerText = {
  color: '#8b7355',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '8px 0',
};

const link = {
  color: '#7c9885',
  textDecoration: 'underline',
};

const copyright = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '16px',
};

const EmailFooter = () => (
  <Section style={footer}>
    <Hr style={divider} />
    <Text style={footerText}>
      Need help? Contact us at{' '}
      <Link href="mailto:support@auntie-marlenes.com" style={link}>
        support@auntie-marlenes.com
      </Link>
    </Text>
    <Text style={footerText}>
      <Link href="https://auntie-marlenes.com" style={link}>
        Visit Our Store
      </Link>
      {' • '}
      <Link href="https://auntie-marlenes.com/privacy" style={link}>
        Privacy Policy
      </Link>
      {' • '}
      <Link href="https://auntie-marlenes.com/terms" style={link}>
        Terms of Service
      </Link>
    </Text>
    <Text style={copyright}>
      © {new Date().getFullYear()} Auntie Marlene's. All rights reserved.
    </Text>
  </Section>
);

export default EmailFooter;
