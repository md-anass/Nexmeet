"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Participant } from "livekit-client";

type ChatMessage = {
  messageId: string;
  senderParticipantKey: string;
  senderDisplayName: string;
  recipientParticipantKey: string | null;
  recipientDisplayName: string | null;
  isPrivate: boolean;
  message: string;
  createdAt: string;
};
type ChatResponse = { messages?: unknown; error?: unknown };

function normalizeMessages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Partial<ChatMessage>;
    if (typeof row.messageId !== "string" || typeof row.senderParticipantKey !== "string" || typeof row.senderDisplayName !== "string" || typeof row.message !== "string" || typeof row.createdAt !== "string" || typeof row.isPrivate !== "boolean") return [];
    return [{ ...row, recipientParticipantKey: typeof row.recipientParticipantKey === "string" ? row.recipientParticipantKey : null, recipientDisplayName: typeof row.recipientDisplayName === "string" ? row.recipientDisplayName : null } as ChatMessage];
  });
}

export function ChatPanel({ open, meetingCode, participants, localParticipant, onClose, onUnreadChange }: { open: boolean; meetingCode: string; participants: Participant[]; localParticipant: Participant; onClose: () => void; onUnreadChange: (count: number) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recipient, setRecipient] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const initialized = useRef(false);
  const inFlight = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  const unreadCount = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const remoteParticipants = participants.filter((participant) => participant.identity !== localParticipant.identity);
  const selectedParticipant = remoteParticipants.find((participant) => participant.identity === recipient);
  const effectiveRecipient = selectedParticipant ? recipient : null;

  useEffect(() => {
    if (open) {
      unreadCount.current = 0;
      onUnreadChange(0);
    }
  }, [open, onUnreadChange]);

  useEffect(() => {
    let disposed = false;
    async function loadMessages() {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const response = await fetch(`/api/meetings/${meetingCode}/chat`, { cache: "no-store" });
        const result = (await response.json()) as ChatResponse;
        if (!response.ok || disposed) return;
        const nextMessages = normalizeMessages(result.messages).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
        const previousIds = new Set(messagesRef.current.map((message) => message.messageId));
        const added = nextMessages.filter((message) => !previousIds.has(message.messageId) && message.senderParticipantKey !== localParticipant.identity);
        messagesRef.current = nextMessages;
        setMessages(nextMessages);
        if (initialized.current && !open && added.length > 0) {
          unreadCount.current += added.length;
          onUnreadChange(unreadCount.current);
        }
        initialized.current = true;
      } catch {
        // Preserve messages through transient polling failures.
      } finally {
        inFlight.current = false;
      }
    }
    void loadMessages();
    const interval = window.setInterval(() => void loadMessages(), 2000);
    return () => { disposed = true; window.clearInterval(interval); };
  }, [meetingCode, localParticipant.identity, onUnreadChange, open]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !open) return;
    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 120;
    if (nearBottom) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/meetings/${meetingCode}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, recipientParticipantKey: effectiveRecipient }) });
      const result = (await response.json()) as ChatResponse;
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "send_failed");
      setDraft("");
      const refresh = await fetch(`/api/meetings/${meetingCode}/chat`, { cache: "no-store" });
      const refreshed = (await refresh.json()) as ChatResponse;
      if (refresh.ok) {
        const refreshedMessages = normalizeMessages(refreshed.messages).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
        messagesRef.current = refreshedMessages;
        setMessages(refreshedMessages);
      }
    } catch {
      setError("Unable to send this message.");
    } finally {
      setSending(false);
    }
  }

  return <aside id="nexmeet-chat-panel" aria-label="Chat" className={`fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 flex h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom))] max-h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom))] min-h-0 flex-col overscroll-contain rounded-t-3xl border border-white/10 bg-[#081126]/95 pb-0 text-white shadow-2xl shadow-black/50 backdrop-blur-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:max-h-none sm:w-96 sm:rounded-none sm:border-y-0 sm:border-r-0 sm:pb-0 ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0 sm:translate-x-full sm:translate-y-0"} transition duration-200`}>
    <header className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h2 className="font-semibold">Chat</h2><p className="text-xs text-slate-400">{messages.length} message{messages.length === 1 ? "" : "s"}</p></div><button type="button" onClick={onClose} aria-label="Close chat" title="Close chat" className="rounded-xl p-2 text-slate-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"><X className="size-5" /></button></header>
    <div className="border-b border-white/10 px-5 py-3"><label className="flex items-center gap-2 text-sm text-slate-300">To:<select value={effectiveRecipient ?? ""} onChange={(event) => setRecipient(event.target.value || null)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/60"><option value="" className="bg-[#081126]">Everyone</option>{remoteParticipants.map((participant) => <option key={participant.identity} value={participant.identity} className="bg-[#081126]">{participant.name || "Participant"}</option>)}</select></label></div>
    <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">{messages.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No messages yet.</p> : messages.map((message) => { const own = message.senderParticipantKey === localParticipant.identity; return <article key={message.messageId} className={`rounded-2xl border px-3 py-2.5 ${own ? "border-cyan-300/20 bg-cyan-300/10" : "border-white/10 bg-white/[0.04]"}`}><div className="flex items-baseline justify-between gap-2 text-xs"><p className="font-semibold text-slate-200">{own ? "You" : message.senderDisplayName}{message.isPrivate && <span className="ml-1.5 text-cyan-300">→ {own ? message.recipientDisplayName || "Participant" : "You"}</span>}</p><time className="shrink-0 text-slate-500">{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div><p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-100">{message.message}</p>{message.isPrivate && <span className="mt-1 inline-block text-[10px] font-medium uppercase tracking-wide text-cyan-300">Private</span>}</article>; })}<div ref={endRef} /></div>
    <div className="border-t border-white/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4">{error && <p role="alert" className="mb-2 text-xs text-red-200">{error}</p>}<form onSubmit={sendMessage} className="flex items-end gap-2"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={1} placeholder={selectedParticipant ? `Message ${selectedParticipant.name || "participant"}` : "Message Everyone"} aria-label={selectedParticipant ? `Message ${selectedParticipant.name || "participant"}` : "Message Everyone"} className="min-h-11 min-w-0 flex-1 resize-y rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><button type="submit" disabled={sending || !draft.trim()} className="rounded-xl bg-cyan-300 px-3.5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50">{sending ? "..." : "Send"}</button></form></div>
  </aside>;
}
