import { describe, expect, it } from 'vitest';
import {
  type BlogResearch,
  isPublicHttpsUrl,
  validateResearchCitations,
} from './research';

const research: BlogResearch = {
  summary:
    'A sufficiently detailed research summary used to exercise the citation quality gate safely.',
  keyFacts: [
    'The first fact is long enough for the production research schema.',
    'The second fact is long enough for the production research schema.',
    'The third fact is long enough for the production research schema.',
  ],
  sources: [
    {
      title: 'Manufacturer directions',
      publisher: 'Example manufacturer',
      url: 'https://manufacturer.example/product',
    },
    {
      title: 'Professional guidance',
      publisher: 'Example professional body',
      url: 'https://professional.example/guidance/',
    },
  ],
  checkedAt: '2026-08-11T10:00:00.000Z',
};

describe('research source safety', () => {
  it('accepts public HTTPS URLs and rejects local or private targets', () => {
    expect(isPublicHttpsUrl('https://www.nhs.uk/conditions/')).toBe(true);
    expect(isPublicHttpsUrl('http://www.nhs.uk/conditions/')).toBe(false);
    expect(isPublicHttpsUrl('https://localhost/private')).toBe(false);
    expect(isPublicHttpsUrl('https://127.0.0.1/private')).toBe(false);
    expect(isPublicHttpsUrl('https://192.168.1.2/private')).toBe(false);
    expect(isPublicHttpsUrl('not a URL')).toBe(false);
  });
});

describe('research citation gate', () => {
  it('accepts two exact verified Markdown links', () => {
    expect(() =>
      validateResearchCitations(
        '[Directions](https://manufacturer.example/product) and [guidance](https://professional.example/guidance).',
        research,
      ),
    ).not.toThrow();
  });

  it('fails closed when fewer than two verified sources are cited', () => {
    expect(() =>
      validateResearchCitations(
        '[Only one](https://manufacturer.example/product) and [unverified](https://other.example/article).',
        research,
      ),
    ).toThrow('Generated article did not cite two verified sources');
  });
});
