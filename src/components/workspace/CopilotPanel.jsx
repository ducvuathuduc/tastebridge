import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLang } from "@/lib/i18n";
import { api } from "@/api/client";

export default function CopilotPanel({ project, open, onClose }) {
  const { t, lang } = useLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    setMessages([]);
  }, [project.id]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    const history = messages.filter((m) => !m.error).map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: "user", content: message }]);
    setInput("");
    setBusy(true);
    try {
      const r = await api.copilot(project.id, { message, history, lang });
      setMessages((m) => [...m, { role: "assistant", content: r.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: err.message, error: true }]);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;
  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 flex max-h-[80vh] flex-col border-t border-border bg-background shadow-2xl sm:inset-x-auto sm:bottom-4 sm:right-4 sm:h-[560px] sm:w-[400px] sm:rounded-lg sm:border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <p className="text-sm font-medium">{t("co.title")}</p>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div>
            <p className="text-xs leading-relaxed text-muted-foreground">{t("co.sub")}</p>
            <div className="mt-4 flex flex-col gap-2">
              {["co.suggest1", "co.suggest2", "co.suggest3"].map((k) => (
                <button key={k} type="button" onClick={() => send(t(k))} className="rounded-md border border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
                  {t(k)}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                m.role === "user" ? "bg-foreground text-background" : m.error ? "border border-verdict-nogo/40 bg-verdict-nogo/10" : "border border-border"
              }`}
            >
              {m.role === "assistant" && !m.error ? (
                <div className="prose prose-sm prose-invert max-w-none [&_li]:my-0.5 [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        {busy && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> {t("co.thinking")}
          </p>
        )}
        <div ref={endRef} />
      </div>
      <form
        className="flex gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("co.placeholder")}
          className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40"
        />
        <button type="submit" className="btn-primary px-3" disabled={busy} aria-label={t("co.send")}>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </aside>
  );
}
