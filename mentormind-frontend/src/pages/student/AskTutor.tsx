import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Message {
  id: number;
  conversation_id: number;
  sender: "student" | "tutor";
  content: string;
  created_at: string;
}

interface Conversation {
  id: number;
  student_id: number;
  created_at: string;
  updated_at: string;
  last_message_snippet: string | null;
}

const AskTutor: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const fetchConversations = async () => {
    setLoadingHistory(true);
    try {
      const response = await axiosClient.get<Conversation[]>("/rag/conversations");
      setConversations(response.data);
      if (response.data.length > 0 && !currentConversationId) {
        // Select the most recent conversation if none is selected
        setCurrentConversationId(response.data[0].id);
      } else if (response.data.length === 0) {
        // If no conversations, ensure currentConversationId is null
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      toast.error("Failed to load chat history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    setLoadingHistory(true);
    try {
      const response = await axiosClient.get<Message[]>(
        `/rag/conversations/${conversationId}/messages`
      );
      setMessages(response.data);
    } catch (error) {
      console.error(`Failed to fetch messages for conversation ${conversationId}:`, error);
      toast.error("Failed to load messages for this chat.");
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (currentConversationId) {
      fetchMessages(currentConversationId);
    } else {
      setMessages([]); // Clear messages if no conversation is selected
    }
  }, [currentConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setQuestion("");
    toast.success("Started a new chat!");
  };

  const selectConversation = (id: number) => {
    setCurrentConversationId(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoadingAnswer(true);
    const userQuestion = question;
    setQuestion(""); // Clear input immediately

    // Add student's question to messages immediately
    const tempStudentMessage: Message = {
      id: Date.now(), // Temporary ID
      conversation_id: currentConversationId || 0, // Will be updated
      sender: "student",
      content: userQuestion,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempStudentMessage]);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        setLoadingAnswer(false);
        return;
      }

      const response = await fetch(`${apiUrl}/rag/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: userQuestion, conversation_id: currentConversationId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get answer from AI tutor.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let tutorAnswer = "";
      let receivedConversationId: number | null = null;

      // Create a temporary message for the tutor's streaming response
      const tempTutorMessage: Message = {
        id: Date.now() + 1, // Another temporary ID
        conversation_id: currentConversationId || 0, // Will be updated
        sender: "tutor",
        content: "",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempTutorMessage]);


      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunkString = decoder.decode(value, { stream: true });
        
        // Each chunk might contain multiple JSON objects or partial JSON
        const lines = chunkString.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const jsonChunk = JSON.parse(line);
            if (jsonChunk.conversation_id) {
              receivedConversationId = jsonChunk.conversation_id;
              if (!currentConversationId) {
                setCurrentConversationId(receivedConversationId);
              }
            } else if (jsonChunk.message_chunk) {
              tutorAnswer += jsonChunk.message_chunk;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === tempTutorMessage.id ? { ...msg, content: tutorAnswer } : msg
                )
              );
            } else if (jsonChunk.error) {
              throw new Error(jsonChunk.error);
            }
          } catch (parseError) {
            console.warn("Failed to parse JSON chunk:", line, parseError);
            // Handle cases where a chunk might not be a complete JSON object
            // For now, we'll just skip it or append as raw text if necessary
          }
        }
      }

      toast.success("Question submitted successfully!");
      // After streaming, re-fetch conversations and messages to get the final saved state
      await fetchConversations();
      if (receivedConversationId) {
        await fetchMessages(receivedConversationId);
      } else if (currentConversationId) {
        await fetchMessages(currentConversationId);
      }

    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to get answer from AI tutor.");
      // Remove the temporary tutor message if an error occurred during streaming
      setMessages((prev) => prev.filter(msg => msg.id !== tempTutorMessage.id));
    } finally {
      setLoadingAnswer(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#fdf8f4]">
      {/* Sidebar for Conversations */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
          <button
            onClick={startNewChat}
            className="px-4 py-2 bg-[#d4cbbf] text-gray-800 rounded-md hover:bg-[#c3b8a9] transition"
          >
            + New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingHistory && conversations.length === 0 ? (
            <p className="p-4 text-gray-500">Loading chats...</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-gray-500">No conversations yet. Start a new one!</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  currentConversationId === conv.id ? "bg-gray-100" : ""
                }`}
              >
                <p className="text-sm font-medium text-gray-800">
                  {conv.last_message_snippet || `Conversation ${conv.id}`}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(conv.updated_at), "MMM d, yyyy HH:mm")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="w-full flex justify-between items-center px-10 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="bg-black text-white font-bold px-2 py-1 rounded">M</div>
            <span className="font-semibold text-lg text-gray-800">MentorMind</span>
          </div>
          <nav className="space-x-8 text-gray-700 font-medium">
            <a href="/dashboard" className="hover:text-black">Dashboard</a>
            <a href="/ask-tutor" className="hover:text-black">Ask Tutor</a>
            <a href="/quiz" className="hover:text-black">Quiz</a>
            
          </nav>
        </header>

        {/* Messages Display */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fdf8f4]">
          {loadingHistory && currentConversationId ? (
            <p className="text-center text-gray-500">Loading messages...</p>
          ) : messages.length === 0 && currentConversationId === null ? (
            <p className="text-center text-gray-500">Start a new conversation with your AI tutor!</p>
          ) : messages.length === 0 && currentConversationId !== null ? (
            <p className="text-center text-gray-500">No messages in this conversation yet. Ask a question!</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "student" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xl p-3 rounded-lg shadow-md ${
                    msg.sender === "student"
                      ? "bg-[#d4cbbf] text-gray-800"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <p className="font-semibold">{msg.sender === "student" ? "You" : "Tutor"}</p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(msg.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-6 bg-white border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <textarea
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none text-gray-800"
              placeholder="Type your question here..."
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loadingAnswer}
            />
            <button
              type="submit"
              disabled={loadingAnswer || !question.trim()}
              className="px-6 py-3 bg-[#d4cbbf] text-gray-800 font-semibold rounded-md hover:bg-[#c3b8a9] transition disabled:opacity-60"
            >
              {loadingAnswer ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskTutor;