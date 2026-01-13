import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
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
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'object',
      fields: [
        {
          name: 'asset',
          title: 'Image',
          type: 'image',
          options: {
            hotspot: true,
          },
        },
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Alternative text for accessibility',
        },
        {
          name: 'credit',
          title: 'Credit',
          type: 'string',
          description: 'Photo credit (e.g., "Photo by John Doe on Pexels")',
        },
        {
          name: 'creditUrl',
          title: 'Credit URL',
          type: 'url',
          description: 'Link to photographer or source',
        },
      ],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'blogCategory' }],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(300),
      description: 'Short summary for listings and SEO (max 300 characters)',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                    validation: (Rule) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                  {
                    title: 'Open in new tab',
                    name: 'blank',
                    type: 'boolean',
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show this post on the homepage',
      initialValue: false,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (Rule) => Rule.max(70),
          description: 'Override the default title (max 70 characters)',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 2,
          validation: (Rule) => Rule.max(160),
          description: 'Override the excerpt for SEO (max 160 characters)',
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            layout: 'tags',
          },
        },
      ],
    }),
    defineField({
      name: 'generationMeta',
      title: 'Generation Metadata',
      type: 'object',
      description: 'Metadata about AI-generated content',
      fields: [
        {
          name: 'isGenerated',
          title: 'Is AI Generated',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'topic',
          title: 'Topic',
          type: 'string',
          description: 'Original topic used for generation (for deduplication)',
        },
        {
          name: 'generatedAt',
          title: 'Generated At',
          type: 'datetime',
        },
        {
          name: 'model',
          title: 'Model',
          type: 'string',
          description: 'AI model used for generation',
        },
        {
          name: 'imageSource',
          title: 'Image Source',
          type: 'string',
          options: {
            list: [
              { title: 'Pexels', value: 'pexels' },
              { title: 'AI Generated', value: 'gemini' },
              { title: 'Manual', value: 'manual' },
            ],
          },
        },
        {
          name: 'pexelsPhotoId',
          title: 'Pexels Photo ID',
          type: 'string',
        },
        {
          name: 'imagePrompt',
          title: 'Image Prompt',
          type: 'text',
          description: 'Prompt used for AI image generation',
        },
        {
          name: 'imageEvaluation',
          title: 'Image Evaluation',
          type: 'object',
          fields: [
            {
              name: 'confidence',
              title: 'Confidence Score',
              type: 'number',
            },
            {
              name: 'reasoning',
              title: 'Reasoning',
              type: 'text',
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'featuredImage.asset',
      status: 'status',
    },
    prepare(selection) {
      const { author, status, title } = selection;
      const statusEmoji =
        status === 'published'
          ? ''
          : status === 'draft'
            ? '[Draft] '
            : '[Archived] ';
      return {
        ...selection,
        title: `${statusEmoji}${title}`,
        subtitle: author ? `by ${author}` : 'No author',
      };
    },
  },
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Published Date, Old',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
  ],
});
