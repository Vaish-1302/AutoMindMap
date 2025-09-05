import { GoogleGenAI } from "@google/genai";
import { getVideoDetails, extractVideoIdFromUrl } from "./youtube";
import { config } from './config.js';

const ai = new GoogleGenAI({ 
  apiKey: config.gemini.apiKey
});

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(params: { model: string; contents: string }, maxAttempts = 3) {
  let lastError: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: params.model,
        contents: params.contents,
      });
      return res;
    } catch (err: any) {
      lastError = err;
      const code = (err as any)?.error?.code || (err as any)?.code;
      const status = (err as any)?.error?.status || (err as any)?.status;
      const isRetriable = code === 503 || status === "UNAVAILABLE" || status === "RESOURCE_EXHAUSTED";
      if (attempt < maxAttempts && isRetriable) {
        // Exponential backoff: 500ms, 1000ms, 2000ms ...
        await sleep(500 * Math.pow(2, attempt - 1));
        continue;
      }
      // Fallback to a lighter model once before giving up
      if (attempt < maxAttempts && params.model !== "gemini-1.5-flash") {
        params.model = "gemini-1.5-flash";
        await sleep(400 * attempt);
        continue;
      }
      break;
    }
  }
  throw lastError;
}

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
    const prompt = `Create a clear, structured summary of this video based on the provided details.

Video Title: ${videoDetails.title}
Channel: ${videoDetails.channelTitle}
Duration: ${videoDetails.duration}
Published: ${videoDetails.publishedAt}

Video Description:
${videoDetails.description}

${videoDetails.captions ? `Video Transcript:\n${videoDetails.captions}` : 'Note: No captions available - base the summary on the title and description.'}

Write in plain text only. Do NOT use any markdown symbols (#, *, -, _, ` + "`" + `, >). Use simple section headers followed by content, like:
Overview:
Key points:
Details:
Takeaways:
Conclusion:

Focus on clarity and accuracy. Keep it readable without decorative formatting.`;

    const response = await generateWithRetry({ model: "gemini-2.5-flash", contents: prompt }, 4);

    const raw = response.text || "Unable to generate summary. Please try again.";
    const cleaned = (raw as string)
      .replace(/[\*#`_>]+/g, " ") // remove markdown symbols
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim();
    return cleaned;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function explainText(text: string, mode?: "short" | "medium" | "long" | "comprehensive", style?: "standard" | "teacher" | "expert" | "accessible", options?: { duration?: string, coverage?: string }): Promise<string> {
  try {
    // Handle comprehensive mode for audio explanations
    if (mode === "comprehensive") {
      const durationHint = options?.duration === "1-2min" ? 
        "Create an explanation that would take approximately 1-2 minutes when read aloud at a normal speaking pace." : 
        "";
      
      const coverageHint = options?.coverage === "complete" ? 
        "Ensure the explanation covers all key points from the content comprehensively." : 
        "";
      
      let styleHint = "";
      if (style === "expert") {
        styleHint = "Explain as if you're an expert in the field, using professional language while remaining clear and educational.";
      } else if (style === "accessible") {
        styleHint = "Explain in a way that's easily understandable to a general audience, using clear language and avoiding unnecessary jargon.";
      } else if (style === "teacher") {
        styleHint = "Explain as if you're a teacher speaking to a student, being educational and engaging.";
      }
      
      const prompt = `Provide a detailed explanation of the following content. ${styleHint} ${durationHint} ${coverageHint}\n\nCONTENT:\n"${text}"`;
      
      const response = await generateWithRetry({ model: "gemini-2.5-flash", contents: prompt }, 4);
      return response.text || "Unable to generate explanation. Please try again.";
    }
    
    // Handle standard short/medium/long explanations
    // Increase word limits for teacher-style explanations
    const targets = { 
      short: style === "teacher" ? 20 : 10, 
      medium: style === "teacher" ? 40 : 20, 
      long: style === "teacher" ? 100 : 50 
    } as const;
    
    const selected: "short" | "medium" | "long" = mode as "short" | "medium" | "long" || "medium";
    const targetWords = targets[selected];
    const isTeacherStyle = style === "teacher";

    const styleHint = isTeacherStyle
      ? selected === "short"
        ? `Explain as if you're a teacher speaking to a student. Use about ${targetWords} words (max ${targetWords}). Be clear and engaging.`
        : selected === "medium"
        ? `Explain as if you're a teacher speaking to a student. Use about ${targetWords} words (max ${targetWords}). Include a simple explanation and one key point.`
        : `Explain as if you're a teacher speaking to a student. Use about ${targetWords} words (max ${targetWords}). Include a clear explanation, 2-3 key points, and a simple example if relevant.`
      : selected === "short"
        ? `Write a single, plain sentence in about ${targetWords} words (strictly <= ${targetWords}). No headings, no bullets, no quotes, no examples—just the core meaning.`
        : selected === "medium"
        ? `Write about ${targetWords} words (strictly <= ${targetWords}) in 1–2 short sentences or 2–3 tight bullets. Avoid fluff and repetition.`
        : `Write about ${targetWords} words (strictly <= ${targetWords}) in 3–5 compact bullets covering gist, key points, and one quick example.`;

    const prompt = `Explain the text for a student. ${styleHint}\n\nTEXT:\n"${text}"`;

    const response = await generateWithRetry({ model: "gemini-2.5-flash", contents: prompt }, 4);

    const raw = response.text || "Unable to generate explanation. Please try again.";

    // Enforce maximum word counts to guarantee brevity for short selections
    const limitWords = (s: string, maxWords: number) => {
      const cleaned = s
        .replace(/[*#`_>-]+/g, " ") // strip markdown-ish chars
        .replace(/\s+/g, " ")
        .trim();
      const words = cleaned.split(/\s+/);
      if (words.length <= maxWords) return cleaned;
      return words.slice(0, maxWords).join(" ") + " …";
    };

    // Enforce strict word limits (no overflow)
    return limitWords(raw, targetWords);
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw new Error("Failed to generate explanation. Please try again.");
  }
}

// These functions are now imported from youtube.ts
// Keeping them here for backward compatibility
export { extractVideoIdFromUrl, getVideoThumbnail } from "./youtube";
