'use client';

import { useState, useEffect } from 'react';

type ViewType = 'phone' | 'messages';
type MessageType = {
  id: string;
  content: string;
  type: 'sent' | 'received';
  timestamp: string;
};

// SVG Phone icons as components
const PhoneIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-6 h-6"
  >
    <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const PhoneEndIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-6 h-6"
  >
    <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
  </svg>
);

const MessageIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-6 h-6"
  >
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>
);

export default function PhoneSimulator() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [duration, setDuration] = useState(0);
  const [isInCall, setIsInCall] = useState(false);
  const [view, setView] = useState<ViewType>('phone');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInCall) {
      timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isInCall]);

  useEffect(() => {
    if (!isInCall) setDuration(0);
  }, [isInCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (value: string) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber(prev => prev + value);
    }
  };

  const handleCall = () => {
    if (!phoneNumber) return;
    setIsInCall(true);
  };

  const sendMessage = () => {
    if (!message || !phoneNumber) return;
    const newMessage: MessageType = {
      id: Date.now().toString(),
      content: message,
      type: 'sent',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-[380px] h-[780px] bg-black rounded-[40px] p-6 relative overflow-hidden shadow-xl">
        <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
          {/* Status Bar */}
          <div className="h-6 bg-gray-900 text-white text-xs flex items-center justify-between px-4">
            <span>{currentTime}</span>
            <span>4G</span>
          </div>

          {/* Main Content */}
          <div className="h-[calc(100%-6rem)] p-4">
            {view === 'phone' ? (
              // Phone Interface
              <div className="h-full flex flex-col">
                {/* Number Display */}
                <div className="text-center mb-8">
                  <input
                    type="text"
                    value={phoneNumber}
                    className="text-3xl text-black text-center w-full bg-transparent outline-none"
                    readOnly
                  />
                  {isInCall && (
                    <div className="text-sm text-gray-600 mt-2">
                      {formatDuration(duration)}
                    </div>
                  )}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleKeyPress(num.toString())}
                      className="h-16 rounded-full bg-gray-100 text-black flex items-center justify-center text-2xl hover:bg-gray-200 transition-colors"
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Call Controls */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setPhoneNumber(prev => prev.slice(0, -1))}
                    className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl hover:bg-gray-300 transition-all"
                  >
                    ←
                  </button>
                  {!isInCall ? (
                    <button
                      onClick={handleCall}
                      disabled={!phoneNumber}
                      className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center disabled:opacity-50 hover:bg-green-600 transition-all shadow-lg"
                    >
                      <PhoneIcon />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsInCall(false)}
                      className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                    >
                      <PhoneEndIcon />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Messages Interface
              <div className="h-full flex flex-col">
                <div className="flex-grow overflow-y-auto mb-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-2 ${msg.type === 'sent' ? 'text-right' : 'text-left'}`}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          msg.type === 'sent'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-black'
                        }`}
                      >
                        <span className="text-inherit">{msg.content}</span>
                        <div className="text-xs mt-1 opacity-75">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-grow p-2 border rounded-full text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Type a message..."
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || !phoneNumber}
                    className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-600 transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Bar */}
          <div className="h-12 bg-gray-50 absolute bottom-0 w-full flex justify-around items-center border-t border-gray-200">
            <button
              onClick={() => setView('phone')}
              className={`p-2 transition-colors ${view === 'phone' ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <PhoneIcon />
            </button>
            <button
              onClick={() => setView('messages')}
              className={`p-2 transition-colors ${view === 'messages' ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <MessageIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}