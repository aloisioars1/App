
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const createAI = () => new GoogleGenAI({ apiKey: API_KEY });

export async function analyzeJokeWithThinking(joke: string, mentor: string) {
  const ai = createAI();
  const systemInstruction = `Você é um mentor de stand-up comedy especializado na técnica de ${mentor}. 
    Se for Greg Dean, foque na estrutura de Setup, Conector, Alvo e Reinterpretação.
    Se for Léo Lins, foque em acidez, lógica reversa, piadas de observação e humor negro. 
    IMPORTANTE PARA LÉO LINS: Além da técnica, você DEVE incluir uma breve nota sobre a sensibilidade do humor negro, 
    alertando que piadas ácidas exigem um 'punch' técnico muito forte para não serem apenas ofensas gratuitas, 
    e que o comediante deve assumir a responsabilidade pelo contexto e local da apresentação.
    Analise a piada do usuário e sugira melhorias.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analise esta piada: ${joke}`,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
  return response.text;
}

export async function suggestJokeTags(setup: string, punchline: string): Promise<string[]> {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Com base no setup e punchline abaixo, sugira de 3 a 5 tags curtas de categorias de humor (ex: 'humor negro', 'cotidiano', 'política', 'relacionamento', 'observação', 'autodepreciação').
    Setup: ${setup}
    Punchline: ${punchline}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  try {
    return JSON.parse(response.text || '[]');
  } catch {
    return [];
  }
}

export async function generateJokeImage(prompt: string, aspectRatio: string = "1:1", size: string = "1K") {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: `A comedic visual for a stand-up routine: ${prompt}` }],
    },
    config: {
      imageConfig: {
        aspectRatio,
        imageSize: size as any
      },
    },
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function generateJokeVideo(prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") {
  const ai = createAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Funny animated comedy sketch: ${prompt}`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function transcribeAudio(base64Audio: string) {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Audio, mimeType: 'audio/mp3' } },
        { text: "Transcreva este áudio de ensaio de stand-up. Separe por pausas de risadas imaginárias." }
      ]
    }
  });
  return response.text;
}

export async function searchTrends(topic: string) {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Quais são as notícias ou tendências mais recentes e engraçadas sobre: ${topic}? Me dê material para stand-up.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return {
    text: response.text,
    sources
  };
}
