import { ApiError } from '@fal-ai/client';
import { describe, expect, it } from 'vitest';
import { explainFalRefusal } from './video-gen';

const MODEL = 'fal-ai/bytedance/seedance/v1.5/pro/image-to-video';

describe('explainFalRefusal', () => {
  it('names fal, the model and its reason for a 403', () => {
    const refusal = new ApiError({
      message: 'Forbidden',
      status: 403,
      body: { detail: 'User is locked. Reason: Exhausted balance.' },
    });
    const explained = explainFalRefusal(refusal, MODEL) as Error;
    expect(explained.message).toBe(
      `fal.ai refused ${MODEL} with HTTP 403 (Forbidden); check FAL_KEY, the fal balance and access to this model. fal said: User is locked. Reason: Exhausted balance.`,
    );
    expect(explained.cause).toBe(refusal);
  });

  it('leaves other errors untouched', () => {
    const transient = new ApiError({ message: 'Bad Gateway', status: 502 });
    const plain = new Error('network down');
    expect(explainFalRefusal(transient, MODEL)).toBe(transient);
    expect(explainFalRefusal(plain, MODEL)).toBe(plain);
  });
});
