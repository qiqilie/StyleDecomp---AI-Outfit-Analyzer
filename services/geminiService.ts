import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ItemCategory, TrendResult } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing in process.env");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: [
              ItemCategory.TOP,
              ItemCategory.BOTTOM,
              ItemCategory.OUTERWEAR,
              ItemCategory.SHOES,
              ItemCategory.ACCESSORY,
              ItemCategory.ONE_PIECE,
              ItemCategory.INNERWEAR,
              ItemCategory.OTHER
            ],
            description: "衣物类别"
          },
          name: {
            type: Type.STRING,
            description: "单品名称 (例如: '米色宽松西装外套')"
          },
          color: {
            type: Type.STRING,
            description: "主要颜色"
          },
          material: {
            type: Type.STRING,
            description: "推测材质 (例如: 牛仔, 棉, 真丝)"
          },
          description: {
            type: Type.STRING,
            description: "单品视觉细节的简短描述"
          },
          styleTip: {
            type: Type.STRING,
            description: "关于如何搭配该单品的一句简短建议"
          }
        },
        required: ["category", "name", "color", "material", "description", "styleTip"]
      }
    },
    overallStyle: {
      type: Type.STRING,
      description: "整体风格摘要 (例如: '极简风', '街头潮流')"
    },
    occasion: {
      type: Type.STRING,
      description: "最适合的场合"
    },
    colorPalette: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "代表穿搭主要颜色的 Hex 代码列表"
    }
  },
  required: ["items", "overallStyle", "occasion", "colorPalette"]
};

export const analyzeOutfit = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "请深度分析这张图片中的人物穿搭。将其拆解为单独的单品。请特别注意推断和包含可能搭配的内搭/内衣风格（根据外衣风格推测）。准确识别风格、材质和颜色。请严格按照 JSON 格式输出中文结果。"
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini 未返回数据");
    }

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const generateDecompositionImage = async (base64Image: string, mimeType: string): Promise<string | null> => {
  try {
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Create a 'Fashion Design Sheet' or 'Character Analysis Board' based on this photo. \n\nLayout Requirements:\n1. Center: The full-body character wearing the outfit from the original image.\n2. Surrounding items: Decompose the outfit into isolated clothing items floating around the central figure. Include: Coat/Jacket, Top, Bottom/Skirt, Shoes, Bag, and explicitly include a matching Lingerie/Innerwear set (Bra and Panties) suitable for the style.\n3. Arrows: Draw thin, elegant lines or arrows connecting each isolated item to the corresponding location on the central character.\n4. Details: Include 2-3 small circular close-ups showing fabric textures (e.g., silk, wool pattern).\n5. Style: High-quality fashion illustration style on a vintage beige paper or clean off-white background. Make it look like a professional concept art sheet."
          }
        ]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    return null;

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return null; 
  }
};

export const getFashionTrends = async (): Promise<TrendResult> => {
  try {
    // 1. Get Text Analysis of Trends in Chinese
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        text: "请分析2024-2025年当前的全球时尚流行趋势。请返回一个吸引人的标题、一段简短但充满灵感的描述（100字以内），以及5个关键的流行元素或单品。所有内容请使用中文（简体）输出。请严格按照 JSON 格式返回。"
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            keyElements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "keyElements"]
        }
      }
    });

    const trendData = JSON.parse(textResponse.text || "{}");

    // 2. Generate an Image based on these trends (No Text to avoid garbled characters)
    let imageUrl = null;
    try {
      const imageResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          text: `Create a high-fashion editorial illustration or mood board showcasing the following trend: ${trendData.title}. Key elements: ${trendData.keyElements.join(', ')}. Style: Chic, modern, artistic fashion photography style. IMPORTANT: Do NOT include any text, letters, or words in the image to prevent garbled characters. The image should be purely visual.`
        }
      });
      
      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (imgError) {
      console.error("Trend image generation failed", imgError);
    }

    return {
      ...trendData,
      imageUrl
    };

  } catch (error) {
    console.error("Gemini Trend Error:", error);
    throw error;
  }
};
