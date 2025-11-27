"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageSquare, Clock, CheckCircle2, XCircle } from "lucide-react";

interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  message: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const cacheKey = "support_tickets_v1";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const persistToCache = useCallback(
    (data: SupportTicket[]) => {
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ tickets: data, ts: Date.now() })
        );
      } catch (err) {
        console.warn("Unable to cache tickets", err);
      }
    },
    [cacheKey]
  );

  const hydrateFromCache = useCallback(() => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { tickets?: SupportTicket[] };
      if (parsed?.tickets?.length) {
        setTickets(parsed.tickets);
        setLoading(false);
      }
    } catch (err) {
      console.warn("Failed to read ticket cache", err);
    }
  }, [cacheKey]);

  useEffect(() => {
    hydrateFromCache();
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [hydrateFromCache]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/support/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        persistToCache(data);
        
        // Update selected ticket if it's still open
        if (selectedTicket) {
          const updated = data.find((t: SupportTicket) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  }, [persistToCache, selectedTicket]);

  const createTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;

    setSending(true);
    // Optimistic ticket stub
    const tempId = `temp-${Date.now()}`;
    const optimisticTicket: SupportTicket = {
      id: tempId,
      subject: newTicketSubject,
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `temp-msg-${Date.now()}`,
          senderId: "me",
          senderName: "You",
          isAdmin: false,
          message: newTicketMessage,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    setTickets([optimisticTicket, ...tickets]);
    setSelectedTicket(optimisticTicket);
    persistToCache([optimisticTicket, ...tickets]);
    setNewTicketSubject("");
    setNewTicketMessage("");
    setShowNewTicket(false);

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: optimisticTicket.subject,
          message: optimisticTicket.messages[0].message,
        }),
      });

      if (res.ok) {
        const ticket = await res.json();
        const nextTickets = [ticket, ...tickets.filter((t) => t.id !== tempId)];
        setTickets(nextTickets);
        setSelectedTicket(ticket);
        persistToCache(nextTickets);
      } else {
        // rollback optimistic
        const nextTickets = tickets.filter((t) => t.id !== tempId);
        setTickets(nextTickets);
        setSelectedTicket(nextTickets[0] ?? null);
        persistToCache(nextTickets);
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setSending(true);
    const tempMessage: TicketMessage = {
      id: `temp-${Date.now()}`,
      senderId: "me",
      senderName: "You",
      isAdmin: false,
      message: newMessage,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    const optimisticTicket: SupportTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, tempMessage],
      updatedAt: new Date().toISOString(),
    };
    setSelectedTicket(optimisticTicket);
    const nextTickets = tickets.map((t) => (t.id === selectedTicket.id ? optimisticTicket : t));
    setTickets(nextTickets);
    persistToCache(nextTickets);
    setNewMessage("");

    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: tempMessage.message }),
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        const mergedTickets = tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t));
        setTickets(mergedTickets);
        setSelectedTicket(updatedTicket);
        persistToCache(mergedTickets);
      } else {
        // rollback optimistic message
        const rolledBack = {
          ...optimisticTicket,
          messages: optimisticTicket.messages.filter((m) => m.id !== tempMessage.id),
        };
        const mergedTickets = tickets.map((t) => (t.id === rolledBack.id ? rolledBack : t));
        setTickets(mergedTickets);
        setSelectedTicket(rolledBack);
        persistToCache(mergedTickets);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN": return <Clock className="w-4 h-4 text-blue-500" />;
      case "IN_PROGRESS": return <MessageSquare className="w-4 h-4 text-yellow-500" />;
      case "RESOLVED": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "CLOSED": return <XCircle className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-[#E9DCC9] text-[#8B6F47] border-[#D2B193]";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "RESOLVED": return "bg-green-100 text-green-700 border-green-200";
      case "CLOSED": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D2B193]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFAF8] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#3A2F2F] mb-2">Support Center</h1>
          <p className="text-[#3A2F2F]/60">Get help from our team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Tickets List */}
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-3xl border border-[#E9DCC9] p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#3A2F2F]">Your Tickets</h2>
              <button
                onClick={() => setShowNewTicket(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#D2B193] to-[#E9DCC9] text-[#3A2F2F] rounded-xl font-medium hover:scale-105 transition-transform"
              >
                New Ticket
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {tickets.length === 0 ? (
                <div className="text-center py-12 text-[#3A2F2F]/40">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No tickets yet</p>
                  <p className="text-sm mt-1">Create one to get started</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedTicket?.id === ticket.id
                        ? "bg-gradient-to-br from-[#F5EFE6] to-[#E9DCC9] border-[#D2B193] shadow-md"
                        : "bg-white/50 border-[#E9DCC9] hover:bg-[#FBFAF8]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-[#3A2F2F] line-clamp-1 flex-1">
                        {ticket.subject}
                      </h3>
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-[#3A2F2F]/50">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {ticket.messages.length > 0 && (
                      <p className="text-sm text-[#3A2F2F]/60 mt-2 line-clamp-1">
                        {ticket.messages[ticket.messages.length - 1].message}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl border border-[#E9DCC9] overflow-hidden flex flex-col">
            {showNewTicket ? (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-[#E9DCC9]">
                  <h2 className="text-2xl font-semibold text-[#3A2F2F]">Create New Ticket</h2>
                </div>
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-[#3A2F2F] mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      className="w-full px-4 py-3 rounded-xl border border-[#E9DCC9] bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#D2B193] text-[#3A2F2F]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3A2F2F] mb-2">
                      Message
                    </label>
                    <textarea
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      placeholder="Describe your issue in detail..."
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl border border-[#E9DCC9] bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#D2B193] text-[#3A2F2F] resize-none"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-[#E9DCC9] flex gap-3">
                  <button
                    onClick={() => setShowNewTicket(false)}
                    className="px-6 py-3 rounded-xl border border-[#E9DCC9] text-[#3A2F2F] hover:bg-[#FBFAF8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createTicket}
                    disabled={sending || !newTicketSubject.trim() || !newTicketMessage.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#D2B193] to-[#E9DCC9] text-[#3A2F2F] rounded-xl font-medium hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? "Creating..." : "Create Ticket"}
                  </button>
                </div>
              </div>
            ) : selectedTicket ? (
              <>
                <div className="p-6 border-b border-[#E9DCC9]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-[#3A2F2F] mb-2">
                        {selectedTicket.subject}
                      </h2>
                      <span className={`text-sm px-3 py-1 rounded-full border ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isAdmin ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          message.isAdmin
                            ? "bg-gradient-to-br from-[#F5EFE6] to-[#E9DCC9] text-[#3A2F2F]"
                            : "bg-gradient-to-br from-[#D2B193] to-[#E9DCC9] text-[#3A2F2F]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">
                            {message.isAdmin ? "Admin" : message.senderName}
                          </span>
                          <span className="text-xs opacity-60">
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {selectedTicket.status !== "CLOSED" && selectedTicket.status !== "RESOLVED" && (
                  <div className="p-6 border-t border-[#E9DCC9]">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 rounded-xl border border-[#E9DCC9] bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#D2B193] text-[#3A2F2F]"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-[#D2B193] to-[#E9DCC9] text-[#3A2F2F] rounded-xl font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#3A2F2F]/40">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Select a ticket to view conversation</p>
                  <p className="text-sm mt-1">Or create a new ticket to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
