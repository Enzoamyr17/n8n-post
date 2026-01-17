'use client';

import { useState, useCallback } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption: string;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
}

interface MediaUploadProps {
  maxFiles?: number;
  onFilesChange: (files: MediaFile[]) => void;
  initialFiles?: MediaFile[];
}

export function MediaUpload({ maxFiles = 10, onFilesChange, initialFiles = [] }: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>(initialFiles);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Check for mixed media type restriction
    if (files.length > 0) {
      const existingType = files[0].type;
      const newFileTypes = acceptedFiles.map(file =>
        file.type.startsWith('video/') ? 'video' : 'image'
      );

      // Prevent mixed media
      if (newFileTypes.some(type => type !== existingType)) {
        alert(`You can only upload ${existingType}s. Mixed media is not allowed.`);
        return;
      }

      // If existing files are videos, don't allow any more uploads
      if (existingType === 'video') {
        alert('Only one video is allowed per post.');
        return;
      }
    }

    // Check if trying to upload multiple videos
    const videoFiles = acceptedFiles.filter(file => file.type.startsWith('video/'));
    if (videoFiles.length > 1) {
      alert('You can only upload one video per post.');
      return;
    }

    // If uploading a video and there are already files, reject
    if (videoFiles.length > 0 && files.length > 0) {
      alert('You can only upload one video per post.');
      return;
    }

    try {
      // Create uploading placeholders
      const uploadingPlaceholders: UploadingFile[] = acceptedFiles.map((file, index) => ({
        id: `uploading-${Date.now()}-${index}`,
        name: file.name,
        progress: 0,
      }));
      setUploadingFiles(uploadingPlaceholders);

      const uploadPromises = acceptedFiles.map(async (file, index) => {
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

        // Remove this file from uploading list
        setUploadingFiles(prev => prev.filter((_, i) => i !== index));

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
      setUploadingFiles([]);
    }
  }, [files, maxFiles, onFilesChange]);

  // Determine what file types to accept based on existing files
  const getAcceptedFileTypes = (): Accept | undefined => {
    if (files.length === 0) {
      // No files yet, allow both images and videos
      return {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        'video/*': ['.mp4', '.mov', '.avi'],
      };
    }

    const existingType = files[0].type;
    if (existingType === 'video') {
      // Already have a video, don't accept any more files
      return undefined;
    }

    // Have images, only accept more images
    return {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    };
  };

  const isDisabled = uploadingFiles.length > 0 ||
                     files.length >= maxFiles ||
                     (files.length > 0 && files[0].type === 'video');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedFileTypes(),
    maxFiles: maxFiles - files.length,
    disabled: isDisabled,
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

  const getUploadMessage = () => {
    if (files.length > 0 && files[0].type === 'video') {
      return 'Video uploaded (only one video allowed)';
    }
    if (files.length > 0 && files[0].type === 'image') {
      return `Only images allowed (${files.length}/${maxFiles} uploaded)`;
    }
    return `Images or videos (${files.length}/${maxFiles} uploaded)`;
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
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {uploadingFiles.length > 0 ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            <p className="text-gray-600">
              Uploading {uploadingFiles.length} file{uploadingFiles.length > 1 ? 's' : ''}...
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-2">
              {isDragActive
                ? 'Drop files here'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              {getUploadMessage()}
            </p>
          </>
        )}
      </div>

      {/* Uploaded Files Preview and Loading Placeholders */}
      {(files.length > 0 || uploadingFiles.length > 0) && (
        <div className="space-y-4">
          {/* Info message for multiple images */}
          {files.length > 1 && files.every(f => f.type === 'image') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Multiple images detected:</strong> Add individual captions for each image (optional).
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Uploaded Files */}
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

                {/* Caption Input - Only show for multiple images */}
                {files.length > 1 && files.every(f => f.type === 'image') && (
                  <input
                    type="text"
                    placeholder="Image caption (optional)..."
                    value={file.caption}
                    onChange={(e) => updateCaption(file.id, e.target.value)}
                    className="
                      mt-2 w-full px-2 py-1 text-sm border rounded
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                    "
                  />
                )}
              </div>
            ))}

            {/* Loading Placeholders */}
            {uploadingFiles.map((uploadingFile) => (
              <div key={uploadingFile.id} className="relative">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-600 px-2 truncate">
                      {uploadingFile.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
