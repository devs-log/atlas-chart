import '@testing-library/jest-dom';
import { expect } from 'vitest';
import { customMatchers } from './utils';

// Extend vitest matchers with custom matchers
expect.extend(customMatchers);













