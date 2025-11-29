"use client";

import { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Send, Clock, CheckCircle2, XCircle, ArrowLeft, PlusCircle, PencilLine } from 'lucide-react';
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
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'General',
    priority: 'MEDIUM',
    message: '',
  });

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
      setShowNewTicket(false);
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

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

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
        setTickets(prev => prev.map(t => t.id === updated.id ? { ...t, status: updated.status } : t));
      }
    } catch (e) {
      console.error('Failed to send reply', e);
    } finally {
      setSending(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/owner/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newTicket.subject,
          description: newTicket.message,
          category: newTicket.category,
          priority: newTicket.priority,
          message: newTicket.message,
        }),
      });
      if (!res.ok) {
        console.error('Failed to create ticket');
        setCreating(false);
        return;
      }
      const created = await res.json();
      await fetchTickets();
      setSelectedTicket(created);
      setShowNewTicket(false);
      setNewTicket({ subject: '', category: 'General', priority: 'MEDIUM', message: '' });
      if (isMobile) window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error('Failed to create ticket', e);
    } finally {
      setCreating(false);
    }
  };

  const truncate = (text: string, words = 15) => {
    const parts = text.split(/\s+/);
    if (parts.length <= words) return text;
    return parts.slice(0, words).join(' ') + '.';
  };

  const getStatusBadge = (status: string) => {
    const base = 'text-[11px] px-2.5 py-1 rounded-full border';
    switch (status) {
      case 'OPEN': return base + ' bg-[#E7F6ED] text-[#1E7A46] border-[#C5E7D3]';
      case 'IN_PROGRESS': return base + ' bg-[#FFF4E2] text-[#B87312] border-[#F5D7A8]';
      case 'RESOLVED': return base + ' bg-[#E8F4FF] text-[#2B6CB0] border-[#C9E2FF]';
      case 'CLOSED': return base + ' bg-[#F2F2F2] text-[#4A4A4A] border-[#E1E1E1]';
      default: return base;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'IN_PROGRESS': return <MessageSquare className="w-4 h-4 text-[#B87312]" />;
      case 'RESOLVED': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'CLOSED': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-[#2D2424]">Support Tickets</h1>
        <p className="text-sm text-[#6B5E5E] mt-1">Manage requests in a chat-focused view</p>
      </div>

      <div className="rounded-3xl overflow-hidden border border-[#EADCCE] bg-gradient-to-br from-[#FCF7F1] to-white text-[#2D2424] shadow-xl h-[calc(100vh-180px)] min-h-[680px] flex flex-col md:flex-row">
        {/* Left: ticket list / new ticket */}
        <div className={`md:w-1/3 max-w-xl border-b md:border-b-0 md:border-r border-[#EADCCE] bg-white/80 backdrop-blur flex flex-col ${selectedTicket && isMobile ? 'hidden' : 'flex'}`}>
          <div className="px-4 py-3 border-b border-[#EADCCE] flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#2D2424] flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Chats</p>
              <p className="text-xs text-[#8A7C7C]">{tickets.length} open thread{tickets.length === 1 ? '' : 's'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewTicket(false)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${!showNewTicket ? 'bg-[#2D2424] text-white' : 'border border-[#D2B193] text-[#2D2424]'}`}
              >
                Tickets
              </button>
              <button
                onClick={() => { setShowNewTicket(true); setSelectedTicket(null); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${showNewTicket ? 'bg-[#D2B193] text-white' : 'border border-[#D2B193] text-[#2D2424]'}`}
              >
                <PlusCircle className="w-4 h-4" /> New
              </button>
            </div>
          </div>

          {!showNewTicket ? (
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
                <div className="p-6 text-center text-[#8A7C7C]">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 text-[#D2B193]" />
                  <p>No tickets yet</p>
                </div>
              ) : (
                tickets.map(t => {
                  const isActive = selectedTicket?.id === t.id;
                  const initials = (t.user.firstName?.[0] || '') + (t.user.lastName?.[0] || '');
                  return (
                    <button
                      key={t.id}
                      onClick={() => { fetchTicketDetail(t.id); }}
                      className={`w-full px-4 py-3 flex gap-3 text-left hover:bg-[#F7EFE6] transition ${isActive ? 'bg-[#F5E7D7]' : ''}`}
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#D2B193] to-[#B89B7B] flex items-center justify-center text-sm font-semibold text-white">
                        {initials || t.user.email.slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-[#2D2424] truncate">{t.subject}</p>
                          <span className="text-[11px] text-[#8A7C7C] flex items-center gap-1">{getStatusIcon(t.status)} {t.status.replace('_',' ')}</span>
                        </div>
                        <p className="text-sm text-[#6B5E5E] truncate">{truncate(t.description, 12)}</p>
                        <p className="text-xs text-[#8A7C7C] mt-1">
                          {(t.user.firstName && t.user.lastName) ? `${t.user.firstName} ${t.user.lastName}` : t.user.email}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <PencilLine className="w-4 h-4 text-[#D2B193]" />
                <p className="font-semibold text-[#2D2424]">Create Ticket</p>
              </div>
              <input
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Subject"
                className="w-full px-3 py-2 rounded-lg border border-[#EADCCE] bg-white text-[#2D2424] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/40"
              />
              <div className="flex gap-3">
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#EADCCE] bg-white text-sm text-[#2D2424] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/40"
                >
                  <option>General</option>
                  <option>Billing</option>
                  <option>Technical</option>
                  <option>Account</option>
                </select>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#EADCCE] bg-white text-sm text-[#2D2424] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/40"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <textarea
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                placeholder="Describe the issue..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[#EADCCE] bg-white text-[#2D2424] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/40 resize-none"
              />
              <div className="flex items-center justify-end">
                <button
                  onClick={createTicket}
                  disabled={creating || !newTicket.subject.trim() || !newTicket.message.trim()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D2B193] to-[#B89B7B] text-white font-semibold disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: chat thread */}
        <div className={`flex-1 flex flex-col bg-white relative ${selectedTicket ? 'flex' : isMobile ? 'hidden' : 'flex'}`}>
          {!selectedTicket ? (
            <div className="flex-1 flex items-center justify-center text-[#8A7C7C]">
              <div className="text-center space-y-3">
                <MessageSquare className="w-12 h-12 mx-auto text-[#D2B193]" />
                <p>Select a ticket to open the conversation</p>
              </div>
            </div>
          ) : detailLoading ? (
            <div className="flex-1 p-6 space-y-3">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className="max-w-[78%]">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-[#EADCCE] flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="p-2 rounded-full border border-[#EADCCE] text-[#2D2424]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D2B193] to-[#B89B7B] flex items-center justify-center text-sm font-semibold text-white">
                    {(selectedTicket.user.firstName?.[0] || '') + (selectedTicket.user.lastName?.[0] || '') || selectedTicket.user.email.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2D2424]">{selectedTicket.subject}</p>
                    <p className="text-xs text-[#8A7C7C]">{selectedTicket.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusBadge(selectedTicket.status)}>{selectedTicket.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gradient-to-b from-white to-[#F8F2EA]">
                {selectedTicket.messages?.map(m => {
                  const isAdmin = m.isAdmin;
                  const bubbleBase = 'rounded-2xl px-4 py-3 max-w-[78%] text-sm shadow-sm';
                  const bubbleStyle = isAdmin
                    ? 'bg-[#F5EFE6] text-[#2D2424] border border-[#EADCCE]'
                    : 'bg-[#D2B193] text-white border border-[#C7A37F]';
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
                <div className="p-4 border-t border-[#EADCCE] bg-white">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => setReply(prev => (prev ? `${prev}\nRequesting a call: please share a suitable time and number.` : 'Requesting a call: please share a suitable time and number.'))}
                      className="px-3 py-2 rounded-full border border-[#EADCCE] bg-[#F8F2EA] text-xs font-semibold text-[#2D2424]"
                    >
                      Request a call
                    </button>
                    <div className="flex items-center gap-3 flex-1 min-w-[220px]">
                      <input
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                        placeholder="Type a reply..."
                        className="flex-1 px-4 py-3 rounded-full border border-[#EADCCE] bg-white text-[#2D2424] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/40 placeholder:text-[#8A7C7C]"
                      />
                      <button
                        disabled={sending || !reply.trim()}
                        onClick={sendReply}
                        className="h-12 px-5 rounded-full bg-gradient-to-r from-[#D2B193] to-[#B89B7B] text-white font-semibold flex items-center gap-2 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    </div>
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
