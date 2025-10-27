'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { blogPosts, blogCategories } from '@/lib/blog-data';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faClock,
  faUser,
} from '@fortawesome/pro-regular-svg-icons';

interface BlogListProps {
  featuredPosts: typeof blogPosts;
}

export default function BlogList({ featuredPosts }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts =
    selectedCategory === 'All'
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  return (
    <>
      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-playfair font-bold text-cocoa mb-8">
              Featured Articles
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4">
                      <Image
                        src={post.image || '/placeholder.svg'}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-terracotta text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="text-sage-green font-semibold uppercase">
                          {post.category}
                        </span>
                        <span>•</span>
                        <span>{post.date}</span>
                      </div>
                      <h3 className="text-xl font-playfair font-bold text-cocoa group-hover:text-terracotta transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faClock} size="sm" />
                          <span>{post.readTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faUser} size="sm" />
                          <span>{post.author.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {blogCategories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={
                  selectedCategory === category
                    ? 'bg-sage-green hover:bg-sage-green/90 text-white'
                    : 'bg-transparent border-cocoa text-cocoa hover:bg-cocoa hover:text-white'
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-12 bg-warm-beige">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-playfair font-bold text-cocoa mb-8">
            {selectedCategory === 'All'
              ? 'All Articles'
              : `${selectedCategory} Articles`}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={post.image || '/placeholder.svg'}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="text-sage-green font-semibold uppercase">
                        {post.category}
                      </span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>
                    <h3 className="text-xl font-playfair font-bold text-cocoa hover:text-terracotta transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={post.author.avatar || '/placeholder.svg'}
                            alt={post.author.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-cocoa">
                            {post.author.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FontAwesomeIcon icon={faClock} size="sm" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <span className="text-sage-green font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
                        Read More{' '}
                        <FontAwesomeIcon icon={faArrowRight} size="sm" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 bg-gradient-to-r from-sage-green to-warm-clay rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
              Never Miss a Post
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest hair care tips,
              product reviews, and exclusive offers delivered straight to your
              inbox.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-sage-green hover:bg-warm-beige font-bold"
            >
              <Link href="/#newsletter">Subscribe Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
