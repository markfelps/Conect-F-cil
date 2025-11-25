import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { QuizQuestion, Tip } from '../models';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateQuiz(): Promise<QuizQuestion[]> {
    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Gere 5 perguntas de Verdadeiro ou Falso sobre segurança na internet para idosos, focando em notícias falsas (fake news) e proteção de dados. As perguntas devem ser simples. Para cada uma, forneça a pergunta, a resposta correta ('Verdadeiro' ou 'Falso'), e uma explicação curta e clara.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const jsonResponse = JSON.parse(response.text);
      // Manually add options to match the QuizQuestion model
      return (jsonResponse.questions || []).map((q: Omit<QuizQuestion, 'options'>) => ({
        ...q,
        options: ['Verdadeiro', 'Falso'],
      }));

    } catch (error) {
      console.error('Error generating quiz:', error);
      // Return mock data on failure
      return [
        {
          question: "Se um site tem um cadeado verde, ele é sempre 100% seguro para colocar dados de cartão de crédito.",
          options: ["Verdadeiro", "Falso"],
          correctAnswer: "Falso",
          explanation: "O cadeado indica que a conexão é segura, mas não garante que o site é confiável. Sempre verifique a reputação do site antes de comprar."
        }
      ];
    }
  }

  async generateTips(): Promise<Tip[]> {
    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Gere 5 dicas de segurança na internet para iniciantes e idosos. Os temas devem incluir senhas seguras, identificação de emails falsos e compras online seguras. Para cada dica, forneça um título, uma descrição de 1-2 frases, e um nome de ícone do Heroicons (versão outline, ex: 'shield-check').",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    icon: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const jsonResponse = JSON.parse(response.text);
      return jsonResponse.tips || [];
    } catch (error) {
        console.error('Error generating tips:', error);
        return [
            { title: 'Senhas Fortes', description: 'Crie senhas longas com letras, números e símbolos. Não use datas de aniversário ou nomes fáceis.', icon: 'key' },
            { title: 'Cuidado com E-mails', description: 'Não clique em links de e-mails suspeitos que pedem seus dados. Empresas sérias não pedem sua senha por e-mail.', icon: 'shield-check' }
        ];
    }
  }
}