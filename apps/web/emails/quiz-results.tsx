import {
  Button,
  Column,
  Hr,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout, { colors, siteUrl } from './components/layout';

interface ProductRec {
  name: string;
  handle: string;
  reason: string;
}

interface QuizResultsEmailProps {
  quizType: 'hair' | 'skin';
  customerName?: string;
  results: Record<string, string>;
  recommendations: ProductRec[];
}

export default function QuizResultsEmail({
  quizType = 'hair',
  customerName,
  results = {},
  recommendations = [],
}: QuizResultsEmailProps) {
  const greeting = customerName ? `Hi ${customerName},` : 'Hi there,';
  const isHair = quizType === 'hair';

  return (
    <EmailLayout
      preview={`Your personalized ${isHair ? 'hair' : 'skin'} care routine is ready.`}
    >
      <Text style={heading}>Your {isHair ? 'Hair' : 'Skin'} Profile</Text>
      <Text style={subtext}>
        {greeting} here are your personalized results and product
        recommendations based on your quiz answers.
      </Text>

      {/* Results Summary */}
      <Section style={resultsBox}>
        {Object.entries(results).map(([key, value]) => (
          <Row key={key} style={resultRow}>
            <Column style={resultLabel}>{key.replace(/_/g, ' ')}</Column>
            <Column style={resultValue}>{value}</Column>
          </Row>
        ))}
      </Section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <>
          <Text style={sectionHeading}>Recommended for You</Text>
          {recommendations.map((rec, i) => (
            <React.Fragment key={i}>
              <Section style={recCard}>
                <Text style={recName}>{rec.name}</Text>
                <Text style={recReason}>{rec.reason}</Text>
                <Link href={`${siteUrl}/product/${rec.handle}`} style={recLink}>
                  View product &rarr;
                </Link>
              </Section>
              {i < recommendations.length - 1 && <Hr style={divider} />}
            </React.Fragment>
          ))}
        </>
      )}

      <Section style={ctaSection}>
        <Button href={`${siteUrl}/shop`} style={ctaButton}>
          Shop All Products
        </Button>
      </Section>

      <Text style={note}>
        These recommendations are based on your quiz results. As you try
        products and learn what works best for you, your routine will evolve.
        We&apos;re here to help every step of the way.
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

const resultsBox: React.CSSProperties = {
  backgroundColor: '#FAFAFA',
  borderRadius: '8px',
  padding: '16px 20px',
  marginBottom: '24px',
};

const resultRow: React.CSSProperties = {
  marginBottom: '4px',
};

const resultLabel: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: colors.gray,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  padding: '4px 0',
};

const resultValue: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: colors.cocoa,
  textAlign: 'right' as const,
  padding: '4px 0',
};

const sectionHeading: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: colors.cocoa,
  fontFamily: '"Playfair Display", Georgia, serif',
  margin: '0 0 16px',
};

const recCard: React.CSSProperties = {
  padding: '12px 0',
};

const recName: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: colors.cocoa,
  margin: '0 0 4px',
};

const recReason: React.CSSProperties = {
  fontSize: '13px',
  color: colors.gray,
  margin: '0 0 6px',
  lineHeight: '18px',
};

const recLink: React.CSSProperties = {
  fontSize: '13px',
  color: colors.sageGreen,
  fontWeight: 600,
  textDecoration: 'none',
};

const divider: React.CSSProperties = {
  borderColor: '#E5E7EB',
  margin: '0',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
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
