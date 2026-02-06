"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnalysisResult } from "@/lib/analysis/financial-engine";
import { FinancialModel } from "@/lib/models/financial-model";

// AI Personality Definitions
export interface AIPersonality {
  id: string;
  name: string;
  tagline: string;
  avatar: string; // Emoji or image path
  color: string;
  gradient: string;
  style: "professional" | "casual" | "witty" | "mentor";
  systemPrompt: string;
}

export const AI_PERSONALITIES: AIPersonality[] = [
  {
    id: "nova",
    name: "Nova",
    tagline: "Your Brilliant Financial Analyst",
    avatar: "✨",
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
    style: "professional",
    systemPrompt: `You are Nova, a brilliant and experienced financial analyst AI assistant. You provide clear, professional, and insightful analysis. You explain complex financial concepts in an accessible way while maintaining accuracy. You're confident but not arrogant, and you always back up your insights with data when available.`,
  },
  {
    id: "grok",
    name: "Grok",
    tagline: "Witty Finance with Attitude",
    avatar: "🚀",
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
    style: "witty",
    systemPrompt: `You are Grok, a witty and irreverent financial AI with a great sense of humor. You give excellent financial advice but with personality and occasional jokes. You're not afraid to be direct or use casual language. You make finance fun and accessible while still being genuinely helpful. Think of yourself as the cool friend who happens to be a financial genius.`,
  },
  {
    id: "sage",
    name: "Sage",
    tagline: "Wise Investment Mentor",
    avatar: "🦉",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-500",
    style: "mentor",
    systemPrompt: `You are Sage, a wise and patient financial mentor AI. You take a long-term view and focus on teaching users about sound financial principles. You often use analogies and stories to explain concepts. You're calm, reassuring, and always encourage users to think about the bigger picture. You channel the wisdom of legendary investors.`,
  },
  {
    id: "apex",
    name: "Apex",
    tagline: "Elite Quantitative Analyst",
    avatar: "📊",
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
    style: "professional",
    systemPrompt: `You are Apex, an elite quantitative analyst AI. You focus on numbers, ratios, and data-driven insights. You're precise, analytical, and thorough. You love diving deep into metrics and providing statistical analysis. You communicate in a clear, structured manner and always cite specific numbers when discussing financials.`,
  },
  {
    id: "spark",
    name: "Spark",
    tagline: "Energetic Startup Advisor",
    avatar: "⚡",
    color: "rose",
    gradient: "from-rose-500 to-red-500",
    style: "casual",
    systemPrompt: `You are Spark, an energetic and enthusiastic AI advisor specializing in startups and growth companies. You're optimistic, encouraging, and focused on opportunities and growth potential. You use casual language and are excited about innovation. You help users see the potential in their business while still being realistic about challenges.`,
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  personality?: string;
}

interface AIAssistantProps {
  model?: FinancialModel | null;
  analysis?: AnalysisResult | null;
  isOpen: boolean;
  onClose: () => void;
}

// Simulated AI response generator (replace with actual API call in production)
function generateAIResponse(
  message: string,
  personality: AIPersonality,
  model?: FinancialModel | null,
  analysis?: AnalysisResult | null
): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = getContextualResponses(message, personality, model, analysis);
      const response = responses[Math.floor(Math.random() * responses.length)];
      resolve(response);
    }, 800 + Math.random() * 1200);
  });
}

