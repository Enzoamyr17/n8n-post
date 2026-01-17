'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption: string;
}

interface MediaUploadProps {
  maxFiles?: number;
  onFilesChange: (files: MediaFile[]) => void;
  initialFiles?: MediaFile[];
}

export function MediaUpload({ maxFiles = 10, onFilesChange, initialFiles = [] }: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();

        return {
          id: data.publicId,
          url: data.url,
          type: data.resourceType === 'video' ? 'video' as const : 'image' as const,
          caption: '',
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const newFiles = [...files, ...uploadedFiles].slice(0, maxFiles);

      setFiles(newFiles);
      onFilesChange(newFiles);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [files, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi'],
    },
    maxFiles: maxFiles - files.length,
    disabled: uploading || files.length >= maxFiles,
  });

  const removeFile = (id: string) => {
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const updateCaption = (id: string, caption: string) => {
    const newFiles = files.map(f =>
      f.id === id ? { ...f, caption } : f
    );
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {uploading ? (
          <p className="text-gray-600">Uploading...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-2">
              {isDragActive
                ? 'Drop files here'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Images or videos ({files.length}/{maxFiles} uploaded)
            </p>
          </>
        )}
      </div>

      {/* Uploaded Files Preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="relative group">
              {/* Preview */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {file.type === 'image' ? (
                  <img
                    src={file.url}
                    alt="Upload"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={file.url}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="
                  absolute top-2 right-2 bg-red-500 text-white rounded-full p-1
                  opacity-0 group-hover:opacity-100 transition-opacity
                "
              >
                <X className="h-4 w-4" />
              </button>

              {/* Caption Input */}
              <input
                type="text"
                placeholder="Add caption..."
                value={file.caption}
                onChange={(e) => updateCaption(file.id, e.target.value)}
                className="
                  mt-2 w-full px-2 py-1 text-sm border rounded
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
