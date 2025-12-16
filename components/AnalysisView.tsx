import React from 'react';
import { AnalysisResult, ImageState, ItemCategory, OutfitItem } from '../types';
import { Icons } from './Icons';

interface AnalysisViewProps {
  imageState: ImageState;
  result: AnalysisResult | null;
  decompositionImage: string | null;
  loading: boolean;
  onReset: () => void;
}

const CategoryIcon = ({ category }: { category: ItemCategory }) => {
  switch (category) {
    case ItemCategory.TOP: return <Icons.Shirt size={18} />;
    case ItemCategory.BOTTOM: return <Icons.Scissors size={18} className="rotate-90" />;
    case ItemCategory.SHOES: return <Icons.Shoes size={18} />;
    case ItemCategory.ACCESSORY: return <Icons.Accessory size={18} />;
    case ItemCategory.OUTERWEAR: return <Icons.Outerwear size={18} />;
    case ItemCategory.ONE_PIECE: return <Icons.Shirt size={18} />;
    case ItemCategory.INNERWEAR: return <Icons.Innerwear size={18} />;
    default: return <Icons.Bag size={18} />;
  }
};

const ItemCard: React.FC<{ item: OutfitItem; delay: number }> = ({ item, delay }) => (
  <div 
    className="bg-white p-5 rounded-lg border border-fashion-100 shadow-sm hover:shadow-md transition-all duration-500 opacity-0 animate-fade-in-up"
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
  >
    <div className="flex items-start justify-between mb-2">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-fashion-50 text-fashion-800 border border-fashion-200">
        <CategoryIcon category={item.category} />
        {item.category}
      </span>
      {item.color && (
        <span className="text-xs text-gray-400 flex items-center gap-1">
          {item.color}
          <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: item.color.toLowerCase() }}></span>
        </span>
      )}
    </div>
    
    <h4 className="font-serif text-lg font-medium text-fashion-900 mb-1 leading-tight">
      {item.name}
    </h4>
    
    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
      {item.description}
    </p>
    
    <div className="flex items-center gap-2 pt-3 border-t border-fashion-50">
      <div className="min-w-4 w-4 text-amber-500">
        <Icons.Style size={14} />
      </div>
      <p className="text-xs font-medium text-fashion-700 italic">
        "{item.styleTip}"
      </p>
    </div>
  </div>
);

export const AnalysisView: React.FC<AnalysisViewProps> = ({ imageState, result, decompositionImage, loading, onReset }) => {
  if (!imageState.previewUrl) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 animate-fade-in">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-fashion-900 transition-colors"
        >
          <Icons.Close size={16} />
          分析下一张
        </button>
        {result && (
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">分析完成</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Left Column: Original Image & Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-lg group">
            <img 
              src={imageState.previewUrl} 
              alt="Uploaded Outfit" 
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Icons.Loading className="animate-spin text-fashion-900 mb-3" size={48} />
                <p className="font-serif text-lg text-fashion-900 animate-pulse">正在拆解穿搭...</p>
                <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">识别面料、剪裁与内搭</p>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">原图</div>
          </div>

          {/* Overall Style Summary Card */}
          {result && !loading && (
            <div className="bg-fashion-900 text-white p-6 rounded-xl shadow-lg opacity-0 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <div className="mb-4">
                <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-1">风格美学</h3>
                <p className="font-serif text-2xl">{result.overallStyle}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-1">适用场合</h3>
                <p className="text-gray-200">{result.occasion}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-2">配色方案</h3>
                <div className="flex gap-2">
                  {result.colorPalette?.map((color, idx) => (
                    <div 
                      key={idx} 
                      className="w-8 h-8 rounded-full border-2 border-white/20 shadow-inner"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Column: Decomposition Image */}
        <div className="lg:col-span-4 flex flex-col">
           {decompositionImage ? (
             <div className="flex flex-col gap-4 animate-fade-in">
               <div className="relative rounded-2xl overflow-hidden bg-gray-50 shadow-lg border border-fashion-100">
                  <img 
                    src={decompositionImage} 
                    alt="Outfit Decomposition" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/90 text-fashion-900 text-xs px-2 py-1 rounded backdrop-blur-sm shadow-sm font-bold border border-gray-200">
                    AI 风格分解图
                  </div>
               </div>
               <p className="text-xs text-gray-500 text-center italic px-4">
                 * 包含单品拆解、箭头指引、材质特写及内搭展示的 AI 设计图。
               </p>
             </div>
           ) : loading ? (
             <div className="h-96 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 animate-pulse">
               <Icons.Layers size={32} className="mb-2 opacity-50" />
               <p className="text-sm">正在绘制分解设计图...</p>
               <p className="text-xs mt-1">包含箭头指引与细节展示</p>
             </div>
           ) : result ? (
             <div className="h-64 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
               生成分解图失败
             </div>
           ) : null}
        </div>

        {/* Right Column: Decomposition List */}
        <div className="lg:col-span-4">
          {!loading && !result && (
             <div className="h-full flex items-center justify-center text-gray-400">
               <p>等待分析...</p>
             </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
                <Icons.Layers className="text-fashion-900" size={24} />
                <h2 className="font-serif text-2xl text-fashion-900">单品详情</h2>
              </div>
              
              <div className="flex flex-col gap-4">
                 {result.items.map((item, index) => (
                   <ItemCard key={index} item={item} delay={200 + (index * 100)} />
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
