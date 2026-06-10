import React from "react";
import { CompanySettings } from "../types";
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  HelpCircle, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  Info,
  Layers
} from "lucide-react";

interface AiAssistantProps {
  settings: CompanySettings;
}

interface Message {
  role: "user" | "assistant";
  message: string;
}

export default function AiAssistant({ settings }: AiAssistantProps) {
  
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      message: `Greetings! I am **HR Pharma AI - Medical Warehouse Co-Pilot**. I am fully synced with your live pharmaceutical inventory state, medicine financial sheets, and supply chain purchase orders.

How can I assist you today? Feel free to ask me to:
- 📊 **Analyze medicine profit margin metrics in PKR**
- ⚠️ **Review critical low stock medicine levels (20 limit)**
- 🔮 **Predict pharmaceutical demand & reorder thresholds**
- 📑 **Summarize pharmacy client billing invoices**`
    }
  ]);

  const [inputMsg, setInputMsg] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    // Append user message
    const userMsg: Message = { role: "user", message: textToSend.trim() };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMsg("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: updatedHistory.slice(1, -1) // slice out initial greetings and current message to avoid redundancy
        })
      });

      if (!response.ok) {
        throw new Error("AI Assistant server timed out.");
      }

      const data = await response.json();
      if (data && data.message) {
        setMessages(prev => [...prev, { role: "assistant", message: data.message }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", message: "⚠️ Connection error. Received invalid package parameters." }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", message: `❌ **Process Failed**: ${err.message || "Failed to contact local AI engine."}` }]);
    } finally {
      setLoading(false);
    }
  };

  const executeQuickCommand = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Custom regex markdown inline parser
  const renderMarkdownMessage = (text: string) => {
    // splits on line breaks
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content = line;
      
      // Check if header
      if (content.startsWith("### ")) {
        return <h4 key={idx} className="text-zinc-200 font-bold text-sm mt-3 mb-1 font-sans">{content.replace("### ", "")}</h4>;
      }
      if (content.startsWith("## ")) {
        return <h3 key={idx} className="text-white font-bold text-base mt-4 mb-1.5 font-sans border-b border-zinc-900 pb-1">{content.replace("## ", "")}</h3>;
      }
      if (content.startsWith("# ")) {
        return <h2 key={idx} className="text-white font-bold text-lg mt-5 mb-2 font-sans">{content.replace("# ", "")}</h2>;
      }

      // Check if table row (e.g. contains | )
      if (content.includes("|") && content.split("|").length > 3) {
        // Simple helper to not render delimiter lines
        if (content.includes("---")) return null;
        const columns = content.split("|").map(col => col.trim()).filter(col => col !== "");
        return (
          <div key={idx} className="grid grid-cols-4 gap-2 bg-zinc-900/50 p-2 border border-zinc-900/80 rounded my-1 text-[11px] font-mono font-medium text-zinc-300">
            {columns.map((col, cIdx) => (
              <span key={cIdx} className="truncate">{col}</span>
            ))}
          </div>
        );
      }

      // Bold replacements
      let partArray: (string | React.ReactNode)[] = [];
      const boldRegex = /\*\*(.*?)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          partArray.push(content.substring(lastIndex, match.index));
        }
        partArray.push(<strong key={match.index} className="text-indigo-400 font-semibold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < content.length) {
        partArray.push(content.substring(lastIndex));
      }

      const finalSpan = partArray.length ? partArray : content;

      // Unordered list
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <div key={idx} className="flex gap-2 pl-3 mt-1 text-zinc-300">
            <span className="text-indigo-500">•</span>
            <p className="flex-1 leading-relaxed text-xs">{finalSpan}</p>
          </div>
        );
      }

      return (
        <p key={idx} className="leading-relaxed mb-1.5 text-zinc-300 text-xs">
          {finalSpan}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-sans font-bold tracking-tight text-white flex items-center gap-2">
            HR Pharma Co-Pilot
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 roundedbg-indigo-500/10 text-teal-400 border border-teal-500/20 bg-zinc-900">
              <Sparkles size={11} className="animate-spin" /> Deep Reasoning v3.5
            </span>
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Directly parse medical inventory contexts, predict sales curves, and analyze stock reordering thresholds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left Side: Suggestions dashboard cards */}
        <div className="bg-zinc-950 p-4.5 rounded-2xl border border-zinc-800 space-y-4 lg:col-span-1 flex flex-col justify-start">
          <div className="pb-2.5 border-b border-zinc-900">
            <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Layers size={14} className="text-zinc-500" />
              QUICK COMMAND PILLS
            </span>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => executeQuickCommand("Which items are currently low on stock, and what are their suppliers?")}
              className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 p-3 rounded-xl text-left text-xs font-sans text-zinc-300 flex items-start gap-2.5 transition-all hover:border-zinc-700 hover:translate-x-0.5"
            >
              <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Review Low Stock Alarms</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">List depleting units and sourcing channels.</p>
              </div>
            </button>

            <button
              onClick={() => executeQuickCommand("Provide a full profitability analysis. What are the margins across our core categories?")}
              className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 p-3 rounded-xl text-left text-xs font-sans text-zinc-300 flex items-start gap-2.5 transition-all hover:border-zinc-700 hover:translate-x-0.5"
            >
              <TrendingUp size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Analyze Profit Margins</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Get calculated percentage splits per category.</p>
              </div>
            </button>

            <button
              onClick={() => executeQuickCommand("Predict inventory demand and recommend reordering points for the upcoming month.")}
              className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 p-3 rounded-xl text-left text-xs font-sans text-zinc-300 flex items-start gap-2.5 transition-all hover:border-zinc-700 hover:translate-x-0.5"
            >
              <Sparkles size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Predict Sourcing Demand</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Retrieve statistical forecast insights.</p>
              </div>
            </button>
          </div>

          <div className="pt-4 mt-auto border-t border-zinc-900/60 text-[11px] text-zinc-550 leading-relaxed font-sans space-y-2">
            <div className="flex gap-1.5 text-zinc-500">
              <Info size={13} className="text-indigo-400 flex-shrink-0" />
              <p>All answers are calculated dynamically against the memory database.json state.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Conversation stream engine */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 lg:col-span-3 flex flex-col justify-between h-[520px] overflow-hidden">
          
          {/* Conversation stream display */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4 bg-zinc-950">
            {messages.map((m, idx) => {
              const isAi = m.role === "assistant";
              return (
                <div key={idx} className={`flex gap-3 items-start ${isAi ? "justify-start font-sans" : "justify-end font-sans"}`}>
                  {isAi && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-650/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={16} />
                    </div>
                  )}

                  <div className={`p-4 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                    isAi 
                      ? "bg-zinc-900/40 border border-zinc-900 text-zinc-300" 
                      : "bg-indigo-600 border border-indigo-500/50 text-white shadow-md shadow-indigo-600/10"
                  }`}>
                    {isAi ? renderMarkdownMessage(m.message) : <p>{m.message}</p>}
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-zinc-700">
                      <User size={15} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 items-start justify-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-650/10 border border-indigo-500/20 text-indigo-450 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <RefreshCw size={14} className="animate-spin text-indigo-400" />
                </div>
                <div className="bg-zinc-900/40 border border-zinc-900 text-zinc-400 p-3 rounded-lg text-xs font-mono">
                  Evaluating warehouse assets, generating analytical report vectors...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom input area */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-900">
            <div className="flex gap-2">
              <input
                type="text"
                disabled={loading}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage(inputMsg);
                }}
                placeholder="Ask Co-pilot about low stock, margin percentages, or demand predictions..."
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 outline-none text-white rounded-xl px-4 py-3 text-xs font-sans transition-colors"
              />
              <button
                disabled={loading || !inputMsg.trim()}
                onClick={() => handleSendMessage(inputMsg)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-4.5 py-3 rounded-xl flex items-center justify-center gap-1 transition-all disabled:opacity-40 shadow-lg shadow-indigo-650/15 cursor-pointer"
              >
                <Send size={14} /> Send
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
