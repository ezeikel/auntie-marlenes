import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import author from './sanity/schemas/author';
import category from './sanity/schemas/category';
import post from './sanity/schemas/post';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  name: 'auntie-marlenes',
  title: "Auntie Marlene's Blog CMS",

  projectId,
  dataset,

  plugins: [structureTool()],

  schema: {
    types: [author, category, post],
  },
});
