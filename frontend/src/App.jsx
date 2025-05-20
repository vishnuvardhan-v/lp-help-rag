import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ChatComponent() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      type: "text",
      text: "Hi! Ask me anything about the content.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    const newMessages = [
      ...messages,
      { sender: "user", type: "text", text: query },
    ];
    setMessages(newMessages);
    setQuery("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/search", { query });

      const botReply =
        res.data && res.data.summary
          ? {
              sender: "bot",
              type: "summary",
              summary: res.data.summary,
              url: res.data.url,
            }
          : {
              sender: "bot",
              type: "text",
              text: "Sorry, no match found.",
            };

      setMessages([...newMessages, botReply]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { sender: "bot", type: "text", text: "Oops! Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b font-semibold text-lg bg-blue-600 text-white rounded-t-xl">
        AI Assistant
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-md whitespace-pre-wrap px-4 py-3 rounded-lg shadow-md text-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {msg.type === "text" && msg.text}
              {msg.type === "summary" && (
                <>
                  <div>{msg.summary}</div>
                  <div className="mt-2">
                    <a
                      href={msg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline text-xs"
                    >
                      Read more
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-600 px-4 py-2 rounded-lg shadow-sm text-sm">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            placeholder="Type your message and press Enter..."
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
