'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

type ViewType = 'phone' | 'messages';
type MessageType = {
  id: string;
  content: string;
  type: 'sent' | 'received';
  timestamp: string;
};

// SVG Phone icons as components
const PhoneIcon = () => (
  // ... (mantén el código SVG existente)
);

const PhoneEndIcon = () => (
  // ... (mantén el código SVG existente)
);

const MessageIcon = () => (
  // ... (mantén el código SVG existente)
);

export default function PhoneSimulator() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [duration, setDuration] = useState(0);
  const [isInCall, setIsInCall] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [view, setView] = useState<ViewType>('phone');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);

  const twilioNumber = '15878054698';
  const serverUrl = 'https://mi-servidor-twilio-4.onrender.com';

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

  useEffect(() => {
    const checkForIncomingCalls = async () => {
      try {
        const response = await axios.get(`${serverUrl}/check-incoming-call`);
        if (response.data.incomingCall) {
          setIsRinging(true);
          // Reproduce un sonido de llamada entrante aquí
        }
      } catch (error) {
        console.error('Error checking for incoming calls:', error);
      }
    };

    const intervalId = setInterval(checkForIncomingCalls, 5000);

    return () => clearInterval(intervalId);
  }, []);

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

  const handleCall = async () => {
    if (!phoneNumber) return;
    try {
      await axios.post(`${serverUrl}/make-call`, { to: phoneNumber, from: twilioNumber });
      setIsInCall(true);
    } catch (error) {
      console.error('Error making call:', error);
    }
  };

  const handleAnswerCall = async () => {
    try {
      await axios.post(`${serverUrl}/answer-call`);
      setIsRinging(false);
      setIsInCall(true);
    } catch (error) {
      console.error('Error answering call:', error);
    }
  };

  const handleEndCall = async () => {
    try {
      await axios.post(`${serverUrl}/end-call`);
      setIsInCall(false);
      setIsRinging(false);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const sendMessage = async () => {
    if (!message || !phoneNumber) return;
    try {
      await axios.post(`${serverUrl}/send-sms`, { to: phoneNumber, body: message, from: twilioNumber });
      const newMessage: MessageType = {
        id: Date.now().toString(),
        content: message,
        type: 'sent',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  // ... (mantén el código del return existente, pero actualiza los manejadores de eventos)

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
                  {isRinging && (
                    <div className="text-sm text-red-600 mt-2">
                      Llamada entrante...
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
                  {!isInCall && !isRinging ? (
                    <button
                      onClick={handleCall}
                      disabled={!phoneNumber}
                      className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center disabled:opacity-50 hover:bg-green-600 transition-all shadow-lg"
                    >
                      <PhoneIcon />
                    </button>
                  ) : isRinging ? (
                    <button
                      onClick={handleAnswerCall}
                      className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all shadow-lg"
                    >
                      <PhoneIcon />
                    </button>
                  ) : (
                    <button
                      onClick={handleEndCall}
                      className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                    >
                      <PhoneEndIcon />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Messages Interface (mantén el código existente)
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
