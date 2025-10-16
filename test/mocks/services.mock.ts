/**
 * Mock implementation of PrismaService for testing
 */
export class MockPrismaService {
  banner = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  };

  user = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  };

  /**
   * Resets all mocks
   */
  resetMocks() {
    Object.values(this.banner).forEach((mock) => {
      if (typeof mock === 'function' && 'mockReset' in mock) {
        mock.mockReset();
      }
    });
    Object.values(this.user).forEach((mock) => {
      if (typeof mock === 'function' && 'mockReset' in mock) {
        mock.mockReset();
      }
    });
  }
}

/**
 * Mock implementation of AdvancedLoggerService for testing
 */
export class MockLoggerService {
  setContext = jest.fn();
  log = jest.fn();
  debug = jest.fn();
  warn = jest.fn();
  error = jest.fn();
  verbose = jest.fn();
  logPerformance = jest.fn();
  logDatabaseError = jest.fn();

  /**
   * Resets all mocks
   */
  resetMocks() {
    this.setContext.mockReset();
    this.log.mockReset();
    this.debug.mockReset();
    this.warn.mockReset();
    this.error.mockReset();
    this.verbose.mockReset();
    this.logPerformance.mockReset();
    this.logDatabaseError.mockReset();
  }
}

/**
 * Mock implementation of StorageService for testing
 */
export class MockStorageService {
  uploadFile = jest.fn();
  deleteFile = jest.fn();
  getFileUrl = jest.fn();

  /**
   * Resets all mocks
   */
  resetMocks() {
    this.uploadFile.mockReset();
    this.deleteFile.mockReset();
    this.getFileUrl.mockReset();
  }

  /**
   * Sets up default successful upload behavior
   */
  setupSuccessfulUpload() {
    this.uploadFile.mockImplementation((folder: string, filename: string) => {
      return Promise.resolve({
        path: `${folder}/${filename}`,
        publicUrl: `https://storage.example.com/${folder}/${filename}`,
      });
    });
  }
}

/**
 * Mock implementation of BannerRepository for testing
 */
export class MockBannerRepository {
  findAll = jest.fn();
  findList = jest.fn();
  findById = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();

  /**
   * Resets all mocks
   */
  resetMocks() {
    this.findAll.mockReset();
    this.findList.mockReset();
    this.findById.mockReset();
    this.create.mockReset();
    this.update.mockReset();
    this.delete.mockReset();
  }
}
