'use server';

import { sendQuizResultsEmail } from '@/lib/email';

export async function sendQuizResults(data: {
  email: string;
  quizType: 'hair' | 'skin';
  customerName?: string;
  results: Record<string, string>;
  recommendations: Array<{ name: string; handle: string; reason: string }>;
}) {
  if (!data.email || !data.email.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  try {
    await sendQuizResultsEmail(data);
    return {
      success: true,
      message: 'Check your inbox — your personalized routine is on its way!',
    };
  } catch (error) {
    console.error('[Quiz] Failed to send results email:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    };
  }
}
