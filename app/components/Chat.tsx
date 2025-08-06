'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SEALION_MODELS = [
  { id: 'aisingapore/Llama-SEA-LION-v3.5-70B-R', name: 'SEA-LION v3.5 70B (Reinforcement)' },
  { id: 'aisingapore/Llama-SEA-LION-v3.5-8B-R', name: 'SEA-LION v3.5 8B (Reinforcement)' },
  { id: 'aisingapore/Llama-SEA-LION-v3-70B-IT', name: 'SEA-LION v3 70B (Instruction)' },
  { id: 'aisingapore/Gemma-SEA-LION-v3-9B-IT', name: 'Gemma SEA-LION v3 9B (Instruction)' },
];

const OPENAI_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'o3-mini-2025-01-31', name: 'o3-mini (reasoning)' },
  { id: 'o3-2025-04-16', name: 'o3 (most capable)' },
];

export default function Chat() {
  const [openaiMessages, setOpenaiMessages] = useState<Message[]>([]);
  const [sealionMessages, setSealionMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOpenaiModel, setSelectedOpenaiModel] = useState(OPENAI_MODELS[0].id);
  const [selectedSealionModel, setSelectedSealionModel] = useState(SEALION_MODELS[0].id);

  const clearChat = () => {
    setOpenaiMessages([]);
    setSealionMessages([]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    setOpenaiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setSealionMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const sendToOpenAI = async () => {
      try {
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userMessage, model: selectedOpenaiModel }),
        });

        const data = await response.json();
        
        if (response.ok) {
          setOpenaiMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } else {
          setOpenaiMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
        }
      } catch {
        setOpenaiMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get OpenAI response.' }]);
      }
    };

    const sendToSealion = async () => {
      try {
        const response = await fetch('/api/sealion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userMessage, model: selectedSealionModel }),
        });

        const data = await response.json();
        
        if (response.ok) {
          setSealionMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } else {
          setSealionMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
        }
      } catch {
        setSealionMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get SEA-LION response.' }]);
      }
    };

    try {
      await Promise.all([sendToOpenAI(), sendToSealion()]);
    } finally {
      setIsLoading(false);
    }
  };

  const ChatPanel = ({ 
    title, 
    messages, 
    selectedModel, 
    models, 
    onModelChange, 
    bgColor = "bg-blue-600",
    bgColorDark = "bg-blue-700" 
  }: {
    title: string;
    messages: Message[];
    selectedModel: string;
    models: typeof OPENAI_MODELS;
    onModelChange: (model: string) => void;
    bgColor?: string;
    bgColorDark?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
      <div className={`${bgColor} text-white p-4 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium">Model:</label>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className={`${bgColorDark} text-white border border-opacity-50 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30`}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Messages will appear here...</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? `${bgColor} text-white`
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <p>Thinking...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl text-black font-bold text-center mb-4">OpenAI vs SEA-LION</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChatPanel
          title="OpenAI"
          messages={openaiMessages}
          selectedModel={selectedOpenaiModel}
          models={OPENAI_MODELS}
          onModelChange={setSelectedOpenaiModel}
          bgColor="bg-gray-600"
          bgColorDark="bg-gray-700"
        />
        
        <ChatPanel
          title="SEA-LION"
          messages={sealionMessages}
          selectedModel={selectedSealionModel}
          models={SEALION_MODELS}
          onModelChange={setSelectedSealionModel}
          bgColor="bg-blue-600"
          bgColorDark="bg-blue-700"
        />
      </div>
      <div className="mt-6"><form onSubmit={sendMessage} className="max-w-2xl mx-auto">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message to compare responses..."
              className="flex-1 px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send to Both
            </button>
            <button
              type="button"
              onClick={clearChat}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </form>
        </div>
    </div>
  );
}