import { NextRequest, NextResponse } from 'next/server';
import {
  generateRandomBlogPost,
  seedAuthors,
  seedCategories,
} from '@/app/actions/blog';

/**
 * Cron job endpoint for automatic blog generation
 *
 * This endpoint is triggered by Vercel Cron on a schedule defined in vercel.json
 * Schedule: Tuesday, Thursday, Saturday at 9:00 AM UTC
 *
 * Security: Requires CRON_SECRET authorization header
 */
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET environment variable not set');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting blog generation cron job');

    // Generate a random blog post
    const result = await generateRandomBlogPost();

    if (result.success) {
      console.log('Blog post generated successfully:', {
        title: result.title,
        slug: result.slug,
      });

      return NextResponse.json({
        success: true,
        message: 'Blog post generated successfully',
        data: {
          title: result.title,
          slug: result.slug,
        },
      });
    } else {
      console.error('Blog generation failed:', result.error);

      return NextResponse.json(
        {
          success: false,
          message: 'Blog generation failed',
          error: result.error,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Cron job error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * POST endpoint for seeding initial data
 *
 * Use this once to seed authors and categories before the first cron run
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get action from request body
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'seed';

    if (action === 'seed') {
      console.log('Seeding authors and categories');

      // Seed authors
      const authorsResult = await seedAuthors();
      console.log('Authors seeding result:', authorsResult);

      // Seed categories
      const categoriesResult = await seedCategories();
      console.log('Categories seeding result:', categoriesResult);

      return NextResponse.json({
        success: true,
        message: 'Seeding completed',
        data: {
          authors: authorsResult,
          categories: categoriesResult,
        },
      });
    }

    if (action === 'generate') {
      // Manual trigger for blog generation
      const result = await generateRandomBlogPost();

      return NextResponse.json({
        success: result.success,
        message: result.success
          ? 'Blog post generated successfully'
          : 'Blog generation failed',
        data: result.success
          ? { title: result.title, slug: result.slug }
          : { error: result.error },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "seed" or "generate"' },
      { status: 400 },
    );
  } catch (error) {
    console.error('POST endpoint error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
