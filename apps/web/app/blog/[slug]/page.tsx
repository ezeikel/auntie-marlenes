import { Suspense } from 'react';
import Blog from '@/components/Blog/Blog';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const BlogPostPage = async ({ params }: BlogPostPageProps) => (
  <Suspense fallback={<div>Loading...</div>}>
    <Blog params={params} />
  </Suspense>
);

export default BlogPostPage;
