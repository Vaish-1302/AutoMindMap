import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, MessageSquare, Bot, User } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { Message } from "./Message";
import { ChatInput } from "./ChatInput";
import { useToast } from "@/hooks/use-toast";

interface Chat {
  _id: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    attachments?: Array<{
      fileName: string;
      fileType: string;
      fileSize: number;
      fileUrl?: string;
    }>;
  }>;
  updatedAt: Date;
}

interface ChatInterfaceProps {
  userId: string;
  searchQuery?: string;
}

export function ChatInterface({ userId, searchQuery = "" }: ChatInterfaceProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  };

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch chats",
        variant: "destructive",
      });
    }
  };

  const createNewChat = async () => {
    if (isCreatingChat) return;
    
    setIsCreatingChat(true);
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: 'New Chat' }),
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats(prev => [newChat, ...prev]);
        setSelectedChat(newChat);
        toast({
          title: "Success",
          description: "New chat created",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  const selectChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const chat = await response.json();
        setSelectedChat(chat);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedChat || !content.trim()) return;

    const messageData = {
      role: 'user' as const,
      content: content.trim(),
      attachments: attachments?.map(file => ({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }))
    };

    try {
      // Add user message immediately for optimistic UI
      const updatedChat = {
        ...selectedChat,
        messages: [...selectedChat.messages, {
          ...messageData,
          timestamp: new Date(),
        }],
        updatedAt: new Date(),
      };
      setSelectedChat(updatedChat);
      setChats(prev => 
        prev.map(chat => 
          chat._id === selectedChat._id ? updatedChat : chat
        )
      );

      // Send to server
      const response = await fetch(`/api/chats/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const serverChat = await response.json();
        setSelectedChat(serverChat);
        setChats(prev => 
          prev.map(chat => 
            chat._id === selectedChat._id ? serverChat : chat
          )
        );

        // Generate AI response with full context
        await generateAIResponse(serverChat);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const generateAIResponse = async (chat: Chat) => {
    try {
      // Add loading message
      const loadingMessage = {
        role: 'assistant' as const,
        content: '🤔 Analyzing your message and conversation history...',
        timestamp: new Date(),
      };
      
      const chatWithLoading = {
        ...chat,
        messages: [...chat.messages, loadingMessage],
      };
      setSelectedChat(chatWithLoading);

      // Call the new intelligent AI service
      const aiResponse = await fetch(`/api/chats/${chat._id}/generate-response`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (aiResponse.ok) {
        const finalChat = await aiResponse.json();
        
        setSelectedChat(finalChat);
        setChats(prev => 
          prev.map(c => c._id === chat._id ? finalChat : c)
        );
      } else {
        // Remove loading message on error
        setSelectedChat(chat);
        toast({
          title: "Error",
          description: "Failed to generate AI response",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Remove loading message on error
      setSelectedChat(chat);
      toast({
        title: "Error",
        description: "Failed to generate AI response",
        variant: "destructive",
      });
    }
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/title`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        const updatedChat = await response.json();
        setChats(prev => 
          prev.map(chat => 
            chat._id === chatId ? updatedChat : chat
          )
        );
        if (selectedChat?._id === chatId) {
          setSelectedChat(updatedChat);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chat title",
        variant: "destructive",
      });
    }
  };



  const starChat = async (chatId: string, starred: boolean) => {
    try {
      const endpoint = starred ? `/api/chats/${chatId}/star` : `/api/chats/${chatId}/unstar`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const updatedChat = await response.json();
        setChats(prev => 
          prev.map(chat => 
            chat._id === chatId ? updatedChat : chat
          )
        );
        if (selectedChat?._id === chatId) {
          setSelectedChat(updatedChat);
        }
        toast({
          title: "Success",
          description: starred ? "Chat starred" : "Chat unstarred",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: starred ? "Failed to star chat" : "Failed to unstar chat",
        variant: "destructive",
      });
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setChats(prev => prev.filter(chat => chat._id !== chatId));
        if (selectedChat?._id === chatId) {
          setSelectedChat(null);
        }
        toast({
          title: "Success",
          description: "Chat deleted",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  // Use the searchQuery prop if provided, otherwise use local search
  const effectiveSearchQuery = searchQuery || localSearchQuery;
  
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(effectiveSearchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chats
            </h2>
            <Button
              onClick={createNewChat}
              disabled={isCreatingChat}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {filteredChats.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No chats yet</p>
                <p className="text-sm">Start a new conversation</p>
              </div>
            ) : (
              filteredChats.map(chat => (
                <ChatCard
                  key={chat._id}
                  chat={chat}
                  onSelect={selectChat}
                  onUpdateTitle={updateChatTitle}
                  onDelete={deleteChat}
                  onStar={starChat}
                  isSelected={selectedChat?._id === chat._id}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedChat.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.messages.length} messages
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedChat.messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                    <p className="text-sm">Ask me anything or share a file to get started</p>
                  </div>
                ) : (
                  selectedChat.messages.map((message, index) => (
                    <Message
                      key={index}
                      message={message}
                      isLast={index === selectedChat.messages.length - 1}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t bg-background">
              <ChatInput
                onSendMessage={sendMessage}
                placeholder="Type your message or attach a file..."
              />
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to AutoMindMap Chat</h2>
              <p className="text-muted-foreground mb-6">
                Start a new conversation or select an existing chat to continue where you left off.
              </p>
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
                <Button onClick={createNewChat} disabled={isCreatingChat}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Chat
                </Button>
                {chats.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => selectChat(chats[0]._id)}
                    disabled={isCreatingChat}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Continue Recent Chat
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
