"use client";

import { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Send, Clock, CheckCircle2, XCircle, Phone, Video, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  message: string;
  createdAt: string;
}

interface TicketUserInfo {
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  user: TicketUserInfo;
  messages?: TicketMessage[];
}

export default function OwnerSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/owner/tickets');
      if (!res.ok) return;
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (e) {
      console.error('Failed to load tickets', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTicketDetail = useCallback(async (ticketId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/owner/tickets/${ticketId}`);
      if (!res.ok) return;
      const data = await res.json();
      setSelectedTicket(data);
    } catch (e) {
      console.error('Failed to load ticket', e);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 15000); // refresh list every 15s
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const sendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const res = await fetch(`/api/owner/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedTicket(updated);
        setReply('');
        // Update main list status if changed
        setTickets(prev => prev.map(t => t.id === updated.id ? { ...t, status: updated.status } : t));
      }
    } catch (e) {
      console.error('Failed to send reply', e);
    } finally {
      setSending(false);
    }
  };

  const truncate = (text: string, words = 15) => {
    const parts = text.split(/\s+/);
    if (parts.length <= words) return text;
    return parts.slice(0, words).join(' ') + '…';
  };

  const getStatusBadge = (status: string) => {
    const base = 'text-[11px] px-2.5 py-1 rounded-full border';
    switch (status) {
      case 'OPEN': return base + ' bg-emerald-500/15 text-emerald-200 border-emerald-500/40';
      case 'IN_PROGRESS': return base + ' bg-amber-500/15 text-amber-200 border-amber-500/30';
      case 'RESOLVED': return base + ' bg-teal-500/15 text-teal-100 border-teal-500/30';
      case 'CLOSED': return base + ' bg-slate-700 text-slate-200 border-slate-600';
      default: return base;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'IN_PROGRESS': return <MessageSquare className="w-4 h-4 text-yellow-600" />;
      case 'RESOLVED': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'CLOSED': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-[#1f1f1f]">Support Tickets</h1>
        <p className="text-sm text-[#5b5b5b] mt-1">WhatsApp-style chat workspace for tickets</p>
      </div>

      <div className="rounded-3xl overflow-hidden border border-slate-800 bg-[#0f1115] text-slate-50 shadow-xl h-[calc(100vh-160px)] min-h-[620px] flex">
        {/* Left: ticket list */}
        <div className="w-full lg:w-1/3 max-w-md border-r border-slate-800 bg-[#10161c] flex flex-col">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm text-slate-300">Chats</p>
                <p className="text-xs text-slate-500">{tickets.length} open thread{tickets.length === 1 ? '' : 's'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded-full text-[11px] bg-slate-800 text-slate-300 border border-slate-700">ACTIVE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-500" />
                <p>No tickets yet</p>
              </div>
            ) : (
              tickets.map(t => {
                const isActive = selectedTicket?.id === t.id;
                const initials = (t.user.firstName?.[0] || '') + (t.user.lastName?.[0] || '');
                return (
                  <button
                    key={t.id}
                    onClick={() => fetchTicketDetail(t.id)}
                    className={`w-full px-4 py-3 flex gap-3 text-left hover:bg-slate-900 transition ${isActive ? 'bg-slate-900' : ''}`}
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500/70 to-teal-400/70 flex items-center justify-center text-sm font-semibold text-white">
                      {initials || t.user.email.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-100 truncate">{t.subject}</p>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">{getStatusIcon(t.status)} {t.status.replace('_',' ')}</span>
                      </div>
                      <p className="text-sm text-slate-400 truncate">{truncate(t.description, 10)}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {(t.user.firstName && t.user.lastName) ? `${t.user.firstName} ${t.user.lastName}` : t.user.email}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: chat thread */}
        <div className="flex-1 flex flex-col bg-[#0c0f13] relative">
          {!selectedTicket ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center space-y-3">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-600" />
                <p>Select a ticket to open the conversation</p>
              </div>
            </div>
          ) : detailLoading ? (
            <div className="flex-1 p-6 space-y-3">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className="max-w-[68%]">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0f1318]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/80 flex items-center justify-center text-sm font-semibold text-white">
                    {(selectedTicket.user.firstName?.[0] || '') + (selectedTicket.user.lastName?.[0] || '') || selectedTicket.user.email.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-50">{selectedTicket.subject}</p>
                    <p className="text-xs text-slate-500">{selectedTicket.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusBadge(selectedTicket.status)}>{selectedTicket.status.replace('_', ' ')}</span>
                  <button className="p-2 rounded-full hover:bg-slate-800 text-slate-300" aria-label="Video call">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-slate-800 text-slate-300" aria-label="Call">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-slate-800 text-slate-300" aria-label="Info">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.04) 2px, transparent 0)',
                  backgroundSize: '80px 80px',
                }}
              >
                {selectedTicket.messages?.map(m => {
                  const isAdmin = m.isAdmin;
                  const bubbleBase = 'rounded-2xl px-4 py-3 max-w-[68%] text-sm shadow-sm';
                  const bubbleStyle = isAdmin
                    ? 'bg-slate-800/80 text-slate-100 border border-slate-700'
                    : 'bg-emerald-600 text-white shadow-emerald-900/40';
                  return (
                    <div key={m.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                      <div className={`${bubbleBase} ${bubbleStyle}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wide">{isAdmin ? 'Admin' : m.senderName}</span>
                          <span className="text-[11px] opacity-70">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedTicket.status !== 'CLOSED' && (
                <div className="p-4 border-t border-slate-800 bg-[#0f1318]">
                  <div className="flex items-center gap-3">
                    <input
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                      placeholder="Type a reply"
                      className="flex-1 px-4 py-3 rounded-full bg-slate-900 border border-slate-800 text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 placeholder:text-slate-500"
                    />
                    <button
                      disabled={sending || !reply.trim()}
                      onClick={sendReply}
                      className="h-12 px-5 rounded-full bg-emerald-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50 hover:bg-emerald-500"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
