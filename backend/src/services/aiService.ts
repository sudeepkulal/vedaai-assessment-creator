import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AISubmittedConfig {
  type: 'multiple-choice' | 'short-answer' | 'true-false';
  count: number;
  marks: number;
}

export interface AIGeneratedQuestion {
  questionText: string;
  type: 'multiple-choice' | 'short-answer' | 'true-false';
  options?: string[];
  correctAnswer: string;
  rubric: string;
}

export interface AIGeneratedSection {
  sectionTitle: string;
  instructions: string;
  questions: AIGeneratedQuestion[];
}

export interface AIGeneratedPaper {
  sections: AIGeneratedSection[];
}

export class AIService {
  private static getModel() {
    const apiKey = process.env.GEMINI_API_KEY || 'MOCK_KEY';
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash as it is extremely fast and optimized for structured text tasks
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  static async generateQuestions(
    title: string,
    topic: string,
    gradeLevel: string,
    difficulty: string,
    configs: AISubmittedConfig[],
    additionalInstructions?: string
  ): Promise<AIGeneratedPaper> {
    const apiKey = process.env.GEMINI_API_KEY;

    // Production Fallback: If no API key is set, return highly realistic mock data
    if (!apiKey || apiKey === 'MOCK_KEY') {
      console.warn('[VedaAI Gemini Warning]: No GEMINI_API_KEY env key provided. Falling back to local high-fidelity generator.');
      return this.generateMockPaper(topic, configs);
    }

    try {
      const model = this.getModel();

      // Convert configurations array into structured prompt requests
      const configPrompt = configs.map(c => 
        `- Type: ${c.type}, Count: ${c.count} questions, Marks per question: ${c.marks} marks.`
      ).join('\n');

      const systemPrompt = `You are VedaAI, an advanced high-grade AI academic assistant specializing in creating validated school assessments.
Your task is to generate a structured assignment paper based on the parameters provided.

You MUST respond strictly in JSON format. Do not write any explanations before or after the JSON.
Follow this exact TypeScript schema structure:
{
  "sections": [
    {
      "sectionTitle": "string (e.g. Section A: Multiple Choice Questions)",
      "instructions": "string (clear section specific instructions)",
      "questions": [
        {
          "questionText": "string (clear question prompt matching the topic)",
          "type": "multiple-choice" | "short-answer" | "true-false",
          "options": ["string"] (required only for multiple-choice and true-false questions, otherwise omit),
          "correctAnswer": "string (exact correct answer text)",
          "rubric": "string (grading criteria rubrics instruction)"
        }
      ]
    }
  ]
}`;

      const userPrompt = `Create an assessment with the following specifications:
- Title: ${title}
- Topic Focus: ${topic}
- Target Grade Level: ${gradeLevel}
- Target Difficulty: ${difficulty}
- Dynamic Row Configurations:
${configPrompt}
${additionalInstructions ? `- Additional Custom Instructions: ${additionalInstructions}` : ''}

Ensure:
- Questions are challenging, accurate, and age-appropriate.
- Correct answers match options exactly.
- Rubrics are highly academic and helpful.`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        }
      });

      const responseText = result.response.text();
      return this.parseAndValidateResponse(responseText);
    } catch (error) {
      console.error('[Gemini Generation Error]: Failed to create AI questions:', error);
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static parseAndValidateResponse(rawText: string): AIGeneratedPaper {
    try {
      // 1. Strip any markdown JSON blocks if present
      const cleanJSON = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJSON);

      // 2. Validate essential structures
      if (!parsed.sections || !Array.isArray(parsed.sections)) {
        throw new Error("Missing top-level 'sections' array in AI output.");
      }

      parsed.sections.forEach((sec: any, sIdx: number) => {
        if (!sec.sectionTitle || !sec.questions || !Array.isArray(sec.questions)) {
          throw new Error(`Section at index ${sIdx} is invalid. Title and questions list are required.`);
        }

        sec.questions.forEach((q: any, qIdx: number) => {
          if (!q.questionText || !q.type || !q.correctAnswer) {
            throw new Error(`Question at index ${qIdx} in section ${sIdx} is missing required fields.`);
          }
          if (q.type === 'multiple-choice' && (!q.options || !Array.isArray(q.options))) {
            throw new Error(`Multiple Choice Question at index ${qIdx} in section ${sIdx} is missing options array.`);
          }
        });
      });

      return parsed as AIGeneratedPaper;
    } catch (e: any) {
      console.error('[Safe Parser Error]: AI raw response was: \n', rawText);
      throw new Error(`Failed to parse AI response structure: ${e.message}`);
    }
  }

  private static generateMockPaper(topic: string, configs: AISubmittedConfig[]): AIGeneratedPaper {
    const sections: AIGeneratedSection[] = configs.map((config, idx) => {
      const questions: AIGeneratedQuestion[] = [];
      const sectionLetters = ['A', 'B', 'C'];
      const sectionLetter = sectionLetters[idx % 3];

      for (let i = 0; i < config.count; i++) {
        if (config.type === 'multiple-choice') {
          questions.push({
            questionText: `Which of the following describes the key principle of ${topic}? (Part ${i + 1})`,
            type: 'multiple-choice',
            options: ['Option A (Correct answer representation)', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A (Correct answer representation)',
            rubric: `Assign full ${config.marks} marks if the correct option is selected.`,
          });
        } else if (config.type === 'short-answer') {
          questions.push({
            questionText: `Explain the fundamental concept of ${topic} and discuss its practical applications. (Part ${i + 1})`,
            type: 'short-answer',
            correctAnswer: 'The response should focus on main theoretical models and active implementation use-cases.',
            rubric: `Grading scales up to ${config.marks} marks based on the coverage of applications and principles.`,
          });
        } else if (config.type === 'true-false') {
          questions.push({
            questionText: `Is the core theory of ${topic} applicable under standard normal conditions? (Part ${i + 1})`,
            type: 'true-false',
            options: ['True', 'False'],
            correctAnswer: 'True',
            rubric: `Assign ${config.marks} marks if True is selected.`,
          });
        }
      }

      return {
        sectionTitle: `Section ${sectionLetter}: ${config.type.replace('-', ' ').toUpperCase()} QUESTIONS`,
        instructions: `Answer all questions inside this section. Each question carries exactly ${config.marks} marks.`,
        questions,
      };
    });

    return { sections };
  }
}
