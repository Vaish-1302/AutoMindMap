import { GoogleGenAI } from "@google/genai";
import { getVideoDetails, extractVideoIdFromUrl } from "./youtube";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

export async function summarizeYouTubeVideo(videoUrl: string): Promise<string> {
  try {
    // Extract video ID from URL
    const videoId = extractVideoIdFromUrl(videoUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Get video details including transcript
    const videoDetails = await getVideoDetails(videoId);
    
    // Create a comprehensive prompt with actual video content
    const prompt = `Please create a detailed, comprehensive summary of this YouTube video based on the actual content provided:

Video Title: ${videoDetails.title}
Channel: ${videoDetails.channelTitle}
Duration: ${videoDetails.duration}
Published: ${videoDetails.publishedAt}

Video Description:
${videoDetails.description}

${videoDetails.captions ? `Video Transcript:
${videoDetails.captions}` : 'Note: No captions available - summary based on title and description.'}

Please provide:
1. A clear overview of the main topic and purpose
2. Key concepts and learning points covered
3. Important details, facts, and examples mentioned
4. Step-by-step explanations where applicable
5. Actionable takeaways and practical insights
6. Main conclusions or recommendations

Format the summary in a well-structured, note-taking style that would be helpful for a student to review and study from. Make it detailed but organized with clear sections and bullet points where appropriate. Focus on the actual content from the transcript when available.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate summary. Please try again.";
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

// These functions are now imported from youtube.ts
// Keeping them here for backward compatibility
export { extractVideoIdFromUrl, getVideoThumbnail } from "./youtube";
