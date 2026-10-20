// Videos live in the R2 bucket `auntie-marlenes-prod` under `videos/`, served at
// assets.auntiemarlenes.com, not in `public/`: Workers static assets cap each
// file at 25 MiB and the showcase clips are larger.
export const MEDIA_BASE_URL = 'https://assets.auntiemarlenes.com';

export const mediaUrl = (path: string) => `${MEDIA_BASE_URL}${path}`;
