import { Section, Img, Heading } from '@react-email/components';

type EmailHeaderProps = {
  title?: string;
};

const header = {
  padding: '24px 0',
  borderBottom: '2px solid #e5e7eb',
  marginBottom: '32px',
};

const logo = {
  display: 'block',
  margin: '0 auto',
  width: '48px',
  height: '48px',
};

const title = {
  color: '#4a3933',
  fontSize: '28px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
  fontFamily: 'Playfair Display, Georgia, serif',
};

const EmailHeader = ({ title: titleText }: EmailHeaderProps) => (
  <Section style={header}>
    <Img
      src="https://auntie-marlenes.com/logos/logo.png"
      alt="Auntie Marlene's"
      style={logo}
      width={48}
      height={48}
    />
    {titleText && <Heading style={title}>{titleText}</Heading>}
  </Section>
);

export default EmailHeader;
