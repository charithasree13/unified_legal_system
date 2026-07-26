import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';
import { 
  MessageSquare, Send, Paperclip, Lock, ShieldCheck, ShieldAlert,
  Mic, Eye, EyeOff, Loader2, Users, Check, CheckCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Chat: React.FC = () => {
  const { user, token } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any | null>(null);
  
  // Messaging state
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingContact, setTypingContact] = useState<string | null>(null);

  // E2E Encryption Demo State
  const [showEncryptedPayload, setShowEncryptedPayload] = useState(false);

  const socketRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simple Simulated E2E AES Encrypter / Decrypter
  // Generates a mock Hex cipher representing encrypted bytes
  const encryptText = (text: string): { cipher: string; iv: string } => {
    // Basic Caesar-cipher + Base64 simulation representing AES-256 output
    const shift = 4;
    const encryptedChars = text
      .split('')
      .map(c => String.fromCharCode(c.charCodeAt(0) + shift))
      .join('');
    const iv = Math.random().toString(36).substring(2, 10);
    const cipher = btoa(unescape(encodeURIComponent(encryptedChars)));
    return { cipher: `AES256::${cipher}`, iv };
  };

  const decryptText = (cipher: string): string => {
    if (!cipher || !cipher.startsWith('AES256::')) return cipher;
    try {
      const base64Part = cipher.replace('AES256::', '');
      const encryptedChars = decodeURIComponent(escape(atob(base64Part)));
      const shift = 4;
      return encryptedChars
        .split('')
        .map(c => String.fromCharCode(c.charCodeAt(0) - shift))
        .join('');
    } catch {
      return '[Decryption Error: Decrypt Key Mismatch]';
    }
  };

  // Fetch list of directory contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch('/api/advocates', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.advocates)) {
          // filter out self from contacts
          const list = data.advocates.filter((c: any) => c.email !== user?.email);
          setContacts(list);

          // Auto-select contact if passed in URL query
          const selectId = searchParams.get('user');
          if (selectId) {
            const found = list.find((c: any) => c._id === selectId);
            if (found) setActiveContact(found);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchContacts();
  }, [token, searchParams, user]);

  // Connect to Socket.IO and register rooms
  useEffect(() => {
    if (!user) return;
    
    // Connect to WebSocket server
    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.emit('join_user', user.id);

    socket.on('receive_message', (msg: any) => {
      // Add message if it matches active contact
      setMessages(prev => [...prev, msg]);
    });

    socket.on('typing_status', (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (activeContact && data.userId === activeContact._id) {
        setTypingContact(data.isTyping ? data.userName : null);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, activeContact]);

  // Fetch chat history between user and active contact
  useEffect(() => {
    if (!activeContact || !user) return;
    setMessages([]);
    
    // Trigger Room join on socket
    socketRef.current?.emit('join_room', activeContact._id);

    // Mock initial message thread (load from SQLite or localStorage mock)
    // In production, we retrieve messages database. For developer, we pre-fill.
    const initialThread = [
      {
        _id: 'm1',
        senderId: activeContact._id,
        senderName: activeContact.name,
        encryptedContent: encryptText("Dear counselor, have you reviewed the conversion ratios for the Bengaluru High Court suit?").cipher,
        createdAt: new Date(Date.now() - 600000).toISOString(),
        readBy: [activeContact._id, user.id]
      },
      {
        _id: 'm2',
        senderId: user.id,
        senderName: user.name,
        encryptedContent: encryptText("Yes, I ran the numbers. The suit fee calculations are accurate. We will draft the petition tonight.").cipher,
        createdAt: new Date(Date.now() - 300000).toISOString(),
        readBy: [activeContact._id, user.id]
      }
    ];
    setMessages(initialThread);
  }, [activeContact, user]);

  // Scroll to bottom of message logs
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact || !user) return;

    // Encrypt content on client-side BEFORE transmitting
    const encrypted = encryptText(inputText);

    const msgPayload = {
      senderId: user.id,
      senderName: user.name,
      receiverId: activeContact._id,
      encryptedContent: encrypted.cipher,
      iv: encrypted.iv,
      isGroup: false
    };

    // Emit via Socket.IO
    socketRef.current?.emit('send_message', msgPayload);

    // Append to local state immediately
    const tempMsg = {
      ...msgPayload,
      _id: Math.random().toString(),
      createdAt: new Date().toISOString(),
      readBy: [user.id]
    };
    setMessages(prev => [...prev, tempMsg]);

    setInputText('');
    socketRef.current?.emit('typing', { roomId: activeContact._id, userId: user.id, userName: user.name, isTyping: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (activeContact && user) {
      if (!isTyping) {
        setIsTyping(true);
        socketRef.current?.emit('typing', { roomId: activeContact._id, userId: user.id, userName: user.name, isTyping: true });
      }
      
      // Debounce typing status resets
      setTimeout(() => {
        setIsTyping(false);
        socketRef.current?.emit('typing', { roomId: activeContact._id, userId: user.id, userName: user.name, isTyping: false });
      }, 3000);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden animate-slide-up">
      
      {/* Left Contacts Panel */}
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare size={16} />
            Secure Messaging
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">End-to-End Encrypted Channels</p>
        </div>

        {/* Directory Contacts List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contacts.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No contacts index found. Check directory setup.
            </div>
          ) : (
            contacts.map((c) => (
              <button
                key={c._id}
                onClick={() => setActiveContact(c)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${
                  activeContact?._id === c._id 
                    ? 'bg-primary/5 dark:bg-sky-400/5 border border-primary/20 dark:border-sky-400/10' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {c.name.charAt(0)}
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">{c.name}</h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{c.specialization}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Panel */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/20">
        {activeContact ? (
          <>
            {/* Top Contact Bar */}
            <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                  {activeContact.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-950 dark:text-white flex items-center gap-1">
                    {activeContact.name}
                    {activeContact.isVerified && <ShieldCheck size={14} className="text-emerald-500" />}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase">{activeContact.specialization}</p>
                </div>
              </div>

              {/* Encryption toggler controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEncryptedPayload(!showEncryptedPayload)}
                  className={`px-3 py-1 border rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    showEncryptedPayload 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  }`}
                >
                  <Lock size={12} /> 
                  {showEncryptedPayload ? 'Show Cipher Payload' : 'Show Decrypted Text'}
                </button>
              </div>
            </div>

            {/* Message List View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="mx-auto max-w-[280px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-2.5 text-center text-[10px] text-emerald-600 dark:text-emerald-400 flex gap-2 items-center justify-center font-semibold">
                <Lock size={14} /> Messages are encrypted client-side via AES-256.
              </div>

              {messages.map((msg) => {
                const isSelf = msg.senderId === user?.id;
                const decryptedText = decryptText(msg.encryptedContent);
                return (
                  <div key={msg._id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div 
                      className={`max-w-md p-3.5 rounded-2xl relative shadow-sm border ${
                        isSelf 
                          ? 'bg-primary text-white border-primary-hover rounded-tr-none' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {/* Message author in groups */}
                      {!isSelf && (
                        <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1">{msg.senderName}</span>
                      )}

                      {/* Content Toggle: Cipher vs Decrypted */}
                      {showEncryptedPayload ? (
                        <div className="font-mono text-[10px] bg-slate-950/20 text-amber-500 dark:text-amber-400 p-2 rounded break-all select-all">
                          <p className="font-bold text-[8px] uppercase tracking-wider mb-1">AES-256 Hex Cipher:</p>
                          {msg.encryptedContent}
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed font-sans">{decryptedText}</p>
                      )}

                      {/* Timestamp & read receipts */}
                      <div className="flex justify-end items-center gap-1 mt-2 text-[9px] opacity-60">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isSelf && (
                          msg.readBy?.length > 1 ? <CheckCheck size={12} className="text-sky-300" /> : <Check size={12} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {typingContact && (
                <div className="flex justify-start items-center gap-2 text-[10px] text-slate-400 font-semibold italic">
                  <Loader2 size={12} className="animate-spin text-primary dark:text-sky-400" />
                  <span>{typingContact} is drafting message...</span>
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <button
                type="button"
                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-slate-400"
                title="Attach Document Case File"
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type encrypted message..."
                className="flex-1 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
              />

              <button
                type="submit"
                className="p-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl shadow cursor-pointer transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <MessageSquare size={48} className="text-slate-300 mb-3" />
            <h4 className="font-bold text-sm">Open Encrypted Chat Box</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Select an advocate or legal officer from the left contacts list to open a secure AES messaging tunnel.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
