'use client';

import { faArrowRight, faCheck } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TRACKING_EVENTS } from '@/constants/events';
import { useAnalytics } from '@/utils/analytics-client';

const NewsletterForm = () => {
  const { track } = useAnalytics();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    const result = await subscribeToNewsletter(email.trim());
    setStatus(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      track(TRACKING_EVENTS.NEWSLETTER_SUBSCRIBED, {
        email_domain: email.trim().split('@')[1] || 'unknown',
        source: 'footer',
      });
      setEmail('');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-sage-green bg-sage-green/10 rounded-lg p-3">
        <FontAwesomeIcon icon={faCheck} />
        <p className="text-sm">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Input
          type="email"
          placeholder="Your email address"
          aria-label="Email address for newsletter"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-warm-clay focus:border-warm-clay pr-12 h-12"
          required
          disabled={status === 'loading'}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-1 top-1 bg-terracotta hover:bg-terracotta/90 text-white h-10 w-10 rounded-md"
          disabled={status === 'loading'}
        >
          <FontAwesomeIcon icon={faArrowRight} />
          <span className="sr-only">Subscribe</span>
        </Button>
      </div>
      {status === 'error' && <p className="text-sm text-red-300">{message}</p>}
    </form>
  );
};

export default NewsletterForm;
