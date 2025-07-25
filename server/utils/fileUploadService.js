const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;

class FileUploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.initializeDirectories();
  }

  async initializeDirectories() {
    try {
      // Create main uploads directory
      await fs.mkdir(this.uploadDir, { recursive: true });
      
      // Create subdirectories for different file types
      const subdirs = ['announcements', 'lost-found', 'complaints', 'profiles', 'temp'];
      for (const subdir of subdirs) {
        await fs.mkdir(path.join(this.uploadDir, subdir), { recursive: true });
      }
      
      console.log('Upload directories initialized');
    } catch (error) {
      console.error('Error initializing upload directories:', error);
    }
  }

  // Generate unique filename
  generateFileName(originalName, prefix = '') {
    const ext = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const random = crypto.randomBytes(6).toString('hex');
    return `${prefix}${timestamp}-${random}${ext}`;
  }

  // Configure multer storage for different upload types
  getStorageConfig(uploadType) {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(this.uploadDir, uploadType);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const fileName = this.generateFileName(file.originalname, `${uploadType}-`);
        cb(null, fileName);
      }
    });
  }

  // File filter for different file types
  createFileFilter(allowedTypes, maxSize = 5 * 1024 * 1024) {
    return (req, file, cb) => {
      // Check file type
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
      }
    };
  }

  // Create multer upload middleware for images
  createImageUpload(uploadType, options = {}) {
    const {
      maxFiles = 5,
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    } = options;

    return multer({
      storage: this.getStorageConfig(uploadType),
      limits: {
        fileSize: maxSize,
        files: maxFiles
      },
      fileFilter: this.createFileFilter(allowedTypes)
    });
  }

  // Create multer upload middleware for documents
  createDocumentUpload(uploadType, options = {}) {
    const {
      maxFiles = 3,
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
    } = options;

    return multer({
      storage: this.getStorageConfig(uploadType),
      limits: {
        fileSize: maxSize,
        files: maxFiles
      },
      fileFilter: this.createFileFilter(allowedTypes)
    });
  }

  // Upload middleware for announcements
  getAnnouncementUpload() {
    return this.createImageUpload('announcements', {
      maxFiles: 3,
      maxSize: 8 * 1024 * 1024 // 8MB
    });
  }

  // Upload middleware for lost & found items
  getLostFoundUpload() {
    return this.createImageUpload('lost-found', {
      maxFiles: 5,
      maxSize: 5 * 1024 * 1024 // 5MB
    });
  }

  // Upload middleware for complaints
  getComplaintUpload() {
    return this.createImageUpload('complaints', {
      maxFiles: 5,
      maxSize: 5 * 1024 * 1024 // 5MB
    });
  }

  // Upload middleware for profile pictures
  getProfileUpload() {
    return this.createImageUpload('profiles', {
      maxFiles: 1,
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png']
    });
  }

  // Process uploaded files and return file info
  processUploadedFiles(files, baseUrl) {
    if (!files || files.length === 0) {
      return [];
    }

    return files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `${baseUrl}/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));
  }

  // Delete file
  async deleteFile(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(this.uploadDir, filePath);
      
      await fs.unlink(fullPath);
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete multiple files
  async deleteFiles(filePaths) {
    const results = [];
    
    for (const filePath of filePaths) {
      const result = await this.deleteFile(filePath);
      results.push({ filePath, ...result });
    }
    
    return results;
  }

  // Get file info
  async getFileInfo(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(this.uploadDir, filePath);
      
      const stats = await fs.stat(fullPath);
      
      return {
        success: true,
        fileInfo: {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory()
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Clean up old temp files
  async cleanupTempFiles(maxAgeHours = 24) {
    try {
      const tempDir = path.join(this.uploadDir, 'temp');
      const files = await fs.readdir(tempDir);
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (Date.now() - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      console.log(`Cleaned up ${deletedCount} temp files`);
      return { success: true, deletedCount };
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
      return { success: false, error: error.message };
    }
  }

  // Get directory size
  async getDirectorySize(dirPath) {
    try {
      const fullPath = path.isAbsolute(dirPath) 
        ? dirPath 
        : path.join(this.uploadDir, dirPath);
      
      const files = await fs.readdir(fullPath, { withFileTypes: true });
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(fullPath, file.name);
        
        if (file.isFile()) {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        } else if (file.isDirectory()) {
          const subDirSize = await this.getDirectorySize(filePath);
          totalSize += subDirSize.size || 0;
        }
      }

      return { success: true, size: totalSize };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate file before upload
  validateFile(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024,
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds limit of ${this.formatFileSize(maxSize)}`);
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      errors.push(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get upload statistics
  async getUploadStats() {
    try {
      const stats = {};
      const subdirs = ['announcements', 'lost-found', 'complaints', 'profiles', 'temp'];

      for (const subdir of subdirs) {
        const dirPath = path.join(this.uploadDir, subdir);
        const files = await fs.readdir(dirPath);
        const sizeResult = await this.getDirectorySize(dirPath);
        
        stats[subdir] = {
          fileCount: files.length,
          totalSize: sizeResult.size || 0,
          formattedSize: this.formatFileSize(sizeResult.size || 0)
        };
      }

      // Calculate totals
      const totalFiles = Object.values(stats).reduce((sum, stat) => sum + stat.fileCount, 0);
      const totalSize = Object.values(stats).reduce((sum, stat) => sum + stat.totalSize, 0);

      return {
        success: true,
        stats: {
          ...stats,
          totals: {
            fileCount: totalFiles,
            totalSize: totalSize,
            formattedSize: this.formatFileSize(totalSize)
          }
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const fileUploadService = new FileUploadService();

module.exports = fileUploadService;
