import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, MoreVertical, Edit, Trash2, Star } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface ChatCardProps {
  chat: {
    _id: string;
    title: string;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp: Date;
    }>;
    updatedAt: Date;
    isStarred?: boolean;
  };
  onSelect: (chatId: string) => void;
  onUpdateTitle: (chatId: string, newTitle: string) => void;
  onDelete: (chatId: string) => void;
  onStar: (chatId: string, starred: boolean) => void;
  isSelected?: boolean;
}

export function ChatCard({ 
  chat, 
  onSelect, 
  onUpdateTitle, 
  onDelete, 
  onStar,
  isSelected = false 
}: ChatCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);

  const handleTitleSubmit = () => {
    if (editTitle.trim()) {
      onUpdateTitle(chat._id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditTitle(chat.title);
      setIsEditing(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  const getLastMessage = () => {
    if (chat.messages.length === 0) return 'No messages yet';
    const lastMessage = chat.messages[chat.messages.length - 1];
    return lastMessage.content.length > 100 
      ? lastMessage.content.substring(0, 100) + '...' 
      : lastMessage.content;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={() => onSelect(chat._id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleTitleSubmit}
                autoFocus
                className="h-8 text-sm font-medium"
              />
            ) : (
              <div className="flex items-center gap-1">
                {chat.isStarred && (
                  <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />
                )}
                <CardTitle className="text-sm font-medium truncate">
                  {chat.title}
                </CardTitle>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onStar(chat._id, !chat.isStarred);
              }}>
                <Star className="mr-2 h-4 w-4" fill={chat.isStarred ? "currentColor" : "none"} />
                {chat.isStarred ? "Unstar" : "Star"}
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chat._id);
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {getLastMessage()}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{chat.messages.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(chat.updatedAt)}</span>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
