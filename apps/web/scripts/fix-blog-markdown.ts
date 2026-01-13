#!/usr/bin/env npx tsx

// CRITICAL: Load environment variables FIRST before any imports
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

// Now import modules that depend on env vars
import { writeClient } from '../sanity/lib/client';
import type { PortableTextBlock } from '@portabletext/types';

/**
 * Parse inline markdown formatting and convert to Portable Text spans with marks
 */
function parseInlineMarkdown(text: string): any[] {
  const spans: any[] = [];
  let currentText = '';
  let currentMarks: string[] = [];
  let i = 0;

  const flushSpan = () => {
    if (currentText) {
      spans.push({
        _type: 'span',
        _key: `span-${spans.length}`,
        text: currentText,
        marks: [...currentMarks],
      });
      currentText = '';
    }
  };

  while (i < text.length) {
    // Bold: **text**
    if (text.slice(i, i + 2) === '**') {
      flushSpan();
      const endIndex = text.indexOf('**', i + 2);
      if (endIndex !== -1) {
        currentMarks.push('strong');
        currentText = text.slice(i + 2, endIndex);
        flushSpan();
        currentMarks = currentMarks.filter((m) => m !== 'strong');
        i = endIndex + 2;
        continue;
      }
    }

    // Italic: *text* (but not ** which is bold)
    if (text[i] === '*' && text[i + 1] !== '*') {
      flushSpan();
      const endIndex = text.indexOf('*', i + 1);
      if (endIndex !== -1 && text[endIndex + 1] !== '*') {
        currentMarks.push('em');
        currentText = text.slice(i + 1, endIndex);
        flushSpan();
        currentMarks = currentMarks.filter((m) => m !== 'em');
        i = endIndex + 1;
        continue;
      }
    }

    // Inline code: `text`
    if (text[i] === '`') {
      flushSpan();
      const endIndex = text.indexOf('`', i + 1);
      if (endIndex !== -1) {
        currentMarks.push('code');
        currentText = text.slice(i + 1, endIndex);
        flushSpan();
        currentMarks = currentMarks.filter((m) => m !== 'code');
        i = endIndex + 1;
        continue;
      }
    }

    currentText += text[i];
    i++;
  }

  flushSpan();
  return spans.length > 0
    ? spans
    : [{ _type: 'span', _key: 'span-0', text, marks: [] }];
}

/**
 * Check if text contains markdown syntax
 */
function hasMarkdownSyntax(text: string): boolean {
  return /\*\*|\*(?!\*)|`/.test(text);
}

/**
 * Fix markdown in a single block's children
 */
function fixBlockChildren(children: any[]): any[] {
  return children.flatMap((child) => {
    if (child._type === 'span' && hasMarkdownSyntax(child.text)) {
      // Parse the markdown and return new spans
      return parseInlineMarkdown(child.text);
    }
    return child;
  });
}

/**
 * Fix markdown formatting in blog post body
 */
function fixMarkdownInBody(body: PortableTextBlock[]): PortableTextBlock[] {
  return body.map((block: any) => {
    if (block._type === 'block' && block.children) {
      return {
        ...block,
        children: fixBlockChildren(block.children),
      };
    }
    return block;
  });
}

interface Post {
  _id: string;
  title: string;
  body: PortableTextBlock[];
}

async function fixBlogMarkdown() {
  console.log('\n🔧 Blog Markdown Fix Migration');
  console.log('Fetching posts with markdown syntax...\n');

  // Fetch all posts with potential markdown syntax
  const posts = await writeClient.fetch<Post[]>(
    `*[_type == "post" && body[].children[].text match "\\\\*\\\\*|\\\\*(?!\\\\*)"] {
      _id,
      title,
      body
    }`,
  );

  console.log(`Found ${posts.length} posts with markdown syntax\n`);

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const post of posts) {
    try {
      console.log(`\n📝 ${post.title}`);

      // Check if any blocks actually need fixing
      const needsFix = post.body.some((block: any) =>
        block.children?.some((child: any) => hasMarkdownSyntax(child.text)),
      );

      if (!needsFix) {
        console.log('  ⏭️  No markdown found, skipping');
        skipped++;
        continue;
      }

      // Fix the markdown
      const fixedBody = fixMarkdownInBody(post.body);

      // Update the post
      await writeClient
        .patch(post._id)
        .set({
          body: fixedBody,
        })
        .commit();

      console.log('  ✅ Fixed markdown formatting');
      succeeded++;
    } catch (error) {
      console.error('  ❌ Error:', error);
      failed++;
    }
  }

  console.log('\n📊 Results:');
  console.log(`  Total: ${posts.length}`);
  console.log(`  Fixed: ${succeeded}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log('\n✨ Done!');
}

fixBlogMarkdown().catch(console.error);
