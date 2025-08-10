import React, { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  currentFiles: File[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onChange, 
  maxFiles = 3,
  currentFiles 
}) => {
  // Cache preview URLs to avoid memory leaks
  const previewUrls = useMemo(() => {
    return currentFiles.map(file => URL.createObjectURL(file));
  }, [currentFiles]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('📁 onDrop เรียกใช้แล้ว');
    console.log('📷 ไฟล์ที่ยอมรับ:', acceptedFiles.length);
    console.log('📋 ไฟล์ปัจจุบัน:', currentFiles.length);
    
    // Log accepted files
    acceptedFiles.forEach((file, index) => {
      console.log(`✅ ไฟล์ที่ยอมรับ ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });
    });
    
    const newFiles = [...currentFiles, ...acceptedFiles].slice(0, maxFiles);
    console.log('📦 ไฟล์ใหม่ทั้งหมด:', newFiles.length);
    
    // Call onChange with all files
    onChange(newFiles);
  }, [currentFiles, maxFiles, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: maxFiles - currentFiles.length,
    disabled: currentFiles.length >= maxFiles
  });

  const removeFile = (index: number) => {
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : currentFiles.length >= maxFiles 
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <ImageIcon className={`h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          {currentFiles.length >= maxFiles ? (
            <p className="text-sm text-gray-500">คุณได้อัพโหลดรูปครบ {maxFiles} รูปแล้ว</p>
          ) : isDragActive ? (
            <p className="text-sm text-blue-500 font-medium">วางไฟล์ที่นี่...</p>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </p>
              <p className="text-xs text-gray-400">
                รองรับไฟล์ JPG, PNG และ GIF (สูงสุด {maxFiles} ไฟล์)
              </p>
            </>
          )}
        </div>
      </div>

      {currentFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {currentFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative group">
              <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={previewUrls[index]}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', file.name, previewUrls[index]);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200"></div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="mt-1 text-xs text-gray-500 truncate">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;