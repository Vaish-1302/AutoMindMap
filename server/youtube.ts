interface YouTubeVideoDetails {
  title: string;
  description: string;
  duration: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  captions?: string;
}

interface YouTubeCaptionTrack {
  name: {
    simpleText: string;
  };
  languageCode: string;
  baseUrl: string;
}

export async function getVideoDetails(videoId: string): Promise<YouTubeVideoDetails> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  // Prefer official Data API when available
  if (apiKey) {
    try {
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics,contentDetails`;
      const videoResponse = await fetch(videoUrl);

      if (videoResponse.ok) {
        const videoData = await videoResponse.json();
        if (videoData.items && videoData.items.length > 0) {
          const video = videoData.items[0];

          // Try to get captions (optional)
          let captions = "";
          try {
            captions = await getVideoCaptions(videoId, apiKey);
          } catch (error) {
            console.log("Could not fetch captions:", error);
          }

          return {
            title: video.snippet.title,
            description: video.snippet.description,
            duration: video.contentDetails.duration,
            channelTitle: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt,
            viewCount: video.statistics.viewCount,
            captions,
          };
        }
      } else {
        console.warn("YouTube Data API returned status:", videoResponse.status);
      }
    } catch (err) {
      console.warn("YouTube Data API failed, will try oEmbed fallback:", err);
    }
  }

  // Fallback: use public oEmbed (no API key) for basic info
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const oembedRes = await fetch(oembedUrl);
  if (oembedRes.ok) {
    const oembed = await oembedRes.json();
    return {
      title: oembed.title,
      description: "",
      duration: "Unknown",
      channelTitle: oembed.author_name || "Unknown Channel",
      publishedAt: "",
      viewCount: "",
      captions: "",
    };
  }

  // Last-resort fallback: return minimal metadata instead of failing
  return {
    title: `YouTube Video ${videoId}`,
    description: "",
    duration: "Unknown",
    channelTitle: "Unknown Channel",
    publishedAt: "",
    viewCount: "",
    captions: "",
  };
}

async function getVideoCaptions(videoId: string, apiKey: string): Promise<string> {
  // First, get the list of available captions
  const captionsUrl = `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${apiKey}&part=snippet`;
  const captionsResponse = await fetch(captionsUrl);
  
  if (!captionsResponse.ok) {
    throw new Error(`Captions API error: ${captionsResponse.status}`);
  }

  const captionsData = await captionsResponse.json();
  
  if (!captionsData.items || captionsData.items.length === 0) {
    throw new Error("No captions available");
  }

  // Find English captions or the first available ones
  let captionTrack = captionsData.items.find((track: any) => 
    track.snippet.language === 'en' || track.snippet.language === 'en-US'
  );
  
  if (!captionTrack) {
    captionTrack = captionsData.items[0];
  }

  // Download the caption content
  const captionId = captionTrack.id;
  const downloadUrl = `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}&tfmt=srt`;
  
  const captionResponse = await fetch(downloadUrl);
  
  if (!captionResponse.ok) {
    throw new Error(`Caption download error: ${captionResponse.status}`);
  }

  const captionText = await captionResponse.text();
  
  // Parse SRT format and extract just the text
  return parseSRTToText(captionText);
}

function parseSRTToText(srtContent: string): string {
  // Split by double newlines to get individual subtitle blocks
  const blocks = srtContent.split('\n\n');
  const textLines: string[] = [];
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    // Skip the sequence number (first line) and timestamp (second line)
    // The actual text starts from the third line
    if (lines.length >= 3) {
      for (let i = 2; i < lines.length; i++) {
        const text = lines[i].trim();
        if (text && !text.includes('-->')) {
          // Clean up HTML tags and formatting
          const cleanText = text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .trim();
          
          if (cleanText) {
            textLines.push(cleanText);
          }
        }
      }
    }
  }
  
  return textLines.join(' ');
}

export function extractVideoIdFromUrl(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function getVideoThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}