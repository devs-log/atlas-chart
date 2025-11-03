import type { MatcherResult } from 'vitest';
import type { System } from '../lib/types';

declare module 'vitest' {
  interface Assertion<T> {
    toBeValidSystem(): MatcherResult;
    toHaveValidProgress(): MatcherResult;
    toBeValidInitiative(): MatcherResult;
    toBeValidWorkItem(): MatcherResult;
  }
}

