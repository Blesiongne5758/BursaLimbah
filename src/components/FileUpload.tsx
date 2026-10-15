/**
 * File Upload Component
 * Direct upload to S3 using pre-signed URLs
 * 
 * Features:
 * - Pre-signed URL upload (no server bandwidth)
 * - Client-side validation (MIME type, size)
 * - Progress indicator
 * - Multiple file support
 * - Image preview
 * - Error handling
 */

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, File, Image as ImageIcon } from 'lucide-react';
import { api } from '../lib/api';

interface FileUploadProps {
  category: 'listing' | 'profile' | 'kyc' | 'chat' | 'validation';
  maxFiles?: number;
  accept?: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onError?: (error: string) => void;
}

export interface UploadedFile {
  id: string;
  key: string;
  url: string;
  thumbnailUrl?: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  uploadedFile?: UploadedFile;
}

// File size limits (in bytes)
const MAX_FILE_SIZES = {
  listing: 5 * 1024 * 1024, // 5MB
  profile: 2 * 1024 * 1024, // 2MB
  kyc: 10 * 1024 * 1024, // 10MB
  chat: 5 * 1024 * 1024, // 5MB
  validation: 10 * 1024 * 1024, // 10MB
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  listing: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  profile: ['image/jpeg', 'image/png', 'image/webp'],
  kyc: ['image/jpeg', 'image/png', 'application/pdf'],
  chat: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
  validation: ['image/jpeg', 'image/png', 'image/webp'],
};

export function FileUpload({
  category,
  maxFiles = 10,
  accept,
  onUploadComplete,
  onError,
}: FileUploadProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSize = MAX_FILE_SIZES[category];
  const allowedTypes = ALLOWED_MIME_TYPES[category];

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `Ukuran file terlalu besar. Maksimal: ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }

    // Check MIME type
    if (!allowedTypes.includes(file.type)) {
      return `Tipe file tidak diizinkan. Diperbolehkan: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  /**
   * Upload single file using pre-signed URL
   */
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    // Step 1: Get pre-signed URL from backend
    const presignResponse = await api.upload.presign({
      category,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    });

    const { uploadUrl, key, bucket } = presignResponse.data;

    // Step 2: Upload directly to S3
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploads(prev => prev.map(u => 
            u.file === file ? { ...u, progress } : u
          ));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Step 3: Confirm upload with backend
          api.upload.confirm({
            key,
            bucket,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            category,
          }).then(response => {
            resolve(response.data);
          }).catch(reject);
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  /**
   * Handle file selection
   */
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check max files limit
    if (uploads.length + fileArray.length > maxFiles) {
      const error = `Maksimal ${maxFiles} file`;
      onError?.(error);
      return;
    }

    // Validate all files
    const validationErrors: Array<{ file: File; error: string }> = [];
    
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push({ file, error });
      }
    });

    if (validationErrors.length > 0) {
      validationErrors.forEach(({ file, error }) => {
        setUploads(prev => [...prev, {
          file,
          progress: 0,
          status: 'error',
          error,
        }]);
      });
      return;
    }

    // Add files to upload queue
    const newUploads: UploadProgress[] = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload files
    for (const upload of newUploads) {
      try {
        setUploads(prev => prev.map(u => 
          u.file === upload.file ? { ...u, status: 'uploading' } : u
        ));

        const uploadedFile = await uploadFile(upload.file);

        setUploads(prev => prev.map(u => 
          u.file === upload.file 
            ? { ...u, status: 'success', progress: 100, uploadedFile }
            : u
        ));
      } catch (error) {
        setUploads(prev => prev.map(u => 
          u.file === upload.file 
            ? { ...u, status: 'error', error: 'Upload gagal' }
            : u
        ));
      }
    }

    // Call onUploadComplete with successful uploads
    const successfulUploads = uploads
      .filter(u => u.status === 'success' && u.uploadedFile)
      .map(u => u.uploadedFile!);

    if (successfulUploads.length > 0) {
      onUploadComplete?.(successfulUploads);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  /**
   * Remove file from upload queue
   */
  const removeFile = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Get file preview URL
   */
  const getPreviewUrl = (file: File): string => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-emerald-500 bg-emerald-50' 
            : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
          }
        `}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-sm font-medium text-slate-700 mb-1">
          Drag & drop file atau klik untuk upload
        </p>
        <p className="text-xs text-slate-500">
          Maksimal {(maxSize / 1024 / 1024).toFixed(1)}MB per file
          {maxFiles > 1 && ` • Maksimal ${maxFiles} file`}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Format: {allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={accept || allowedTypes.join(',')}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          {uploads.map((upload, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              {/* File Preview */}
              <div className="flex-shrink-0">
                {upload.file.type.startsWith('image/') ? (
                  <img
                    src={getPreviewUrl(upload.file)}
                    alt={upload.file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : upload.file.type === 'application/pdf' ? (
                  <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                    <File className="w-6 h-6 text-red-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center">
                    <File className="w-6 h-6 text-slate-600" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {upload.file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {/* Progress Bar */}
                {upload.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">Uploading...</span>
                      <span className="text-xs text-slate-600">{Math.round(upload.progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status */}
                {upload.status === 'success' && (
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-emerald-600">Upload berhasil</span>
                  </div>
                )}

                {upload.status === 'error' && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-red-600">{upload.error}</span>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="flex-shrink-0 p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
