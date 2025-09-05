import { GoogleGenAI } from "@google/genai";
import { config } from './config.js';
import { IChat, IMessage } from './models/Chat';

const ai = new GoogleGenAI({ 
  apiKey: config.gemini.apiKey
});

interface ChatContext {
  chatHistory: IMessage[];
  userMessage: string;
  attachments?: Array<{
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl?: string;
  }>;
}

export class ChatAI {
  private model = "gemini-2.0-flash-exp"; // Use the latest model for better responses

  async generateResponse(context: ChatContext): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const conversationPrompt = this.buildConversationPrompt(context);
      
      const fullPrompt = `${systemPrompt}\n\n${conversationPrompt}`;

      const response = await ai.models.generateContent({
        model: this.model,
        contents: fullPrompt,
      });

      return response.text || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("Error generating chat response:", error);
      throw new Error("Failed to generate AI response. Please try again.");
    }
  }

  private buildSystemPrompt(): string {
    return `You are AutoMindMap AI, an intelligent study assistant designed to help students learn effectively. Your role is to:

1. **Provide Original Analysis**: Don't just repeat what's in documents - provide your own insights, explanations, and analysis
2. **Critical Thinking**: Help students think critically about the content, not just memorize it
3. **Connect Ideas**: Link concepts from the material to broader knowledge and real-world applications
4. **Educational Focus**: Always aim to help students understand concepts, solve problems, and learn effectively
5. **Conversational Style**: Be friendly, encouraging, and engaging like a helpful tutor
6. **Adaptive Responses**: Adjust your response style based on the student's level and needs

Guidelines:
- **NEVER simply copy or repeat content from files** - instead, analyze, explain, and provide your own perspective
- **Provide original insights** - connect the material to other concepts, give examples, explain implications
- **Ask thought-provoking questions** - help students think deeper about the material
- **Offer different perspectives** - show how concepts relate to other subjects or real-world situations
- **Explain the "why" behind concepts** - don't just state facts, explain reasoning and logic
- **Provide practical applications** - show how the material applies to real situations
- **Encourage critical thinking** - help students question, analyze, and evaluate information
- **Use clear, student-friendly language** - break down complex topics into digestible parts
- **Be encouraging and supportive** - create a positive learning environment

Remember: You're not a document reader - you're an intelligent tutor who helps students understand, analyze, and think critically about the material.`;
  }

  private buildConversationPrompt(context: ChatContext): string {
    const { chatHistory, userMessage, attachments } = context;
    
    let prompt = "CONVERSATION CONTEXT:\n";
    
    // Add conversation history (last 10 messages to keep context manageable)
    const recentHistory = chatHistory.slice(-10);
    if (recentHistory.length > 0) {
      prompt += "\nPrevious conversation:\n";
      recentHistory.forEach((msg, index) => {
        const role = msg.role === 'user' ? 'Student' : 'AutoMindMap AI';
        prompt += `${role}: ${msg.content}\n`;
      });
    }
    
    // Add current user message
    prompt += `\nCurrent Student Message: ${userMessage}\n`;
    
    // Handle attachments
    if (attachments && attachments.length > 0) {
      prompt += "\nAttached Files:\n";
      attachments.forEach(attachment => {
        prompt += `- ${attachment.fileName} (${attachment.fileType}, ${this.formatFileSize(attachment.fileSize)})\n`;
      });
      
      prompt += "\nIMPORTANT: The student has shared files. DO NOT simply repeat or copy content from these files. Instead:\n";
      prompt += "- Acknowledge the files and ask what specific aspect they need help with\n";
      prompt += "- Provide your own analysis, insights, and explanations\n";
      prompt += "- Connect the material to broader concepts and real-world applications\n";
      prompt += "- Ask thought-provoking questions to deepen understanding\n";
      prompt += "- Offer different perspectives and critical analysis\n";
      prompt += "- If you can't access file content directly, ask the student to describe the key points they want to discuss\n";
    }
    
    prompt += "\nProvide an intelligent, original response that:\n";
    prompt += "- Addresses the student's question with your own analysis and insights\n";
    prompt += "- Connects concepts to broader knowledge and real-world applications\n";
    prompt += "- Encourages critical thinking and deeper understanding\n";
    prompt += "- Offers practical examples and explanations\n";
    prompt += "- Asks follow-up questions to promote learning\n";
    prompt += "- NEVER simply repeats or copies content from any source";
    
    return prompt;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Method to generate a smart chat title based on the first message
  async generateChatTitle(firstMessage: string): Promise<string> {
    try {
      const prompt = `Based on this student message, generate a concise, descriptive title for a study chat session (max 50 characters):

"${firstMessage}"

The title should capture the main topic or question. Examples:
- "Calculus Integration Help"
- "Biology Cell Structure"
- "Essay Writing Tips"
- "Math Problem Solving"

Title:`;

      const response = await ai.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      const title = response.text?.trim() || "New Chat";
      return title.length > 50 ? title.substring(0, 47) + "..." : title;
    } catch (error) {
      console.error("Error generating chat title:", error);
      return "New Chat";
    }
  }

  // Method to analyze and extract text from uploaded files (placeholder for future implementation)
  async analyzeFile(fileBuffer: Buffer, fileName: string, fileType: string): Promise<string> {
    // This is a placeholder for file analysis
    // In a real implementation, you would:
    // 1. Extract text from PDFs using pdf-parse or similar
    // 2. Extract text from images using OCR
    // 3. Process other file types as needed
    
    return `I can see you've uploaded "${fileName}" (${fileType}). I'm ready to help you analyze and understand this material! 

Instead of just reading the content back to you, I can:
- Help you understand the key concepts and their significance
- Connect the material to other subjects and real-world applications
- Explain complex ideas in simpler terms
- Ask thought-provoking questions to deepen your understanding
- Provide examples and analogies to make concepts clearer
- Help you think critically about the information

What specific aspect of this file would you like to explore or understand better?`;
  }

  // Method to provide intelligent analysis based on topic
  async provideTopicAnalysis(topic: string, context?: string): Promise<string> {
    try {
      const prompt = `As an intelligent study assistant, provide a comprehensive analysis of this topic: "${topic}"

${context ? `Context: ${context}` : ''}

Please provide:
1. A clear explanation of the core concepts
2. Real-world applications and examples
3. Connections to other related topics
4. Common misconceptions or challenges students face
5. Practical tips for understanding and remembering the material
6. Thought-provoking questions to encourage deeper thinking

Make your response engaging, educational, and original. Don't just list facts - provide insights and analysis that help students truly understand the topic.`;

      const response = await ai.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      return response.text || "I apologize, but I couldn't generate an analysis. Please try again.";
    } catch (error) {
      console.error("Error generating topic analysis:", error);
      throw new Error("Failed to generate topic analysis. Please try again.");
    }
  }
}

export const chatAI = new ChatAI();
