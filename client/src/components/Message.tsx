import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    attachments?: Array<{
      fileName: string;
      fileType: string;
      fileSize: number;
      fileUrl?: string;
    }>;
  };
  isLast?: boolean;
}

export function Message({ message, isLast = false }: MessageProps) {
  const isUser = message.role === 'user';
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="w-8 h-8">
        <AvatarImage 
          src={isUser ? undefined : "/ai-avatar.png"} 
          alt={isUser ? "You" : "AI Assistant"}
        />
        <AvatarFallback className={cn(
          "text-xs font-medium",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isUser ? "U" : "AI"}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex-1 max-w-[80%]",
        isUser ? "text-right" : "text-left"
      )}>
        <Card className={cn(
          "inline-block",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          <CardContent className="p-3">
            <div className="space-y-2">
              <p className="text-sm whitespace-pre-wrap">
                {message.content}
              </p>
              
              {message.attachments && message.attachments.length > 0 && (
                <div className="space-y-2">
                  {message.attachments.map((attachment, index) => {
                    const FileIcon = getFileIcon(attachment.fileType);
                    return (
                      <div 
                        key={index}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md text-xs",
                          isUser 
                            ? "bg-primary-foreground/20 text-primary-foreground" 
                            : "bg-background/50"
                        )}
                      >
                        <FileIcon className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {attachment.fileName}
                          </p>
                          <p className="text-xs opacity-70">
                            {attachment.fileType} • {formatFileSize(attachment.fileSize)}
                          </p>
                        </div>
                        {attachment.fileUrl && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            onClick={() => window.open(attachment.fileUrl, '_blank')}
                          >
                            View
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className={cn(
          "mt-1 text-xs opacity-60",
          isUser ? "text-right" : "text-left"
        )}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
