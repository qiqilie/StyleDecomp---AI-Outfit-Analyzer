import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { AnalysisView } from './components/AnalysisView';
import { WardrobeView } from './components/WardrobeView';
import { TrendsView } from './components/TrendsView';
import { analyzeOutfit, generateDecompositionImage } from './services/geminiService';
import { ImageState, AnalysisResult, ViewMode, HistoryItem } from './types';

const STORAGE_KEY = 'style_decomp_history';

// Helper to compress images for storage
const compressBase64Image = (base64Str: string, maxWidth = 600, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Fill white background to handle transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('analyzer');
  
  // Analyzer State
  const [imageState, setImageState] = useState<ImageState>({
    file: null,
    previewUrl: null,
    base64: null
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [decompositionImage, setDecompositionImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load History on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
    
    // Custom Animation Styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-fade-in-up {
        animation-name: fadeInUp;
        animation-duration: 0.6s;
        animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
      }
      .animate-fade-in {
        animation-name: fadeIn;
        animation-duration: 0.8s;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Save History Helper with Compression and Error Handling
  const saveToHistory = async (item: HistoryItem) => {
    try {
      // Compress images before saving to save space
      const compressedBase64 = item.imageState.base64 
        ? await compressBase64Image(item.imageState.base64) 
        : null;
      
      const compressedDecomp = item.decompositionImage 
        ? await compressBase64Image(item.decompositionImage) 
        : null;

      const optimizedItem: HistoryItem = {
        ...item,
        imageState: {
          ...item.imageState,
          base64: compressedBase64,
          previewUrl: compressedBase64 // Use compressed base64 as preview for history persistence
        },
        decompositionImage: compressedDecomp
      };

      // Create new history array with new item at the beginning
      let newHistory = [optimizedItem, ...history];
      
      // Attempt to save, handling quota limits by iteratively removing old items
      while (newHistory.length > 0) {
        try {
          const json = JSON.stringify(newHistory);
          localStorage.setItem(STORAGE_KEY, json);
          setHistory(newHistory);
          break; // Success
        } catch (e: any) {
          // Check for various QuotaExceededError signatures
          if (
            e.name === 'QuotaExceededError' || 
            e.code === 22 || 
            e.code === 1014 ||
            e.message?.toLowerCase().includes('quota') ||
            e.message?.toLowerCase().includes('exceeded')
          ) {
             // If we can't even save one item, stop to avoid infinite loop
             if (newHistory.length <= 1) {
               console.error("Storage full, cannot save item.");
               break;
             }
             // Remove the oldest item (last in array) and try again
             newHistory.pop();
          } else {
            // Re-throw if it's not a quota error
            throw e;
          }
        }
      }
    } catch (error) {
      console.error("Failed to save history", error);
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条穿搭记录吗？')) {
      const newHistory = history.filter(h => h.id !== id);
      setHistory(newHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    }
  };

  const handleImageSelected = async (newState: ImageState) => {
    setImageState(newState);
    setAnalysisResult(null); 
    setDecompositionImage(null);
    setError(null);
    setCurrentView('analyzer'); // Ensure we are on analyzer view
    
    if (newState.base64 && newState.file) {
      setIsAnalyzing(true);
      
      try {
        const [result, decompImage] = await Promise.all([
          analyzeOutfit(newState.base64, newState.file.type),
          generateDecompositionImage(newState.base64, newState.file.type)
        ]);
        
        setAnalysisResult(result);
        setDecompositionImage(decompImage);

        // Save to History
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          imageState: newState,
          result: result,
          decompositionImage: decompImage
        };
        await saveToHistory(newItem);

      } catch (err) {
        console.error(err);
        setError("分析图片失败，请重试或更换一张清晰的照片。");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleReset = () => {
    setImageState({ file: null, previewUrl: null, base64: null });
    setAnalysisResult(null);
    setDecompositionImage(null);
    setError(null);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    // When loading from history, we might not have the 'File' object, so we rely on base64/previewUrl
    setImageState(item.imageState);
    setAnalysisResult(item.result);
    setDecompositionImage(item.decompositionImage);
    setCurrentView('analyzer');
  };

  // Determine if main content is active (image loaded or being analyzed)
  const isContentActive = !!imageState.base64 || !!imageState.previewUrl;

  return (
    <div className="min-h-screen flex flex-col bg-fashion-50">
      <Header currentView={currentView} onNavigate={setCurrentView} />
      
      <main className="flex-grow pt-8">
        
        {/* VIEW: ANALYZER */}
        {currentView === 'analyzer' && (
          <>
            {!isContentActive && (
              <div className="container mx-auto px-4 text-center animate-fade-in-up">
                <h2 className="font-serif text-4xl md:text-5xl text-fashion-900 mb-6 mt-12">
                  一键拆解你的穿搭风格
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
                  上传穿搭照片，AI 智能识别单品、面料与风格细节，并为您生成包含内搭的完整平铺分解图。
                </p>
                <UploadSection 
                  onImageSelected={handleImageSelected} 
                  isAnalyzing={isAnalyzing} 
                />
                
                <div className="flex justify-center gap-12 mt-16 grayscale opacity-40 hover:opacity-60 transition-opacity duration-500">
                   <div className="h-8 w-24 bg-fashion-300 rounded"></div>
                   <div className="h-8 w-24 bg-fashion-300 rounded"></div>
                   <div className="h-8 w-24 bg-fashion-300 rounded"></div>
                </div>
              </div>
            )}

            {error && (
               <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center animate-fade-in">
                 <p>{error}</p>
                 <button onClick={handleReset} className="text-sm underline mt-2">重试</button>
               </div>
            )}

            {isContentActive && (
              <AnalysisView 
                imageState={imageState}
                result={analysisResult}
                decompositionImage={decompositionImage}
                loading={isAnalyzing}
                onReset={handleReset}
              />
            )}
          </>
        )}

        {/* VIEW: WARDROBE */}
        {currentView === 'wardrobe' && (
          <WardrobeView 
            history={history} 
            onSelect={handleSelectHistory}
            onDelete={deleteHistoryItem}
          />
        )}

        {/* VIEW: TRENDS */}
        {currentView === 'trends' && (
          <TrendsView />
        )}

      </main>

      <footer className="bg-white border-t border-fashion-100 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} StyleDecomp. Powered by Gemini 2.5 Flash.</p>
        </div>
      </footer>
    </div>
  );
}