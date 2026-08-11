export type BlogRunSnapshot = {
  status: 'idle' | 'running' | 'succeeded' | 'failed';
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  lastSlug: string | null;
  lastError: string | null;
};

export class BlogRunState {
  private value: BlogRunSnapshot = {
    status: 'idle',
    lastStartedAt: null,
    lastFinishedAt: null,
    lastSlug: null,
    lastError: null,
  };

  begin(now = new Date()): boolean {
    if (this.value.status === 'running') return false;
    this.value = {
      ...this.value,
      status: 'running',
      lastStartedAt: now.toISOString(),
      lastError: null,
    };
    return true;
  }

  succeed(slug: string, now = new Date()): void {
    this.value = {
      ...this.value,
      status: 'succeeded',
      lastFinishedAt: now.toISOString(),
      lastSlug: slug,
      lastError: null,
    };
  }

  fail(error: unknown, now = new Date()): void {
    this.value = {
      ...this.value,
      status: 'failed',
      lastFinishedAt: now.toISOString(),
      lastError: error instanceof Error ? error.message : String(error),
    };
  }

  read(): Readonly<BlogRunSnapshot> {
    return { ...this.value };
  }
}
