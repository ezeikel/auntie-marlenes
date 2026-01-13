/**
 * Portable Text Components for Sanity Blog Content
 *
 * Custom renderers for Portable Text blocks to match the existing blog styling
 */

import Image from 'next/image';
import Link from 'next/link';
import type { PortableTextComponents } from '@portabletext/react';
import { urlForImage } from '@/sanity/lib/image';
import type { Image as SanityImage } from 'sanity';

// Type for image blocks
interface ImageBlock {
  _type: 'image';
  asset?: {
    _ref: string;
  };
  alt?: string;
  caption?: string;
}

// Type for marks (links, etc.)
interface LinkMark {
  _type: 'link';
  href: string;
  blank?: boolean;
}

export const portableTextComponents: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="text-4xl font-playfair font-bold text-cocoa mt-12 mb-6">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-playfair font-bold text-cocoa mt-12 mb-6">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-playfair font-bold text-cocoa mt-8 mb-4">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-playfair font-bold text-cocoa mt-6 mb-3">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="text-gray-700 leading-relaxed mb-6">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-sage-green pl-6 py-2 my-8 italic text-gray-600 bg-sage-green/5 rounded-r-lg">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside text-gray-700 my-6 space-y-2 ml-4">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside text-gray-700 my-6 space-y-2 ml-4">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="text-gray-700 my-2">{children}</li>
    ),
    number: ({ children }) => (
      <li className="text-gray-700 my-2">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-bold text-cocoa">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => <span className="underline">{children}</span>,
    code: ({ children }) => (
      <code className="bg-gray-100 text-terracotta px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const mark = value as LinkMark;
      const href = mark?.href || '#';
      const isExternal = href.startsWith('http');

      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sage-green hover:underline"
          >
            {children}
          </a>
        );
      }

      return (
        <Link href={href} className="text-sage-green hover:underline">
          {children}
        </Link>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const imageBlock = value as ImageBlock;
      const imageUrl = urlForImage(imageBlock as unknown as SanityImage)?.url();

      if (!imageUrl) {
        return null;
      }

      return (
        <figure className="my-8">
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <Image
              src={imageUrl}
              alt={imageBlock.alt || 'Blog image'}
              fill
              className="object-cover"
            />
          </div>
          {imageBlock.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-3 italic">
              {imageBlock.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

export default portableTextComponents;
