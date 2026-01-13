#!/usr/bin/env npx tsx

// CRITICAL: Load environment variables FIRST before any imports
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

// Now import modules that depend on env vars
import { generateText } from 'ai';
import { models } from '../lib/ai/models';
import { writeClient } from '../sanity/lib/client';

// Prompt template for professional author portraits
const AUTHOR_AVATAR_PROMPT = `Generate a professional portrait photograph for a blog author:

Name: {{NAME}}
Title: {{TITLE}}
Context: Black woman professional in the natural hair care industry

The image should:
- Feature a Black woman with beautiful natural hair
- Professional headshot style (shoulders up)
- Warm, friendly expression
- Professional studio lighting
- Clean, soft-focus background
- Authentic and approachable, not overly formal
- High-quality editorial photography aesthetic
- NOT include any text or watermarks

Style: Professional editorial portrait, warm tones, soft bokeh background`;

interface Author {
  _id: string;
  name: string;
  title: string;
  slug: {
    current: string;
  };
}

async function generateAvatarImage(
  name: string,
  title: string,
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const prompt = AUTHOR_AVATAR_PROMPT.replace('{{NAME}}', name).replace(
    '{{TITLE}}',
    title,
  );

  try {
    console.log(`  Generating avatar with Gemini 3 Pro Image...`);

    // Use Gemini 3 Pro Image (same pattern as blog.ts)
    const result = await generateText({
      model: models.geminiImage,
      prompt: `Generate a high-quality professional portrait. Do not include any text in the image. ${prompt}`,
    });

    const imageFile = result.files?.find((f) =>
      f.mediaType?.startsWith('image/'),
    );

    if (imageFile) {
      const buffer = Buffer.from(imageFile.uint8Array);
      return {
        buffer,
        mimeType: imageFile.mediaType,
      };
    }

    console.error(`  No image data returned`);
    return null;
  } catch (error) {
    console.error(`  Gemini generation failed:`, error);
    return null;
  }
}

async function uploadImageToSanity(
  buffer: Buffer,
  filename: string,
): Promise<{ _type: 'reference'; _ref: string }> {
  const asset = await writeClient.assets.upload('image', buffer, {
    filename,
  });

  return {
    _type: 'reference',
    _ref: asset._id,
  };
}

async function generateAuthorAvatars() {
  // Fetch authors without images from Sanity
  const authors = await writeClient.fetch<Author[]>(
    `*[_type == "author" && !defined(image)] | order(name asc) {
      _id,
      name,
      title,
      slug
    }`,
  );

  console.log(`\n🎨 Author Avatar Generation`);
  console.log(`Found ${authors.length} authors without images\n`);

  let succeeded = 0;
  let failed = 0;

  for (const author of authors) {
    try {
      console.log(
        `\n📸 ${author.name} (${author.title || 'Natural Hair Specialist'})`,
      );

      // Generate image with Gemini
      const imageResult = await generateAvatarImage(
        author.name,
        author.title || 'Natural Hair Specialist',
      );

      if (!imageResult) {
        console.log(`❌ Failed to generate image`);
        failed++;
        continue;
      }

      // Upload to Sanity
      const extension = imageResult.mimeType.includes('png') ? 'png' : 'jpg';
      const filename = `${author.slug.current}-avatar.${extension}`;

      console.log(`  Uploading to Sanity...`);
      const assetRef = await uploadImageToSanity(imageResult.buffer, filename);

      // Update author document
      await writeClient
        .patch(author._id)
        .set({
          image: {
            _type: 'image',
            asset: assetRef,
          },
        })
        .commit();

      console.log(`✅ Success`);
      succeeded++;

      // Rate limiting: 2 second delay between generations
      if (succeeded < authors.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Error:`, error);
      failed++;
    }
  }

  console.log('\n📊 Results:');
  console.log(`  Total: ${authors.length}`);
  console.log(`  Succeeded: ${succeeded}`);
  console.log(`  Failed: ${failed}`);
  console.log('\n✨ Done!');
}

generateAuthorAvatars().catch(console.error);
