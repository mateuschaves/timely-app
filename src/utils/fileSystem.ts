import { Paths, File } from 'expo-file-system';

export interface WriteFileOptions {
  encoding?: 'utf8' | 'base64';
}

export interface ReadFileOptions {
  encoding?: 'utf8' | 'base64';
}

/**
 * FileSystem service for handling file operations
 * Provides a clean abstraction over expo-file-system
 */
export class FileSystemService {
  /**
   * Write content to a file
   * @param filePath - Full path to the file or filename (will be placed in cache directory)
   * @param content - Content to write (string)
   * @param options - Write options including encoding
   * @returns The URI of the written file
   */
  async writeFile(
    filePath: string,
    content: string,
    options: WriteFileOptions = {}
  ): Promise<string> {
    const { encoding = 'utf8' } = options;
    
    // Determine if filePath is a full path or just a filename
    const file = filePath.startsWith('file://')
      ? new File(filePath)
      : new File(Paths.cache, filePath);

    // Ensure parent directory exists
    if (!file.parentDirectory.exists) {
      file.parentDirectory.create();
    }

    // Write the file with specified encoding
    file.write(content, { encoding });

    return file.uri;
  }

  /**
   * Write base64 content to a file
   * @param filePath - Full path to the file or filename (will be placed in cache directory)
   * @param base64Content - Base64 encoded content
   * @returns The URI of the written file
   */
  async writeBase64File(filePath: string, base64Content: string): Promise<string> {
    return this.writeFile(filePath, base64Content, { encoding: 'base64' });
  }

  /**
   * Read content from a file
   * @param filePath - Full path to the file
   * @param options - Read options including encoding
   * @returns The content of the file
   */
  async readFile(filePath: string, options: ReadFileOptions = {}): Promise<string> {
    const { encoding = 'utf8' } = options;
    
    const file = new File(filePath);

    if (!file.exists) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    if (encoding === 'base64') {
      return file.base64();
    }

    return file.text();
  }

  /**
   * Read base64 content from a file
   * @param filePath - Full path to the file
   * @returns The base64 encoded content
   */
  async readBase64File(filePath: string): Promise<string> {
    return this.readFile(filePath, { encoding: 'base64' });
  }

  /**
   * Check if a file exists
   * @param filePath - Full path to the file
   * @returns True if file exists, false otherwise
   */
  fileExists(filePath: string): boolean {
    const file = new File(filePath);
    return file.exists;
  }

  /**
   * Delete a file
   * @param filePath - Full path to the file
   */
  async deleteFile(filePath: string): Promise<void> {
    const file = new File(filePath);
    
    if (file.exists) {
      file.delete();
    }
  }

  /**
   * Get the cache directory path
   * @returns Cache directory URI
   */
  getCacheDirectory(): string {
    return Paths.cache.uri;
  }

  /**
   * Get the document directory path
   * @returns Document directory URI
   */
  getDocumentDirectory(): string {
    return Paths.document.uri;
  }

  /**
   * Write a file to the document directory (persistent storage)
   * @param fileName - Name of the file
   * @param content - Content to write
   * @param options - Write options including encoding
   * @returns The URI of the written file
   */
  async writeToDocuments(
    fileName: string,
    content: string,
    options: WriteFileOptions = {}
  ): Promise<string> {
    const file = new File(Paths.document, fileName);
    const { encoding = 'utf8' } = options;

    // Ensure parent directory exists
    if (!file.parentDirectory.exists) {
      file.parentDirectory.create();
    }

    file.write(content, { encoding });

    return file.uri;
  }

  /**
   * Write a base64 file to the document directory
   * @param fileName - Name of the file
   * @param base64Content - Base64 encoded content
   * @returns The URI of the written file
   */
  async writeBase64ToDocuments(fileName: string, base64Content: string): Promise<string> {
    return this.writeToDocuments(fileName, base64Content, { encoding: 'base64' });
  }
}

// Export a singleton instance
export const fileSystemService = new FileSystemService();
