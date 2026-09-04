import { describe, it, expect } from 'vitest';
import { FakePlateLookupAdapter } from './fake-plate-lookup.adapter.js';

describe('FakePlateLookupAdapter', () => {
  let adapter: FakePlateLookupAdapter;

  beforeEach(() => {
    adapter = new FakePlateLookupAdapter();
  });

  it('should return car info for a known clean plate', () => {
    const result = adapter.lookup('ABC-1234');
    expect(result).not.toBeNull();
    expect(result?.ownerName).toBe('Ahmed Ali');
    expect(result?.carModel).toBe('Toyota Corolla');
    expect(result?.isBlacklisted).toBe(false);
  });

  it('should return car info with isBlacklisted=true for a blacklisted plate', () => {
    const result = adapter.lookup('XYZ-9999');
    expect(result).not.toBeNull();
    expect(result?.isBlacklisted).toBe(true);
  });

  it('should return null for an unknown plate', () => {
    const result = adapter.lookup('ZZZ-0000');
    expect(result).toBeNull();
  });

  it('should be case-sensitive — lowercase plate should not match', () => {
    const result = adapter.lookup('abc-1234');
    expect(result).toBeNull();
  });
});
