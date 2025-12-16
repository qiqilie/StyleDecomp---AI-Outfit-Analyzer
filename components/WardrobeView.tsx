import React from 'react';
import { HistoryItem } from '../types';
import { Icons } from './Icons';

interface WardrobeViewProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const WardrobeView: React.FC<WardrobeViewProps> = ({ history, onSelect, onDelete }) => {
  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in-up">
        <div className="bg-fashion-50 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
          <Icons.Bag className="text-fashion-300" size={40} />
        </div>
        <h2 className="font-serif text-2xl text-fashion-900 mb-3">衣橱空空如也</h2>
        <p className="text-gray-500">您还没有保存任何穿搭分析记录。快去上传照片试一试吧！</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Icons.Bag className="text-fashion-900" size={24} />
        <h2 className="font-serif text-3xl text-fashion-900">我的衣橱</h2>
        <span className="text-sm bg-fashion-100 px-2 py-0.5 rounded-full text-fashion-800 font-medium">
          {history.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-fashion-100 transition-all duration-300 cursor-pointer relative"
          >
            {/* Image Section */}
            <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
               <img 
                 src={item.imageState.previewUrl || ''} 
                 alt={item.result.overallStyle}
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                 <span className="text-white text-sm font-medium flex items-center gap-1">
                   查看详情 <Icons.ArrowRight size={14} />
                 </span>
               </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={(e) => onDelete(item.id, e)}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm z-10"
              title="删除记录"
            >
              <Icons.Trash size={16} />
            </button>

            {/* Info Section */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-lg font-bold text-fashion-900 line-clamp-1">
                  {item.result.overallStyle}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Icons.Calendar size={12} />
                <span>{new Date(item.timestamp).toLocaleDateString('zh-CN')}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {item.result.items.slice(0, 3).map((outfitItem, idx) => (
                  <span key={idx} className="text-xs bg-fashion-50 text-fashion-700 px-2 py-1 rounded border border-fashion-100">
                    {outfitItem.name}
                  </span>
                ))}
                {item.result.items.length > 3 && (
                  <span className="text-xs text-gray-400 px-1 py-1">+{item.result.items.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
