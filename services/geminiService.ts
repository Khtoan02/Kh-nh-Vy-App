
import { GoogleGenAI, Type } from "@google/genai";
import { ChildProfile, GrowthRecord, MealRecord, MealSuggestion, Gender } from "../types";

// Sử dụng API_KEY từ môi trường
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const getAgeInMonths = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += now.getMonth();
  return months <= 0 ? 0 : months;
};

export const getMealSuggestions = async (
  profile: ChildProfile,
  latestGrowth: GrowthRecord | undefined,
  recentMeals: MealRecord[]
): Promise<MealSuggestion[]> => {
  const ai = getAI();
  const ageMonths = getAgeInMonths(profile.birthDate);
  const weightInfo = latestGrowth ? `${latestGrowth.weight}kg` : "chưa rõ";
  
  const prompt = `
    Bạn là một chuyên gia dinh dưỡng nhi khoa tại Việt Nam. 
    Hãy gợi ý thực đơn các món CHÁO dinh dưỡng cho bé:
    - Tên bé: ${profile.name}
    - Độ tuổi: ${ageMonths} tháng (${profile.gender === Gender.MALE ? 'Bé trai' : 'Bé gái'})
    - Cân nặng: ${weightInfo}
    - Lịch sử ăn gần đây: ${recentMeals.map(m => m.description).join(', ')}

    Yêu cầu:
    1. Chỉ gợi ý các món cháo/súp phù hợp độ tuổi.
    2. Nguyên liệu phải gần gũi ở Việt Nam.
    3. Tránh lặp lại các món bé đã ăn gần đây.
    4. Cung cấp hướng dẫn nấu cực kỳ ngắn gọn (dưới 50 từ).

    Trả về danh sách 3 món cho: Bữa sáng, Bữa trưa, Bữa tối.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              suggestedFor: { type: Type.STRING },
              dishName: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.STRING },
              nutritionalBenefits: { type: Type.STRING }
            },
            required: ["suggestedFor", "dishName", "description", "ingredients", "instructions", "nutritionalBenefits"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]') as MealSuggestion[];
  } catch (error) {
    console.error("Gemini error:", error);
    return [];
  }
};

export const analyzeGrowthWithAI = async (
  profile: ChildProfile,
  records: GrowthRecord[]
): Promise<string> => {
  if (records.length === 0) return "Mẹ hãy thêm chỉ số cân nặng và chiều cao của bé để mình phân tích nhé!";
  const ai = getAI();
  const latest = records[records.length - 1];
  const ageMonths = getAgeInMonths(profile.birthDate);

  const prompt = `
    Phân tích tăng trưởng cho bé ${profile.name}:
    - Tuổi: ${ageMonths} tháng.
    - Giới tính: ${profile.gender === Gender.MALE ? 'Nam' : 'Nữ'}.
    - Cân nặng: ${latest.weight}kg, Chiều cao: ${latest.height}cm.
    - Dữ liệu lịch sử: ${JSON.stringify(records.slice(-3))}

    Hãy đưa ra nhận xét ngắn gọn, yêu thương, cổ vũ người mẹ. 
    Nếu có dấu hiệu nhẹ cân hoặc thấp còi so với chuẩn WHO, hãy đưa ra 2 lời khuyên dinh dưỡng cụ thể.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Bé đang phát triển rất tốt, mẹ tiếp tục duy trì nhé!";
  } catch (error) {
    return "Đang cập nhật dữ liệu phân tích...";
  }
};
