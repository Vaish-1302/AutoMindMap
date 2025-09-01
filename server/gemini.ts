import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

export async function summarizeYouTubeVideo(videoUrl: string, videoTitle?: string): Promise<string> {
  try {
    const prompt = `Please create a detailed, comprehensive summary of the YouTube video at this URL: ${videoUrl}

${videoTitle ? `Video Title: ${videoTitle}` : ''}

Please provide:
1. A clear overview of the main topic
2. Key concepts and learning points
3. Important details and examples mentioned
4. Step-by-step explanations where applicable
5. Actionable takeaways

Format the summary in a well-structured, note-taking style that would be helpful for a student to review and study from. Make it detailed but organized with clear sections and bullet points where appropriate.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate summary. Please try again.";
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary. Please check the video URL and try again.");
  }
}

export async function explainText(text: string): Promise<string> {
  try {
    const prompt = `Please explain the following text in simpler, more understandable terms. Make it clear and easy to grasp for a student:

"${text}"

Provide a clear, simplified explanation that maintains the core meaning but uses easier language and helpful examples where appropriate.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate explanation. Please try again.";
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw new Error("Failed to generate explanation. Please try again.");
  }
}

export function extractVideoIdFromUrl(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function getVideoThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
