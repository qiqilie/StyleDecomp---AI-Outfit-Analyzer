import React from 'react';
import { Icons } from './Icons';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const getLinkClass = (view: ViewMode) => {
    return `cursor-pointer transition-colors ${
      currentView === view 
        ? 'text-fashion-900 font-bold border-b-2 border-fashion-900' 
        : 'text-gray-500 hover:text-fashion-900'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-fashion-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate('analyzer')}
        >
          <div className="bg-fashion-900 text-white p-1.5 rounded-sm">
            <Icons.Style size={20} />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight text-fashion-900 hidden sm:block">
            StyleDecomp
          </h1>
        </div>
        
        <nav className="flex gap-6 text-sm font-medium">
          <button 
            onClick={() => onNavigate('analyzer')} 
            className={getLinkClass('analyzer')}
          >
            智能分析
          </button>
          <button 
            onClick={() => onNavigate('wardrobe')} 
            className={getLinkClass('wardrobe')}
          >
            我的衣橱
          </button>
          <button 
            onClick={() => onNavigate('trends')} 
            className={getLinkClass('trends')}
          >
            流行趋势
          </button>
        </nav>
      </div>
    </header>
  );
};
