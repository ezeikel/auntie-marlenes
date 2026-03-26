'use server';

import resend from '@/lib/resend';

type NewsletterResult = {
  success: boolean;
  message: string;
};

export async function subscribeToNewsletter(
  email: string,
): Promise<NewsletterResult> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  try {
    // Get or create the audience
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (!audienceId) {
      // If no audience ID configured, just send a welcome email
      await resend.emails.send({
        from: "Auntie Marlene's <hello@auntiemarlenes.com>",
        to: email,
        subject: "Welcome to Auntie Marlene's!",
        html: `<p>Thanks for subscribing! You'll be the first to know about new products, offers, and hair care tips.</p><p>With love,<br/>The Auntie Marlene's Team</p>`,
      });
      return {
        success: true,
        message: "You're in! Check your inbox for a welcome message.",
      };
    }

    // Add contact to Resend audience
    await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    return {
      success: true,
      message:
        "You're in! You'll be the first to hear about new arrivals and offers.",
    };
  } catch (error) {
    console.error('[newsletter] Subscribe error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    };
  }
}
