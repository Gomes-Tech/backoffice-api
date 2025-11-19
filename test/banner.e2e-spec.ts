import { PrismaService } from '@infra/prisma';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Banner (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let adminUserId: string;
  let createdBannerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    // Setup: Create a test admin user and get auth token
    await setupTestUser();
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    await cleanupTestData();
    await app.close();
  });

  const setupTestUser = async () => {
    // Create a test admin user
    const testUser = await prismaService.user.create({
      data: {
        id: 'test-admin-user-id',
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'hashed-password',
        roleId: 'admin-role-id',
      },
    });

    adminUserId = testUser.id;

    // Mock authentication - In a real scenario, you would call the login endpoint
    // For this example, we'll assume you have a way to generate a valid token
    authToken = 'mock-jwt-token';
  };

  const cleanupTestData = async () => {
    // Delete test banners
    await prismaService.banner.deleteMany({
      where: {
        createdBy: {
          id: adminUserId,
        },
      },
    });

    // Delete test user
    await prismaService.user.deleteMany({
      where: {
        id: adminUserId,
      },
    });
  };

  describe('/banners (GET) - Get All Banners', () => {
    it('should return all banners for admin users', () => {
      return request(app.getHttpServer())
        .get('/banners')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer()).get('/banners').expect(401);
    });
  });

  describe('/banners/list (GET) - Get Active Banners List', () => {
    it('should return active banners without authentication (public endpoint)', () => {
      return request(app.getHttpServer())
        .get('/banners/list')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          // All returned banners should be active
          res.body.forEach((banner: any) => {
            expect(banner.isActive).toBe(true);
          });
        });
    });

    it('should return banners with correct structure', () => {
      return request(app.getHttpServer())
        .get('/banners/list')
        .expect(200)
        .expect((res) => {
          if (res.body.length > 0) {
            const banner = res.body[0];
            expect(banner).toHaveProperty('id');
            expect(banner).toHaveProperty('name');
            expect(banner).toHaveProperty('mobileImageUrl');
            expect(banner).toHaveProperty('desktopImageUrl');
            expect(banner).toHaveProperty('order');
            expect(banner).toHaveProperty('isActive');
          }
        });
    });
  });

  describe('/banners/:id (GET) - Get Banner By ID', () => {
    beforeAll(async () => {
      // Create a test banner
      const banner = await prismaService.banner.create({
        data: {
          id: 'test-banner-id',
          name: 'Test Banner',
          link: 'https://test.com',
          order: 1,
          isActive: true,
          mobileImageUrl: 'mobile.jpg',
          mobileImageAlt: 'Mobile Alt',
          mobileImageKey: 'mobile-key',
          desktopImageUrl: 'desktop.jpg',
          desktopImageAlt: 'Desktop Alt',
          desktopImageKey: 'desktop-key',
          createdBy: {
            connect: { id: adminUserId },
          },
        },
      });
      createdBannerId = banner.id;
    });

    it('should return banner by id for admin users', () => {
      return request(app.getHttpServer())
        .get(`/banners/${createdBannerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdBannerId);
          expect(res.body).toHaveProperty('name', 'Test Banner');
        });
    });

    it('should return 404 for non-existent banner', () => {
      return request(app.getHttpServer())
        .get('/banners/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/banners/${createdBannerId}`)
        .expect(401);
    });
  });

  describe('/banners (POST) - Create Banner', () => {
    it('should create a new banner with images', () => {
      return request(app.getHttpServer())
        .post('/banners')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'New E2E Banner')
        .field('link', 'https://e2e-test.com')
        .field('order', '1')
        .field('isActive', 'true')
        .attach('desktop', Buffer.from('desktop-image'), 'desktop.jpg')
        .attach('mobile', Buffer.from('mobile-image'), 'mobile.jpg')
        .expect(201);
    });

    it('should return 400 if desktop image is missing', () => {
      return request(app.getHttpServer())
        .post('/banners')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Invalid Banner')
        .field('link', 'https://test.com')
        .field('order', '1')
        .field('isActive', 'true')
        .attach('mobile', Buffer.from('mobile-image'), 'mobile.jpg')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('desktop e mobile são obrigatórias');
        });
    });

    it('should return 400 if mobile image is missing', () => {
      return request(app.getHttpServer())
        .post('/banners')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Invalid Banner')
        .field('link', 'https://test.com')
        .field('order', '1')
        .field('isActive', 'true')
        .attach('desktop', Buffer.from('desktop-image'), 'desktop.jpg')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('desktop e mobile são obrigatórias');
        });
    });

    it('should return 400 with invalid data', () => {
      return request(app.getHttpServer())
        .post('/banners')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', '') // Empty name
        .field('order', 'invalid') // Invalid order
        .attach('desktop', Buffer.from('desktop-image'), 'desktop.jpg')
        .attach('mobile', Buffer.from('mobile-image'), 'mobile.jpg')
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/banners')
        .field('name', 'Unauthorized Banner')
        .expect(401);
    });
  });

  describe('/banners/:id (PATCH) - Update Banner', () => {
    let bannerToUpdate: string;

    beforeAll(async () => {
      const banner = await prismaService.banner.create({
        data: {
          id: 'banner-to-update',
          name: 'Original Banner',
          link: 'https://original.com',
          order: 1,
          isActive: true,
          mobileImageUrl: 'original-mobile.jpg',
          mobileImageAlt: 'Mobile Alt',
          mobileImageKey: 'mobile-key',
          desktopImageUrl: 'original-desktop.jpg',
          desktopImageAlt: 'Desktop Alt',
          desktopImageKey: 'desktop-key',
          createdBy: {
            connect: { id: adminUserId },
          },
        },
      });
      bannerToUpdate = banner.id;
    });

    it('should update banner without new images', () => {
      return request(app.getHttpServer())
        .patch(`/banners/${bannerToUpdate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Updated Banner Name')
        .field('link', 'https://updated.com')
        .field('isActive', 'false')
        .expect(204);
    });

    it('should update banner with new desktop image', () => {
      return request(app.getHttpServer())
        .patch(`/banners/${bannerToUpdate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Updated with Desktop')
        .attach('desktop', Buffer.from('new-desktop-image'), 'new-desktop.jpg')
        .expect(204);
    });

    it('should update banner with new mobile image', () => {
      return request(app.getHttpServer())
        .patch(`/banners/${bannerToUpdate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Updated with Mobile')
        .attach('mobile', Buffer.from('new-mobile-image'), 'new-mobile.jpg')
        .expect(204);
    });

    it('should update banner with both new images', () => {
      return request(app.getHttpServer())
        .patch(`/banners/${bannerToUpdate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Updated with Both Images')
        .attach('desktop', Buffer.from('new-desktop-image'), 'new-desktop.jpg')
        .attach('mobile', Buffer.from('new-mobile-image'), 'new-mobile.jpg')
        .expect(204);
    });

    it('should return 404 for non-existent banner', () => {
      return request(app.getHttpServer())
        .patch('/banners/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Updated Name')
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/banners/${bannerToUpdate}`)
        .field('name', 'Unauthorized Update')
        .expect(401);
    });
  });

  describe('/banners/:id (DELETE) - Delete Banner', () => {
    let bannerToDelete: string;

    beforeEach(async () => {
      const banner = await prismaService.banner.create({
        data: {
          id: `banner-to-delete-${Date.now()}`,
          name: 'Banner to Delete',
          link: 'https://delete.com',
          order: 1,
          isActive: true,
          mobileImageUrl: 'delete-mobile.jpg',
          mobileImageAlt: 'Mobile Alt',
          mobileImageKey: 'mobile-key',
          desktopImageUrl: 'delete-desktop.jpg',
          desktopImageAlt: 'Desktop Alt',
          desktopImageKey: 'desktop-key',
          createdBy: {
            connect: { id: adminUserId },
          },
        },
      });
      bannerToDelete = banner.id;
    });

    it('should soft delete a banner', async () => {
      await request(app.getHttpServer())
        .delete(`/banners/${bannerToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify banner is soft deleted
      const deletedBanner = await prismaService.banner.findUnique({
        where: { id: bannerToDelete },
      });

      expect(deletedBanner?.isDeleted).toBe(true);
    });

    it('should return 404 for non-existent banner', () => {
      return request(app.getHttpServer())
        .delete('/banners/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/banners/${bannerToDelete}`)
        .expect(401);
    });
  });

  describe('Banner Workflow (Integration)', () => {
    it('should complete full CRUD workflow', async () => {
      let bannerId: string;

      // 1. Create a banner
      const createResponse = await request(app.getHttpServer())
        .post('/banners')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Workflow Banner')
        .field('link', 'https://workflow.com')
        .field('order', '1')
        .field('isActive', 'true')
        .attach('desktop', Buffer.from('desktop-image'), 'desktop.jpg')
        .attach('mobile', Buffer.from('mobile-image'), 'mobile.jpg')
        .expect(201);

      // Extract banner ID from response or database
      const createdBanner = await prismaService.banner.findFirst({
        where: { name: 'Workflow Banner' },
      });
      bannerId = createdBanner!.id;

      // 2. Read the banner
      await request(app.getHttpServer())
        .get(`/banners/${bannerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Workflow Banner');
        });

      // 3. Update the banner
      await request(app.getHttpServer())
        .patch(`/banners/${bannerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Updated Workflow Banner')
        .field('isActive', 'false')
        .expect(204);

      // 4. Verify update
      const updatedBanner = await prismaService.banner.findUnique({
        where: { id: bannerId },
      });
      expect(updatedBanner?.name).toBe('Updated Workflow Banner');
      expect(updatedBanner?.isActive).toBe(false);

      // 5. Delete the banner
      await request(app.getHttpServer())
        .delete(`/banners/${bannerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // 6. Verify deletion
      const deletedBanner = await prismaService.banner.findUnique({
        where: { id: bannerId },
      });
      expect(deletedBanner?.isDeleted).toBe(true);
    });
  });
});
