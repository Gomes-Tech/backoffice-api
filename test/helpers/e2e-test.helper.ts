import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@infra/prisma';

/**
 * Helper class for E2E test setup and teardown
 */
export class E2ETestHelper {
  constructor(
    private readonly app: INestApplication,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Creates a test admin user and returns the user ID
   */
  async createTestAdminUser(
    email: string = 'admin@test.com',
    name: string = 'Test Admin',
  ): Promise<string> {
    const user = await this.prismaService.user.create({
      data: {
        id: `test-user-${Date.now()}`,
        name,
        email,
        password: 'hashed-password',
        roleId: 'admin-role-id',
      },
    });

    return user.id;
  }

  /**
   * Creates a test banner
   */
  async createTestBanner(
    userId: string,
    overrides?: {
      name?: string;
      link?: string;
      order?: number;
      isActive?: boolean;
    },
  ) {
    return await this.prismaService.banner.create({
      data: {
        id: `test-banner-${Date.now()}`,
        name: overrides?.name || 'Test Banner',
        link: overrides?.link || 'https://test.com',
        order: overrides?.order || 1,
        isActive: overrides?.isActive ?? true,
        mobileImageUrl: 'mobile.jpg',
        mobileImageAlt: 'Mobile Alt',
        mobileImageKey: 'mobile-key',
        desktopImageUrl: 'desktop.jpg',
        desktopImageAlt: 'Desktop Alt',
        desktopImageKey: 'desktop-key',
        createdBy: {
          connect: { id: userId },
        },
      },
    });
  }

  /**
   * Deletes all test banners created by a specific user
   */
  async deleteTestBanners(userId: string) {
    await this.prismaService.banner.deleteMany({
      where: {
        createdBy: {
          id: userId,
        },
      },
    });
  }

  /**
   * Deletes a test user
   */
  async deleteTestUser(userId: string) {
    await this.prismaService.user.delete({
      where: {
        id: userId,
      },
    });
  }

  /**
   * Cleans up all test data
   */
  async cleanup(userIds: string[]) {
    // Delete banners first (due to foreign key constraints)
    for (const userId of userIds) {
      await this.deleteTestBanners(userId);
    }

    // Delete users
    await this.prismaService.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
  }

  /**
   * Generates a mock JWT token for testing
   * Note: In a real scenario, you would use your actual JWT service
   */
  generateMockToken(userId: string, role: string = 'admin'): string {
    // This is a simplified mock. In production, use your actual JWT service
    return `mock-jwt-token-${userId}-${role}`;
  }

  /**
   * Waits for a specified amount of time (useful for async operations)
   */
  async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Creates a test database transaction helper
 */
export class DatabaseTransactionHelper {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Executes a callback within a transaction and rolls back after
   * Useful for isolated test scenarios
   */
  async executeInTransaction<T>(
    callback: (prisma: PrismaService) => Promise<T>,
  ): Promise<T> {
    return await this.prismaService.$transaction(async (prisma) => {
      const result = await callback(prisma as PrismaService);
      // Transaction will be rolled back if an error is thrown
      return result;
    });
  }

  /**
   * Clears all data from banner table (use with caution!)
   */
  async clearBannerTable() {
    await this.prismaService.banner.deleteMany({});
  }

  /**
   * Seeds test data for banners
   */
  async seedTestBanners(userId: string, count: number = 5) {
    const banners = [];
    for (let i = 1; i <= count; i++) {
      const banner = await this.prismaService.banner.create({
        data: {
          id: `seed-banner-${i}-${Date.now()}`,
          name: `Seed Banner ${i}`,
          link: `https://seed-banner-${i}.com`,
          order: i,
          isActive: i % 2 === 0, // Alternate active/inactive
          mobileImageUrl: `mobile-${i}.jpg`,
          mobileImageAlt: `Mobile Alt ${i}`,
          mobileImageKey: `mobile-key-${i}`,
          desktopImageUrl: `desktop-${i}.jpg`,
          desktopImageAlt: `Desktop Alt ${i}`,
          desktopImageKey: `desktop-key-${i}`,
          createdBy: {
            connect: { id: userId },
          },
        },
      });
      banners.push(banner);
    }
    return banners;
  }
}
