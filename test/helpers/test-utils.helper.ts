/**
 * Test utilities and assertion helpers
 */
export class TestUtils {
  /**
   * Checks if an object has all required properties
   */
  static hasRequiredProperties<T extends object>(
    obj: T,
    properties: (keyof T)[],
  ): boolean {
    return properties.every((prop) => prop in obj);
  }

  /**
   * Validates banner structure
   */
  static isValidBannerStructure(banner: any): boolean {
    const requiredProps = [
      'id',
      'name',
      'mobileImageUrl',
      'mobileImageAlt',
      'desktopImageUrl',
      'desktopImageAlt',
      'order',
      'isActive',
    ];

    return requiredProps.every((prop) => prop in banner);
  }

  /**
   * Validates list banner structure
   */
  static isValidListBannerStructure(banner: any): boolean {
    const requiredProps = [
      'id',
      'name',
      'mobileImageUrl',
      'mobileImageAlt',
      'desktopImageUrl',
      'desktopImageAlt',
      'order',
      'isActive',
      'createdAt',
      'createdBy',
    ];

    return requiredProps.every((prop) => prop in banner);
  }

  /**
   * Generates a random string
   */
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generates a random email
   */
  static randomEmail(): string {
    return `test-${this.randomString(8)}@example.com`;
  }

  /**
   * Generates a random URL
   */
  static randomUrl(): string {
    return `https://${this.randomString(10)}.com`;
  }

  /**
   * Creates a delay (useful for testing async operations)
   */
  static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Sorts an array of objects by a specific property
   */
  static sortByProperty<T>(array: T[], property: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Checks if an array is sorted by a specific property
   */
  static isSortedByProperty<T>(
    array: T[],
    property: keyof T,
    order: 'asc' | 'desc' = 'asc',
  ): boolean {
    for (let i = 0; i < array.length - 1; i++) {
      const current = array[i][property];
      const next = array[i + 1][property];

      if (order === 'asc' && current > next) return false;
      if (order === 'desc' && current < next) return false;
    }
    return true;
  }

  /**
   * Filters active items from an array
   */
  static filterActive<T extends { isActive: boolean }>(array: T[]): T[] {
    return array.filter((item) => item.isActive);
  }

  /**
   * Creates a mock date range
   */
  static createDateRange(daysFromNow: number = 30): { start: Date; end: Date } {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + daysFromNow);

    return { start, end };
  }

  /**
   * Checks if a date is within a range
   */
  static isDateInRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
  }

  /**
   * Deep clones an object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Compares two objects for equality (shallow)
   */
  static shallowEqual(obj1: any, obj2: any): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every((key) => obj1[key] === obj2[key]);
  }

  /**
   * Removes undefined properties from an object
   */
  static removeUndefined<T extends object>(obj: T): Partial<T> {
    const result: any = {};
    Object.keys(obj).forEach((key) => {
      const value = obj[key as keyof T];
      if (value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  }

  /**
   * Creates a mock buffer for file uploads
   */
  static createMockBuffer(content: string = 'mock-content'): Buffer {
    return Buffer.from(content);
  }

  /**
   * Validates image URL format
   */
  static isValidImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  }

  /**
   * Extracts error message from various error types
   */
  static extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return 'Unknown error';
  }

  /**
   * Checks if a value is a valid UUID
   */
  static isValidUUID(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Creates a range of numbers
   */
  static range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  /**
   * Chunks an array into smaller arrays
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * Custom matchers for Jest
 */
export const customMatchers = {
  toBeValidBanner(received: any) {
    const pass = TestUtils.isValidBannerStructure(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${JSON.stringify(received)} not to be a valid banner`
          : `Expected ${JSON.stringify(received)} to be a valid banner`,
    };
  },

  toBeValidListBanner(received: any) {
    const pass = TestUtils.isValidListBannerStructure(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${JSON.stringify(received)} not to be a valid list banner`
          : `Expected ${JSON.stringify(received)} to be a valid list banner`,
    };
  },

  toBeSortedByOrder(received: any[]) {
    const pass = TestUtils.isSortedByProperty(received, 'order', 'asc');
    return {
      pass,
      message: () =>
        pass
          ? `Expected array not to be sorted by order`
          : `Expected array to be sorted by order`,
    };
  },
};
