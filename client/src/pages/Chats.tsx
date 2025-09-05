import { Layout } from "@/components/Layout";
import { ChatInterface } from "@/components/ChatInterface";
import { useAuth } from "@/hooks/useAuth";

export default function Chats({ searchQuery = "" }) {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="h-full">
        {user ? (
          <ChatInterface userId={user.id} searchQuery={searchQuery} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-4">Please log in to access chats</h1>
              <p className="text-muted-foreground">
                You need to be authenticated to use the chat feature.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
