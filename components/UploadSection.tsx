import React, { useRef, useState } from 'react';
import { Icons } from './Icons';
import { ImageState } from '../types';

interface UploadSectionProps {
  onImageSelected: (imageState: ImageState) => void;
  isAnalyzing: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onImageSelected, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传有效的图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageSelected({
        file,
        previewUrl: URL.createObjectURL(file),
        base64
      });
    };
    reader.readAsDataURL(file);
  };

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
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-12 mb-8">
      <div
        className={`relative group cursor-pointer border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out h-64 flex flex-col items-center justify-center text-center p-8
          ${isDragging 
            ? 'border-fashion-900 bg-fashion-50 scale-[1.02]' 
            : 'border-fashion-200 hover:border-fashion-400 hover:bg-white bg-fashion-50/50'
          }
          ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icons.Upload className="text-fashion-800" size={28} />
        </div>
        
        <h3 className="text-lg font-serif font-semibold text-fashion-900 mb-2">
          上传穿搭照片
        </h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          将图片拖放到此处，或点击浏览文件
        </p>
        <p className="text-xs text-gray-400 mt-4 uppercase tracking-wider font-medium">
          支持 JPG, PNG, WEBP
        </p>
      </div>
    </div>
  );
};
