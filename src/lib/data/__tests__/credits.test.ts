import { describe, it, expect } from 'vitest';
import { getPackages, getImageCredits, PYTHON_PACKAGES, IMAGES } from '../credits.js';

describe('credits data', () => {
  it('returns at least one package', () => {
    expect(getPackages().length).toBeGreaterThan(0);
  });

  it('each package has name, url, and desc for all three locales', () => {
    for (const pkg of PYTHON_PACKAGES) {
      expect(pkg.name).toBeTruthy();
      expect(pkg.url).toBeTruthy();
      expect(pkg.desc.nl).toBeTruthy();
      expect(pkg.desc.de).toBeTruthy();
      expect(pkg.desc.en).toBeTruthy();
    }
  });

  it('returns at least one image credit', () => {
    expect(getImageCredits().length).toBeGreaterThan(0);
  });

  it('each image credit has required fields', () => {
    for (const img of IMAGES) {
      expect(img.category).toBeTruthy();
      expect(img.imagePath).toBeTruthy();
      expect(img.source).toBeTruthy();
      expect(img.desc.nl).toBeTruthy();
      expect(img.desc.de).toBeTruthy();
      expect(img.desc.en).toBeTruthy();
    }
  });

  it('image paths start with /images/', () => {
    for (const img of IMAGES) {
      expect(img.imagePath).toMatch(/^\/images\//);
    }
  });
});
