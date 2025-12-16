import React, { useState, useEffect } from 'react';
import { TrendResult } from '../types';
import { Icons } from './Icons';
import { getFashionTrends } from '../services/geminiService';

export const TrendsView: React.FC = () => {
  const [trend, setTrend] = useState<TrendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto load trends on mount if not exists
  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFashionTrends();
      setTrend(data);
    } catch (err) {
      setError("无法获取最新趋势，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-fashion-900 text-white p-2 rounded-md">
            <Icons.Trend size={24} />
          </div>
          <div>
            <h2 className="font-serif text-3xl text-fashion-900">当季流行趋势</h2>
            <p className="text-sm text-gray-500">AI 驱动的全球时尚风向标 (2024-2025)</p>
          </div>
        </div>
        <button 
          onClick={fetchTrends}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-white border border-fashion-200 rounded-lg hover:bg-fashion-50 transition-colors flex items-center gap-2"
        >
          {loading ? <Icons.Loading className="animate-spin" size={16} /> : <Icons.Style size={16} />}
          刷新推荐
        </button>
      </div>

      {loading && !trend && (
        <div className="h-96 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-fashion-100">
          <Icons.Loading className="animate-spin text-fashion-900 mb-4" size={48} />
          <p className="font-serif text-xl text-fashion-900 animate-pulse">正在搜罗全球时尚资讯...</p>
          <p className="text-sm text-gray-400 mt-2">分析秀场数据 & 生成视觉报告</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-700">
          <p>{error}</p>
          <button onClick={fetchTrends} className="underline mt-2">重试</button>
        </div>
      )}

      {trend && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Visual Side */}
          <div className="relative group">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
              {trend.imageUrl ? (
                <img 
                  src={trend.imageUrl} 
                  alt={trend.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                   无法生成趋势图片
                </div>
              )}
            </div>
            {/* Overlay Decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-fashion-100 rounded-full -z-10"></div>
            <div className="absolute -top-4 -left-4 w-16 h-16 border-2 border-fashion-200 rounded-full -z-10"></div>
          </div>

          {/* Text Content Side */}
          <div className="flex flex-col justify-center animate-fade-in-up">
            <span className="text-xs font-bold tracking-[0.2em] text-fashion-500 uppercase mb-3">
              Trend Forecast
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-fashion-900 mb-6 leading-tight">
              {trend.title}
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-8 border-l-4 border-fashion-200 pl-4 italic">
              {trend.description}
            </p>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-fashion-900 mb-4 flex items-center gap-2">
                <Icons.Layers size={16} /> 关键元素 (Key Elements)
              </h3>
              <div className="flex flex-wrap gap-3">
                {trend.keyElements.map((el, idx) => (
                  <span 
                    key={idx}
                    className="px-4 py-2 bg-white border border-fashion-200 rounded-full text-fashion-800 shadow-sm hover:shadow-md hover:border-fashion-400 transition-all duration-300"
                  >
                    {el}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
               <span>AI Analysis • Gemini 2.5</span>
               <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