function getContextualResponses(
  message: string,
  personality: AIPersonality,
  model?: FinancialModel | null,
  analysis?: AnalysisResult | null
): string[] {
  const lowerMessage = message.toLowerCase();
  const companyName = model?.profile.companyName || "your company";
  const currency = model?.profile.currency || "USD";

  // Check for analysis data
  const hasAnalysis = analysis && analysis.baseCase;
  const revenue = hasAnalysis ? analysis.baseCase.yearlyFinancials[0]?.revenue : null;
  const ebitda = hasAnalysis ? analysis.baseCase.yearlyFinancials[0]?.ebitda : null;
  const netIncome = hasAnalysis ? analysis.baseCase.yearlyFinancials[0]?.netIncome : null;
  const dcfValue = hasAnalysis ? analysis.baseCase.dcfValuation.equityValue : null;
  const rating = analysis?.executiveSummary?.investmentRating;

  // Personality-specific greeting styles
  const greetings: Record<string, string[]> = {
    nova: [
      "I've analyzed the data thoroughly. Here's what I found...",
      "Based on my analysis, I can provide you with some insights...",
      "Let me break this down for you professionally...",
    ],
    grok: [
      "Alright, let's dive into the numbers! 🚀",
      "Time for some real talk about your finances...",
      "Here's the deal (and I'll try to make it fun)...",
    ],
    sage: [
      "Ah, a wise question. Let me share some perspective...",
      "In my experience, what matters most here is...",
      "Consider this wisdom from the markets...",
    ],
    apex: [
      "Running the numbers... Here's the quantitative breakdown:",
      "The data indicates the following metrics...",
      "Statistical analysis complete. Key findings:",
    ],
    spark: [
      "Love it! Let's talk growth potential! ⚡",
      "This is exciting stuff! Here's what I see...",
      "Great question! Let me break down the opportunities...",
    ],
  };

  // Questions about valuation
  if (lowerMessage.includes("valuation") || lowerMessage.includes("worth") || lowerMessage.includes("value")) {
    if (dcfValue && hasAnalysis) {
      const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(dcfValue);

      const responses: Record<string, string[]> = {
        nova: [
          `Based on my DCF analysis, ${companyName} has an estimated equity value of **${formattedValue}**. This takes into account projected cash flows, WACC of ${(analysis.baseCase.dcfValuation.wacc * 100).toFixed(1)}%, and terminal growth assumptions. The valuation appears ${rating === 'buy' || rating === 'strong_buy' ? 'attractive' : 'fair'} relative to industry benchmarks.`,
        ],
        grok: [
          `So you want to know what ${companyName} is worth? Let me check my crystal ball... Just kidding! 😄 The DCF model says **${formattedValue}**. Not too shabby! With a WACC of ${(analysis.baseCase.dcfValuation.wacc * 100).toFixed(1)}%, you're looking at a ${rating === 'buy' ? 'pretty sweet deal' : 'decent opportunity'}.`,
        ],
        sage: [
          `Valuation is both an art and a science, young investor. The discounted cash flow model suggests ${companyName} is valued at approximately **${formattedValue}**. Remember, as Benjamin Graham taught us, price is what you pay, value is what you get. Consider this alongside qualitative factors.`,
        ],
        apex: [
          `DCF Valuation Analysis Complete:\n• Equity Value: **${formattedValue}**\n• WACC: ${(analysis.baseCase.dcfValuation.wacc * 100).toFixed(2)}%\n• Terminal Value: ${((analysis.baseCase.dcfValuation.terminalValuePV / analysis.baseCase.dcfValuation.enterpriseValue) * 100).toFixed(1)}% of EV\n• Method: ${analysis.baseCase.dcfValuation.terminalMethod}`,
        ],
        spark: [
          `Ooh, the million dollar question! Actually, more like the **${formattedValue}** question! 🎯 That's what our DCF model values ${companyName} at. The fundamentals look ${rating === 'buy' ? 'super promising' : 'solid'} - there's real potential here!`,
        ],
      };
      return responses[personality.id] || responses.nova;
    }
    return [
      `I'd love to help with valuation, but I need more financial data first. Please complete the financial inputs or upload a file with your company's financials, and I'll run a comprehensive DCF analysis for you!`,
    ];
  }

  // Questions about revenue/growth
  if (lowerMessage.includes("revenue") || lowerMessage.includes("growth") || lowerMessage.includes("sales")) {
    if (revenue && hasAnalysis) {
      const cagr = analysis.baseCase.cagr.revenue;
      const formattedRevenue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(revenue);

      const responses: Record<string, string[]> = {
        nova: [
          `${companyName} is projecting **${formattedRevenue}** in revenue for the base year with a CAGR of **${(cagr * 100).toFixed(1)}%**. ${cagr > 0.15 ? 'This represents strong growth potential.' : cagr > 0.08 ? 'This shows healthy, sustainable growth.' : 'Growth appears moderate; consider strategies to accelerate revenue expansion.'}`,
        ],
        grok: [
          `Revenue check! 📈 ${companyName} is pulling in **${formattedRevenue}** with a ${(cagr * 100).toFixed(1)}% CAGR. ${cagr > 0.15 ? "That's cooking with gas!" : cagr > 0.08 ? "Steady as she goes!" : "Might want to step on the gas a bit!"} Not financial advice, just vibes. 😎`,
        ],
        sage: [
          `Revenue, the lifeblood of any business. ${companyName} shows **${formattedRevenue}** with ${(cagr * 100).toFixed(1)}% compound growth. ${cagr > 0.10 ? 'Growth like this, sustained over time, builds great fortunes.' : 'Remember, even mighty oaks grow slowly but surely.'} Focus on sustainable, profitable growth.`,
        ],
        apex: [
          `Revenue Metrics:\n• Base Revenue: **${formattedRevenue}**\n• Revenue CAGR: ${(cagr * 100).toFixed(2)}%\n• EBITDA CAGR: ${(analysis.baseCase.cagr.ebitda * 100).toFixed(2)}%\n• Net Income CAGR: ${(analysis.baseCase.cagr.netIncome * 100).toFixed(2)}%\n• FCF CAGR: ${(analysis.baseCase.cagr.fcf * 100).toFixed(2)}%`,
        ],
        spark: [
          `Let's talk growth! 🚀 ${companyName} is at **${formattedRevenue}** and growing at ${(cagr * 100).toFixed(1)}% CAGR! ${cagr > 0.15 ? "That's startup-level growth - love to see it!" : "Solid foundation to build from!"} The trajectory looks ${cagr > 0.10 ? "exciting" : "promising"}!`,
        ],
      };
      return responses[personality.id] || responses.nova;
    }
  }

  // Questions about profitability
  if (lowerMessage.includes("profit") || lowerMessage.includes("margin") || lowerMessage.includes("ebitda")) {
    if (ebitda && revenue && hasAnalysis) {
      const ebitdaMargin = (ebitda / revenue) * 100;
      const netMargin = netIncome ? (netIncome / revenue) * 100 : 0;

      const responses: Record<string, string[]> = {
        nova: [
          `Looking at profitability metrics for ${companyName}:\n\n• **EBITDA Margin: ${ebitdaMargin.toFixed(1)}%**\n• Net Profit Margin: ${netMargin.toFixed(1)}%\n\n${ebitdaMargin > 20 ? 'These are healthy margins indicating strong operational efficiency.' : ebitdaMargin > 10 ? 'Margins are reasonable but there may be room for improvement.' : 'Margins are tight - I recommend focusing on cost optimization and pricing strategies.'}`,
        ],
        grok: [
          `Profit margins! The stuff that makes accountants smile 😄\n\nEBITDA Margin: **${ebitdaMargin.toFixed(1)}%** ${ebitdaMargin > 20 ? "(chef's kiss 👨‍🍳)" : ebitdaMargin > 10 ? "(not bad!)" : "(room to grow!)"}\nNet Margin: ${netMargin.toFixed(1)}%\n\n${ebitdaMargin > 15 ? "Looking profitable! Money printer goes brrr!" : "Might want to tighten those belts a bit!"}`,
        ],
        sage: [
          `Profitability is the true test of a business. ${companyName} shows an EBITDA margin of **${ebitdaMargin.toFixed(1)}%** and net margin of ${netMargin.toFixed(1)}%. ${ebitdaMargin > 15 ? 'As Buffett says, look for companies with durable competitive advantages - good margins often signal this.' : 'Remember, even great companies sometimes need to focus on efficiency before scaling.'}`,
        ],
        apex: [
          `Profitability Analysis:\n• EBITDA: ${new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(ebitda)}\n• EBITDA Margin: **${ebitdaMargin.toFixed(2)}%**\n• Net Income Margin: ${netMargin.toFixed(2)}%\n• Operating Leverage: ${ebitdaMargin > netMargin * 1.5 ? 'High' : 'Moderate'}\n• Industry Comparison: ${ebitdaMargin > 15 ? 'Above Average' : 'Average'}`,
        ],
        spark: [
          `Profitability check! ⚡\n\n${companyName} is running at **${ebitdaMargin.toFixed(1)}%** EBITDA margin! ${ebitdaMargin > 20 ? "That's fantastic! You've got a money-making machine!" : ebitdaMargin > 10 ? "Solid foundation! Now let's talk about scaling!" : "Early stage margins - totally normal! Focus on product-market fit first!"} The path to profitability is looking ${netMargin > 0 ? "bright" : "promising"}!`,
        ],
      };
      return responses[personality.id] || responses.nova;
    }
  }

  // Questions about investment recommendation
  if (lowerMessage.includes("invest") || lowerMessage.includes("buy") || lowerMessage.includes("recommend") || lowerMessage.includes("should i")) {
    if (rating && hasAnalysis) {
      const ratingText = rating.replace(/_/g, ' ').toUpperCase();
      const confidence = analysis.executiveSummary.confidenceLevel;

      const responses: Record<string, string[]> = {
        nova: [
          `Based on comprehensive analysis, my investment rating for ${companyName} is: **${ratingText}** (${confidence} confidence).\n\n**Key Factors:**\n${analysis.executiveSummary.keyHighlights.slice(0, 3).map(h => `• ${h}`).join('\n')}\n\n*This is analytical output, not financial advice. Always conduct your own due diligence.*`,
        ],
        grok: [
          `Investment verdict? **${ratingText}!** ${rating.includes('buy') ? '🎯' : rating === 'hold' ? '🤔' : '⚠️'}\n\nConfidence level: ${confidence}\n\nLook, I'm not your financial advisor (I'm just a very clever AI), but the numbers ${rating.includes('buy') ? 'look pretty sweet' : rating === 'hold' ? 'are... fine?' : 'have some concerns'}. Do your own research, but here's food for thought!\n\n*Not financial advice, just robot opinions!*`,
        ],
        sage: [
          `Ah, the eternal question of whether to invest. For ${companyName}, the analysis suggests: **${ratingText}**.\n\nBut remember, young investor, no single metric tells the whole story. Consider:\n${analysis.executiveSummary.strengthsOpportunities.slice(0, 2).map(s => `• ${s}`).join('\n')}\n\nPatience and wisdom are an investor's greatest tools. *This is not financial advice.*`,
        ],
        apex: [
          `Investment Signal: **${ratingText}**\nConfidence: ${confidence.toUpperCase()}\n\nQuantitative Factors:\n• DCF Upside: ${dcfValue && analysis.model.profile.companyName ? 'Calculated' : 'N/A'}\n• Margin Profile: ${analysis.baseCase.averageRatios.ebitdaMargin > 0.15 ? 'Strong' : 'Moderate'}\n• Growth Trajectory: ${analysis.baseCase.cagr.revenue > 0.1 ? 'Above Market' : 'Market Rate'}\n\n*Quantitative analysis only. Not financial advice.*`,
        ],
        spark: [
          `Investment take? I'm saying **${ratingText}**! ${rating.includes('buy') ? '🚀🚀🚀' : '📊'}\n\nHere's why I'm ${rating.includes('buy') ? 'excited' : 'cautious'}:\n${analysis.executiveSummary.keyHighlights.slice(0, 2).map(h => `• ${h}`).join('\n')}\n\n${rating.includes('buy') ? 'The growth potential here is real!' : 'Sometimes patience pays off!'}\n\n*Not financial advice - just an enthusiastic AI!*`,
        ],
      };
      return responses[personality.id] || responses.nova;
    }
    return [
      `I'd need to complete a full analysis before making any investment recommendations. Please make sure your financial data is complete, then run the analysis. Once I have the numbers, I can give you a proper assessment!`,
    ];
  }

  // General greeting or help
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("help") || lowerMessage.length < 10) {
    const greetingResponses: Record<string, string[]> = {
      nova: [
        `Hello! I'm Nova, your financial analyst assistant. I can help you with:\n\n• **Valuation Analysis** - DCF, comparables, and more\n• **Financial Metrics** - Revenue, margins, ratios\n• **Investment Insights** - Recommendations and analysis\n• **Scenario Planning** - Best/worst case projections\n\nHow can I assist with your financial analysis today?`,
      ],
      grok: [
        `Hey there! 👋 I'm Grok, your witty finance buddy!\n\nI can help you understand:\n• What your company is actually worth 💰\n• Whether those profit margins are any good 📊\n• If you should be excited or worried 🎢\n• Random finance jokes (quality not guaranteed)\n\nWhat's on your mind?`,
      ],
      sage: [
        `Greetings, seeker of financial wisdom. I am Sage.\n\nI can guide you through:\n• The art of valuation\n• Understanding your financial health\n• Long-term investment thinking\n• Learning from the masters\n\nWhat financial wisdom do you seek today?`,
      ],
      apex: [
        `Apex Online. Ready for quantitative analysis.\n\nCapabilities:\n• DCF Valuation Models\n• Financial Ratio Analysis\n• Growth Rate Calculations\n• Sensitivity Analysis\n• Scenario Modeling\n\nSpecify your analytical requirements.`,
      ],
      spark: [
        `Hey hey! ⚡ Spark here, ready to energize your financial analysis!\n\nI'm great at:\n• Finding growth opportunities 📈\n• Breaking down complex numbers simply\n• Getting you excited about your potential!\n• Startup-friendly advice\n\nWhat are we diving into today?`,
      ],
    };
    return greetingResponses[personality.id] || greetingResponses.nova;
  }

  // Default contextual responses
  const defaultResponses: Record<string, string[]> = {
    nova: [
      `That's an interesting question about ${companyName}'s financials. ${hasAnalysis ? `Based on the analysis I have, the company shows ${analysis.executiveSummary.confidenceLevel} confidence metrics. Would you like me to dive deeper into any specific aspect?` : "To give you the most accurate insights, I'd recommend completing the financial inputs first. What specific metrics are you most interested in?"}`,
      `I appreciate the question! ${hasAnalysis ? `Looking at the current analysis, there are some key insights I can share about ${companyName}. What aspect would you like to explore?` : "Let me know what specific financial analysis you need, and I'll guide you through the process."}`,
    ],
    grok: [
      `Hmm, let me think about that one... 🤔 ${hasAnalysis ? `The data for ${companyName} is pretty interesting! What specific angle are you curious about?` : 'We should probably get some numbers in the system first - I work better with actual data than my imagination!'} What else you got?`,
      `Good question! ${hasAnalysis ? `I've got some thoughts on ${companyName}, but I want to make sure I'm answering what you're actually asking. Can you be more specific?` : "Let's get those financials loaded up and I'll have way more interesting things to say!"} 😄`,
    ],
    sage: [
      `A thoughtful question deserves a thoughtful answer. ${hasAnalysis ? `The analysis of ${companyName} reveals patterns worth discussing. What aspect calls to you?` : 'Before I can offer wisdom, we need the foundation of data. Have you completed the financial inputs?'}`,
      `Patience, young investor. ${hasAnalysis ? 'The numbers tell a story, and I sense you seek a specific chapter. Which part interests you most?' : 'First, we must gather the financial data. Then, the insights will follow.'}`,
    ],
    apex: [
      `Processing query... ${hasAnalysis ? `Analysis available for ${companyName}. Specify metric category for detailed breakdown: valuation, profitability, growth, or efficiency.` : 'Insufficient data for comprehensive analysis. Recommend completing financial inputs to enable full analytical capabilities.'}`,
      `Query noted. ${hasAnalysis ? 'Multiple analytical pathways available. Please specify: DCF analysis, ratio analysis, trend analysis, or scenario modeling.' : 'Data required for analysis. Please upload financial statements or complete manual input.'}`,
    ],
    spark: [
      `Ooh, I like where your head's at! 🌟 ${hasAnalysis ? `${companyName} has some interesting stuff going on! What specifically gets you excited?` : "We need to power up with some financial data first! Upload a file or fill in the inputs and let's go!"} `,
      `Great energy! ⚡ ${hasAnalysis ? "The potential here is real - what aspect do you want to explore?" : "Let's get those numbers in and see what we're working with!"} I'm ready when you are!`,
    ],
  };

  return defaultResponses[personality.id] || defaultResponses.nova;
}

