export enum ItemCategory {
  TOP = '上装',
  BOTTOM = '下装',
  OUTERWEAR = '外套',
  SHOES = '鞋履',
  ACCESSORY = '配饰',
  ONE_PIECE = '连体衣',
  INNERWEAR = '内衣/内搭',
  OTHER = '其他'
}

export interface OutfitItem {
  category: ItemCategory;
  name: string;
  color: string;
  material: string;
  description: string;
  styleTip: string;
}

export interface AnalysisResult {
  items: OutfitItem[];
  overallStyle: string;
  occasion: string;
  colorPalette: string[];
}

export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageState: ImageState;
  result: AnalysisResult;
  decompositionImage: string | null;
}

export interface TrendResult {
  title: string;
  description: string;
  keyElements: string[];
  imageUrl: string | null;
}

export type ViewMode = 'analyzer' | 'wardrobe' | 'trends';
