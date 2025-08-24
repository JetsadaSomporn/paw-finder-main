import React, { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
  
    
  const newFiles = [...currentFiles, ...acceptedFiles].slice(0, maxFiles);
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
      <div {...getRootProps()} className={`rounded-xl p-6 text-center cursor-pointer transition-colors duration-200 border shadow-sm ${isDragActive ? 'border-[#F4A261] bg-white/60' : currentFiles.length >= maxFiles ? 'border-stone-200 bg-stone-50 cursor-not-allowed' : 'border-stone-200 hover:border-[#F4A261] hover:bg-white/60'}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <ImageIcon className={`h-12 w-12 ${isDragActive ? 'text-[#F4A261]' : 'text-stone-400'}`} />
          {currentFiles.length >= maxFiles ? (
            <p className="text-sm text-stone-600">คุณได้อัพโหลดรูปครบ {maxFiles} รูปแล้ว</p>
          ) : isDragActive ? (
            <p className="text-sm text-[#F4A261] font-medium">วางไฟล์ที่นี่...</p>
          ) : (
            <>
              <p className="text-sm text-stone-600">ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
              <p className="text-xs text-stone-400">รองรับไฟล์ JPG, PNG และ GIF (สูงสุด {maxFiles} ไฟล์)</p>
            </>
          )}
        </div>
      </div>

      {currentFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {currentFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative group rounded-lg overflow-hidden">
              <motion.div whileHover={{ scale: 1.02 }} className="relative h-24 bg-stone-100 rounded-lg overflow-hidden">
                <img src={previewUrls[index]} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200"></div>
              </motion.div>
              <button type="button" onClick={() => removeFile(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <X className="h-4 w-4" />
              </button>
              <p className="mt-1 text-xs text-stone-500 truncate">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;