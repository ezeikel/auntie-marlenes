import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'blogCategory',
  title: 'Blog Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Brief description of this category',
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'Hex color for category badge (e.g., #FF5733)',
      validation: (Rule) =>
        Rule.regex(/^#[0-9A-Fa-f]{6}$/, {
          name: 'hex color',
          invert: false,
        }).error('Must be a valid hex color (e.g., #FF5733)'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
});
