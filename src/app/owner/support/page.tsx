"use client";

import { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Grid, Rows, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/card';

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
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
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
    const base = 'text-xs px-2 py-1 rounded-full border';
    switch (status) {
      case 'OPEN': return base + ' bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return base + ' bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'RESOLVED': return base + ' bg-green-100 text-green-700 border-green-200';
      case 'CLOSED': return base + ' bg-gray-100 text-gray-700 border-gray-200';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2F2626]">Support Tickets</h1>
          <p className="text-sm text-[#6B5E5E] mt-1">Manage user support requests and tickets</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Grid view"
            onClick={() => setLayout('grid')}
            className={`p-2 rounded-lg border ${layout === 'grid' ? 'bg-[#D2B193] border-[#D2B193] text-white' : 'border-[#EADCCE] text-[#2F2626]'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            aria-label="List view"
            onClick={() => setLayout('list')}
            className={`p-2 rounded-lg border ${layout === 'list' ? 'bg-[#D2B193] border-[#D2B193] text-white' : 'border-[#EADCCE] text-[#2F2626]'}`}
          >
            <Rows className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tickets panel */}
        <div className="xl:col-span-2">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#D2B193]/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-[#D2B193]" />
              </div>
              <h2 className="text-xl font-semibold text-[#2F2626] mb-2">No Tickets Yet</h2>
              <p className="text-[#6B5E5E]">Users' submitted tickets will appear here.</p>
            </div>
          ) : (
            <div className={layout === 'grid' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-3'}>
              {tickets.map(t => (
                <Card
                  key={t.id}
                  onClick={() => fetchTicketDetail(t.id)}
                  className={`cursor-pointer transition-all ${selectedTicket?.id === t.id ? 'ring-2 ring-[#D2B193]' : ''}`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-[#2F2626] line-clamp-1 flex-1 pr-2">{t.subject}</h3>
                      {getStatusIcon(t.status)}
                    </div>
                    <p className="text-sm text-[#6B5E5E] mb-2 line-clamp-2">{truncate(t.description, 15)}</p>
                    <div className="flex items-center justify-between">
                      <span className={getStatusBadge(t.status)}>{t.status.replace('_', ' ')}</span>
                      <span className="text-xs text-[#6B5E5E]">
                        {(t.user.firstName && t.user.lastName) ? `${t.user.firstName} ${t.user.lastName}` : t.user.email}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Detail / Chat panel */}
        <div className="xl:col-span-1">
          <div className="rounded-2xl border border-[#EADCCE] bg-white/75 backdrop-blur flex flex-col h-full">
            {!selectedTicket ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-[#6B5E5E]">
                <div>
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[#D2B193]" />
                  <p>Select a ticket to view conversation</p>
                </div>
              </div>
            ) : detailLoading ? (
              <div className="flex-1 p-5 space-y-4">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className="max-w-[75%]">
                      <Skeleton className="h-16 w-full rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-[#EADCCE]">
                  <h2 className="text-lg font-semibold text-[#2F2626] mb-1">{selectedTicket.subject}</h2>
                  <div className="flex items-center justify-between">
                    <span className={getStatusBadge(selectedTicket.status)}>{selectedTicket.status.replace('_', ' ')}</span>
                    <span className="text-xs text-[#6B5E5E]">
                      {(selectedTicket.user.firstName && selectedTicket.user.lastName) ? `${selectedTicket.user.firstName} ${selectedTicket.user.lastName}` : selectedTicket.user.email}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {selectedTicket.messages?.map(m => (
                    <div key={m.id} className={`flex ${m.isAdmin ? 'justify-start' : 'justify-end'}`}> 
                      <div className={`${m.isAdmin ? 'bg-gradient-to-br from-[#F5EFE6] to-[#E9DCC9]' : 'bg-gradient-to-br from-[#D2B193] to-[#E9DCC9]'} rounded-2xl px-4 py-3 max-w-[75%] text-[#2F2626]`}> 
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">{m.isAdmin ? 'Admin' : m.senderName}</span>
                          <span className="text-xs opacity-60">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {(selectedTicket.status !== 'CLOSED') && (
                  <div className="p-4 border-t border-[#EADCCE]">
                    <div className="flex gap-2">
                      <input
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                        placeholder="Type a reply..."
                        className="flex-1 px-3 py-2 rounded-xl border border-[#EADCCE] bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#D2B193] text-[#2F2626]"
                      />
                      <button
                        disabled={sending || !reply.trim()}
                        onClick={sendReply}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D2B193] to-[#E9DCC9] text-[#2F2626] font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