export function AIAssistant({ model, analysis, isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<AIPersonality>(AI_PERSONALITIES[0]);
  const [showPersonalityPicker, setShowPersonalityPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add welcome message when personality changes or on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: getWelcomeMessage(selectedPersonality, model),
        timestamp: new Date(),
        personality: selectedPersonality.id,
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, selectedPersonality.id]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await generateAIResponse(
        userMessage.content,
        selectedPersonality,
        model,
        analysis
      );

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
        personality: selectedPersonality.id,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to generate response:", error);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, selectedPersonality, model, analysis]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePersonalityChange = (personality: AIPersonality) => {
    setSelectedPersonality(personality);
    setShowPersonalityPicker(false);
    setMessages([]); // Clear messages for new personality
  };

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    amber: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500" },
    purple: { bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500" },
    blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500" },
    rose: { bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500" },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className={`flex items-center justify-between border-b border-zinc-700 bg-gradient-to-r ${selectedPersonality.gradient} p-4`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl">
              {selectedPersonality.avatar}
            </div>
            <div>
              <h2 className="font-bold text-white">{selectedPersonality.name}</h2>
              <p className="text-sm text-white/80">{selectedPersonality.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPersonalityPicker(!showPersonalityPicker)}
              className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
              title="Change AI Personality"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Personality Picker Dropdown */}
        {showPersonalityPicker && (
          <div className="absolute left-4 right-4 top-20 z-10 rounded-xl border border-zinc-700 bg-zinc-800 p-2 shadow-xl">
            <p className="mb-2 px-2 text-xs font-medium text-zinc-400">Choose Your AI Assistant</p>
            <div className="space-y-1">
              {AI_PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePersonalityChange(p)}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                    p.id === selectedPersonality.id
                      ? `bg-gradient-to-r ${p.gradient} text-white`
                      : "hover:bg-zinc-700 text-zinc-300"
                  }`}
                >
                  <span className="text-2xl">{p.avatar}</span>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className={`text-xs ${p.id === selectedPersonality.id ? "text-white/80" : "text-zinc-500"}`}>
                      {p.tagline}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-zinc-700 text-white"
                    : `bg-gradient-to-br ${selectedPersonality.gradient} text-white`
                }`}
              >
                {message.role === "assistant" && (
                  <div className="mb-1 flex items-center gap-2 text-xs text-white/70">
                    <span>{selectedPersonality.avatar}</span>
                    <span>{selectedPersonality.name}</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return <strong key={i}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className={`rounded-2xl bg-gradient-to-br ${selectedPersonality.gradient} px-4 py-3`}>
                <div className="flex items-center gap-2">
                  <span className="text-white/70">{selectedPersonality.avatar}</span>
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="border-t border-zinc-800 px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {["What's the valuation?", "Tell me about profitability", "Investment recommendation?", "Explain the growth"].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInputValue(q);
                  inputRef.current?.focus();
                }}
                className="rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-zinc-700 bg-zinc-800/50 p-4">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${selectedPersonality.name} anything about your financials...`}
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={`rounded-xl p-3 transition-all ${
                inputValue.trim() && !isTyping
                  ? `bg-gradient-to-r ${selectedPersonality.gradient} text-white hover:opacity-90`
                  : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getWelcomeMessage(personality: AIPersonality, model?: FinancialModel | null): string {
  const companyName = model?.profile.companyName;
  const hasData = companyName && companyName.length > 0;

  const welcomes: Record<string, string> = {
    nova: hasData
      ? `Welcome! I'm Nova, your financial analyst assistant. I see you're working on ${companyName}. I'm ready to help you analyze the financials, understand valuations, and provide insights. What would you like to explore?`
      : `Welcome! I'm Nova, your professional financial analyst assistant. I can help you with valuations, financial analysis, and investment insights. To get started, please complete your financial inputs or upload a file. What questions do you have?`,
    grok: hasData
      ? `Yo! Grok here! 🚀 I see we're looking at ${companyName} - nice! Ready to dive into the numbers and have some fun while we're at it? Hit me with your questions!`
      : `Hey there! I'm Grok, your favorite (and most entertaining) financial AI! 😎 Upload some data or fill in those inputs, and let's make some finance magic happen! What's on your mind?`,
    sage: hasData
      ? `Greetings, seeker of wisdom. I am Sage. I see ${companyName} awaits our analysis. Together, we shall uncover the financial truths hidden within the numbers. What wisdom do you seek?`
      : `Welcome, young investor. I am Sage, here to guide you through the complexities of financial analysis. Begin by entering your data, and I shall help illuminate the path forward.`,
    apex: hasData
      ? `Apex Online. ${companyName} data detected. Ready for quantitative analysis. Available functions: DCF valuation, ratio analysis, growth metrics, scenario modeling. Awaiting query input.`
      : `Apex Online. No financial data detected. Recommend: Upload financial statements or complete manual data entry. Awaiting data input or analytical query.`,
    spark: hasData
      ? `Hey! ⚡ Spark here, super excited to dive into ${companyName}! Let's find those growth opportunities and figure out how to take things to the next level! What's first?`
      : `Hi there! ⚡ I'm Spark, and I'm pumped to help you analyze your business! Get that data uploaded and let's discover the exciting potential together! Ready when you are!`,
  };

  return welcomes[personality.id] || welcomes.nova;
}

// Floating Chat Button Component
export function AIChatButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 transition-transform hover:scale-110 hover:shadow-xl hover:shadow-amber-500/30"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </button>
  );
}
