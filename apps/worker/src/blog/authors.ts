/**
 * Guest writer personas for the Auntie Marlene's blog
 *
 * These authors represent experts in various areas of Black hair care,
 * natural hair styling, and beauty. They provide diverse perspectives
 * and expertise across the blog's content categories.
 */

export interface GuestAuthor {
  name: string;
  slug: string;
  title: string;
  bio: string;
  specialty: string[];
  social?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
}

export const GUEST_AUTHORS: GuestAuthor[] = [
  {
    name: 'Simone Edwards',
    slug: 'simone-edwards',
    title: 'Natural Hair Educator',
    bio: 'Simone Edwards is a certified trichologist with over 12 years of experience specialising in textured hair. Based in London, she has helped thousands of clients embrace their natural hair journey through education and personalised care plans.',
    specialty: ['Natural Hair Care', 'Hair Growth', 'Hair Types'],
    social: {
      instagram: 'simonehaircare',
    },
  },
  {
    name: 'Tara Williams',
    slug: 'tara-williams',
    title: 'Protective Styling Specialist',
    bio: 'Tara Williams is a master braider and protective styling expert with a studio in Brixton. With 15 years of experience, she has perfected the art of creating stunning protective styles whilst prioritising hair health.',
    specialty: ['Protective Styles', 'Styling'],
    social: {
      instagram: 'tarabraids',
      tiktok: 'tarabraidsuk',
    },
  },
  {
    name: 'Dr Amara Johnson',
    slug: 'amara-johnson',
    title: 'Dermatologist',
    bio: 'Dr Amara Johnson is a board-certified dermatologist specialising in skincare for melanin-rich skin. She combines clinical expertise with a passion for helping people achieve healthy, glowing skin.',
    specialty: ['Skincare', 'Beauty'],
    social: {
      instagram: 'dramaraskin',
    },
  },
  {
    name: 'Keisha Brown',
    slug: 'keisha-brown',
    title: 'Curl Pattern Expert',
    bio: 'Keisha Brown is a natural hair specialist and curl consultant. She has spent over a decade studying curl patterns and developing techniques to help clients understand and work with their unique hair texture.',
    specialty: ['Hair Types', 'Styling', 'Hair Products'],
    social: {
      instagram: 'keishacurls',
    },
  },
  {
    name: 'Michelle Okonkwo',
    slug: 'michelle-okonkwo',
    title: 'Product Formulator',
    bio: 'Michelle Okonkwo is a cosmetic chemist who has worked with leading natural hair care brands. She brings scientific insight to product recommendations and ingredient analysis.',
    specialty: ['Hair Products', 'Natural Hair Care'],
    social: {
      instagram: 'michelleformulates',
    },
  },
  {
    name: 'Jasmine Thompson',
    slug: 'jasmine-thompson',
    title: 'Loc Specialist',
    bio: 'Jasmine Thompson is a loc consultant and natural hair advocate with 10 years of experience. She specialises in loc maintenance, styling, and helping clients start their loc journey with confidence.',
    specialty: ['Protective Styles', 'Hair Growth'],
    social: {
      instagram: 'jasminelocs',
      tiktok: 'jasminelocs',
    },
  },
  {
    name: 'Crystal Davis',
    slug: 'crystal-davis',
    title: 'Wellness Coach',
    bio: 'Crystal Davis is a holistic wellness coach focusing on the connection between self-care, mental health, and hair health. She believes that beauty starts from within and advocates for mindful beauty practices.',
    specialty: ['Wellness', 'Beauty'],
    social: {
      instagram: 'crystalwellness',
    },
  },
  {
    name: 'Nicole Baptiste',
    slug: 'nicole-baptiste',
    title: 'Hair Growth Specialist',
    bio: 'Nicole Baptiste is a hair growth consultant who has helped clients achieve their length retention goals through science-backed methods. Her practical approach focuses on sustainable hair care habits.',
    specialty: ['Hair Growth', 'Natural Hair Care'],
    social: {
      instagram: 'nicolegrowshair',
    },
  },
  {
    name: 'Aisha Campbell',
    slug: 'aisha-campbell',
    title: 'Style Influencer',
    bio: 'Aisha Campbell is a natural hair style influencer and content creator. She shares creative hairstyle tutorials and inspiration, making styling accessible for naturals at all skill levels.',
    specialty: ['Styling', 'Trends'],
    social: {
      instagram: 'aishastyles',
      tiktok: 'aishastyles',
    },
  },
  {
    name: 'Diane Morrison',
    slug: 'diane-morrison',
    title: 'Senior Hair Stylist',
    bio: 'Diane Morrison brings 25 years of experience as a professional hair stylist. She has worked with clients of all ages and specialises in age-appropriate styling and caring for mature natural hair.',
    specialty: ['Styling', 'Natural Hair Care', 'Trends'],
    social: {
      instagram: 'dianesalon',
    },
  },
  {
    name: 'Fola Adeyemi',
    slug: 'fola-adeyemi',
    title: 'Beauty Editor',
    bio: 'Fola Adeyemi is a beauty editor and journalist who has written for leading UK publications. She covers the latest trends, product launches, and the evolving landscape of Black beauty.',
    specialty: ['Beauty', 'Trends', 'Hair Products'],
    social: {
      instagram: 'folabeauty',
    },
  },
  {
    name: 'Priscilla Mensah',
    slug: 'priscilla-mensah',
    title: 'DIY Hair Care Expert',
    bio: 'Priscilla Mensah is passionate about accessible hair care. She creates DIY recipes and budget-friendly solutions that help naturals maintain healthy hair without breaking the bank.',
    specialty: ['Hair Products', 'Natural Hair Care'],
    social: {
      instagram: 'priscilladiy',
    },
  },
  {
    name: 'Tamara Lewis',
    slug: 'tamara-lewis',
    title: 'Colour Specialist',
    bio: 'Tamara Lewis is a colour specialist who understands the unique needs of textured hair. She advises on colouring techniques that minimise damage while achieving beautiful, vibrant results.',
    specialty: ['Styling', 'Trends', 'Hair Products'],
    social: {
      instagram: 'tamaracolour',
    },
  },
  {
    name: 'Zara Nwosu',
    slug: 'zara-nwosu',
    title: "Children's Hair Specialist",
    bio: "Zara Nwosu specialises in caring for children's natural hair. She provides gentle, practical advice for parents and carers navigating their little ones' hair care journey.",
    specialty: ['Natural Hair Care', 'Wellness'],
    social: {
      instagram: 'zarakidshair',
    },
  },
  {
    name: 'Ruth Adebayo',
    slug: 'ruth-adebayo',
    title: 'Hair Science Writer',
    bio: 'Ruth Adebayo combines her background in biochemistry with a passion for hair education. She breaks down complex hair science into practical, understandable advice for everyday naturals.',
    specialty: ['Hair Types', 'Hair Growth', 'Hair Products'],
    social: {
      instagram: 'ruthexplainshair',
    },
  },
];

/**
 * Get a random author for a blog post
 */
export function getRandomAuthor(): GuestAuthor {
  const randomIndex = Math.floor(Math.random() * GUEST_AUTHORS.length);
  return GUEST_AUTHORS[randomIndex];
}

/**
 * Get an author by their specialty matching a category
 */
export function getAuthorBySpecialty(category: string): GuestAuthor {
  const matchingAuthors = GUEST_AUTHORS.filter((author) =>
    author.specialty.some(
      (spec) => spec.toLowerCase() === category.toLowerCase(),
    ),
  );

  if (matchingAuthors.length === 0) {
    return getRandomAuthor();
  }

  const randomIndex = Math.floor(Math.random() * matchingAuthors.length);
  return matchingAuthors[randomIndex];
}

/**
 * Get author by slug
 */
export function getAuthorBySlug(slug: string): GuestAuthor | undefined {
  return GUEST_AUTHORS.find((author) => author.slug === slug);
}

/**
 * Get total number of guest authors
 */
export function getTotalAuthorsCount(): number {
  return GUEST_AUTHORS.length;
}
