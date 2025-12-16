import { FileSystemService } from '../fileSystem';
import { Paths, File } from 'expo-file-system';

// Mock expo-file-system
jest.mock('expo-file-system', () => {
  const mockFile = {
    uri: 'file:///mock/path/test.pdf',
    exists: true,
    parentDirectory: {
      exists: true,
      create: jest.fn(),
    },
    write: jest.fn(),
    text: jest.fn().mockResolvedValue('mock text content'),
    base64: jest.fn().mockResolvedValue('bW9jayBiYXNlNjQ='),
    delete: jest.fn(),
  };

  const mockDirectory = {
    uri: 'file:///mock/cache/',
    exists: true,
    create: jest.fn(),
  };

  return {
    Paths: {
      cache: mockDirectory,
      document: { uri: 'file:///mock/documents/' },
    },
    File: jest.fn().mockImplementation((path: string) => {
      if (typeof path === 'string' && path.startsWith('file://')) {
        return { ...mockFile, uri: path };
      }
      return mockFile;
    }),
  };
});

describe('FileSystemService', () => {
  let service: FileSystemService;
  let mockFileInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FileSystemService();
    mockFileInstance = (File as jest.Mock).mock.results[0]?.value || {
      uri: 'file:///mock/path/test.pdf',
      exists: true,
      parentDirectory: {
        exists: true,
        create: jest.fn(),
      },
      write: jest.fn(),
      text: jest.fn().mockResolvedValue('mock text content'),
      base64: jest.fn().mockResolvedValue('bW9jayBiYXNlNjQ='),
      delete: jest.fn(),
    };
  });

  describe('writeFile', () => {
    it('should write a file with utf8 encoding by default', async () => {
      const content = 'Hello, World!';
      const fileName = 'test.txt';

      const uri = await service.writeFile(fileName, content);

      expect(File).toHaveBeenCalled();
      expect(uri).toBeDefined();
    });

    it('should write a file with base64 encoding', async () => {
      const content = 'SGVsbG8sIFdvcmxkIQ==';
      const fileName = 'test.pdf';

      const uri = await service.writeFile(fileName, content, { encoding: 'base64' });

      expect(File).toHaveBeenCalled();
      expect(uri).toBeDefined();
    });

    it('should handle full file paths', async () => {
      const content = 'Test content';
      const filePath = 'file:///full/path/to/file.txt';

      const uri = await service.writeFile(filePath, content);

      expect(File).toHaveBeenCalledWith(filePath);
      expect(uri).toBeDefined();
    });

    it('should create parent directory if it does not exist', async () => {
      const mockFileWithoutParent = {
        ...mockFileInstance,
        parentDirectory: {
          exists: false,
          create: jest.fn(),
        },
        write: jest.fn(),
      };

      (File as jest.Mock).mockImplementationOnce(() => mockFileWithoutParent);

      await service.writeFile('test.txt', 'content');

      expect(mockFileWithoutParent.parentDirectory.create).toHaveBeenCalled();
    });
  });

  describe('writeBase64File', () => {
    it('should write a base64 encoded file', async () => {
      const base64Content = 'SGVsbG8sIFdvcmxkIQ==';
      const fileName = 'report.pdf';

      const uri = await service.writeBase64File(fileName, base64Content);

      expect(File).toHaveBeenCalled();
      expect(uri).toBeDefined();
    });
  });

  describe('readFile', () => {
    it('should read a file with utf8 encoding by default', async () => {
      const filePath = 'file:///path/to/file.txt';
      const mockFile = {
        exists: true,
        text: jest.fn().mockResolvedValue('File content'),
        base64: jest.fn(),
      };
      (File as jest.Mock).mockImplementationOnce(() => mockFile);

      const content = await service.readFile(filePath);

      expect(content).toBe('File content');
      expect(mockFile.text).toHaveBeenCalled();
    });

    it('should read a file with base64 encoding', async () => {
      const filePath = 'file:///path/to/file.pdf';
      const mockFile = {
        exists: true,
        text: jest.fn(),
        base64: jest.fn().mockResolvedValue('base64content'),
      };
      (File as jest.Mock).mockImplementationOnce(() => mockFile);

      const content = await service.readFile(filePath, { encoding: 'base64' });

      expect(content).toBe('base64content');
      expect(mockFile.base64).toHaveBeenCalled();
    });

    it('should throw an error if file does not exist', async () => {
      const mockNonExistentFile = {
        ...mockFileInstance,
        exists: false,
      };

      (File as jest.Mock).mockImplementationOnce(() => mockNonExistentFile);

      await expect(service.readFile('file:///nonexistent.txt')).rejects.toThrow(
        'File does not exist'
      );
    });
  });

  describe('readBase64File', () => {
    it('should read a base64 encoded file', async () => {
      const filePath = 'file:///path/to/file.pdf';
      const mockFile = {
        exists: true,
        text: jest.fn(),
        base64: jest.fn().mockResolvedValue('base64data'),
      };
      (File as jest.Mock).mockImplementationOnce(() => mockFile);

      const content = await service.readBase64File(filePath);

      expect(content).toBe('base64data');
      expect(mockFile.base64).toHaveBeenCalled();
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', () => {
      const exists = service.fileExists('file:///path/to/file.txt');

      expect(exists).toBe(true);
    });

    it('should return false if file does not exist', () => {
      const mockNonExistentFile = {
        ...mockFileInstance,
        exists: false,
      };

      (File as jest.Mock).mockImplementationOnce(() => mockNonExistentFile);

      const exists = service.fileExists('file:///nonexistent.txt');

      expect(exists).toBe(false);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file if it exists', async () => {
      const mockFile = {
        exists: true,
        delete: jest.fn(),
      };
      (File as jest.Mock).mockImplementationOnce(() => mockFile);

      await service.deleteFile('file:///path/to/file.txt');

      expect(mockFile.delete).toHaveBeenCalled();
    });

    it('should not throw an error if file does not exist', async () => {
      const mockNonExistentFile = {
        ...mockFileInstance,
        exists: false,
        delete: jest.fn(),
      };

      (File as jest.Mock).mockImplementationOnce(() => mockNonExistentFile);

      await expect(service.deleteFile('file:///nonexistent.txt')).resolves.not.toThrow();
      expect(mockNonExistentFile.delete).not.toHaveBeenCalled();
    });
  });

  describe('getCacheDirectory', () => {
    it('should return the cache directory URI', () => {
      const cacheDir = service.getCacheDirectory();

      expect(cacheDir).toBe('file:///mock/cache/');
    });
  });

  describe('getDocumentDirectory', () => {
    it('should return the document directory URI', () => {
      const docDir = service.getDocumentDirectory();

      expect(docDir).toBe('file:///mock/documents/');
    });
  });

  describe('writeToDocuments', () => {
    it('should write a file to the documents directory', async () => {
      const fileName = 'report.pdf';
      const content = 'Document content';

      const uri = await service.writeToDocuments(fileName, content);

      expect(File).toHaveBeenCalled();
      expect(uri).toBeDefined();
    });

    it('should write a file with base64 encoding to documents', async () => {
      const fileName = 'report.pdf';
      const base64Content = 'SGVsbG8=';

      const uri = await service.writeToDocuments(fileName, base64Content, { encoding: 'base64' });

      expect(File).toHaveBeenCalled();
      expect(uri).toBeDefined();
    });

    it('should create parent directory if it does not exist', async () => {
      const mockFileWithoutParent = {
        ...mockFileInstance,
        parentDirectory: {
          exists: false,
          create: jest.fn(),
        },
        write: jest.fn(),
      };

      (File as jest.Mock).mockImplementationOnce(() => mockFileWithoutParent);

      await service.writeToDocuments('test.txt', 'content');

      expect(mockFileWithoutParent.parentDirectory.create).toHaveBeenCalled();
    });
  });

  describe('writeBase64ToDocuments', () => {
    it('should write a base64 file to the documents directory', async () => {
      const fileName = 'report.pdf';
      const base64Content = 'SGVsbG8sIFdvcmxkIQ==';

      const uri = await service.writeBase64ToDocuments(fileName, base64Content);

      expect(File).toHaveBeenCalled();
      expect(uri).toBeDefined();
    });
  });
});
