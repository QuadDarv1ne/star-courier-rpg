"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/game/store";
import { CHARACTERS, getCharacter, relationshipStatus } from "@/game/data/characters";
import { Button } from "@/components/ui/button";

import { ArrowLeft, Send, Trash2, Users, Heart, Download, ImagePlus, X, MessageCircle, Lightbulb, Camera } from "lucide-react";
import { playSound } from "@/lib/audio";
import { EmojiPicker } from "@/components/game/EmojiPicker";
import { compressImage, estimateBase64Size, formatBytes } from "@/lib/image-compress";

export function ChatScreen() {
  const save = useGame((s) => s.save);
  const setScreen = useGame((s) => s.setScreen);
  const sendChatMessage = useGame((s) => s.sendChatMessage);
  const clearChatHistory = useGame((s) => s.clearChatHistory);
  const chatSelectedId = useGame((s) => s.chatSelectedId);
  const setChatSelected = useGame((s) => s.setChatSelected);
  const chatLoading = useGame((s) => s.chatLoading);

  const [input, setInput] = useState("");
  /** Pending image attachment (base64 data URL) */
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingImageCaption, setPendingImageCaption] = useState<string>("");
  const [imageCompressing, setImageCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedChar = useMemo(
    () => (chatSelectedId ? getCharacter(chatSelectedId) ?? null : null),
    [chatSelectedId]
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!scrollRef.current) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [save?.chatHistory, chatSelectedId, chatLoading]);

  // Focus input when selecting a character
  useEffect(() => {
    if (selectedChar && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedChar]);

  // Auto-grow textarea based on content
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
  }, [input]);

  // Escape → back to character list, Cmd/Ctrl+Enter → send
  useEffect(() => {
    if (!selectedChar) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !input && !chatLoading) {
        e.preventDefault();
        playSound("ui_back");
        setChatSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedChar, input, chatLoading, setChatSelected]);

  if (!save) {
    return (
      <div className="relative z-10 min-h-screen px-3 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono tracking-[0.3em] text-amber-300/70">
                ЧАТ С ЭКИПАЖЕМ
              </div>
              <div className="text-lg font-bold text-amber-100">Связь с «Элеей»</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { playSound("ui_click"); setScreen("menu"); }}
              onMouseEnter={() => playSound("ui_hover")}
              className="bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 border border-slate-600/40"
            >
              <ArrowLeft className="size-4" /> Назад
            </Button>
          </div>
          <div className="panel-glow clip-corner p-8 text-center">
            <Users className="mx-auto mb-3 size-12 text-amber-400/60" />
            <p className="text-sm text-slate-300 mb-2">Связь с экипажем недоступна.</p>
            <p className="text-xs text-slate-500">Начните новую игру, чтобы открыть чат с экипажем «Элеи».</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { playSound("ui_click"); setScreen("menu"); }}
              className="mt-4 bg-amber-500/20 text-amber-100 hover:bg-amber-500/35 border border-amber-400/40 clip-corner"
            >
              В главное меню
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const messages = chatSelectedId ? save.chatHistory[chatSelectedId] ?? [] : [];

  const handleSend = () => {
    if (!chatSelectedId || chatLoading) return;
    const trimmed = input.trim();
    if (!trimmed && !pendingImage) return;
    playSound("ui_click");
    sendChatMessage(chatSelectedId, trimmed, {
      image: pendingImage ?? undefined,
      imageCaption: pendingImageCaption.trim() || undefined,
    });
    setInput("");
    setPendingImage(null);
    setPendingImageCaption("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiPick = (emoji: string) => {
    if (!inputRef.current) {
      setInput((s) => s + emoji);
      return;
    }
    const ta = inputRef.current;
    const start = ta.selectionStart ?? input.length;
    const end = ta.selectionEnd ?? input.length;
    const newText = input.slice(0, start) + emoji + input.slice(end);
    setInput(newText);
    // Restore cursor position after the inserted emoji
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + emoji.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const loadImageAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Read failed"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      useGame.getState().pushToast("Можно загружать только изображения", "bad");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      useGame.getState().pushToast("Файл слишком большой (макс 5 МБ)", "bad");
      return;
    }
    playSound("ui_click");
    setImageCompressing(true);
    try {
      const raw = await loadImageAsDataUrl(file);
      const compressed = await compressImage(raw, 1024, 1024, 0.7);
      setPendingImage(compressed);
      setPendingImageCaption(file.name.replace(/\.[^.]+$/, ""));
    } catch {
      useGame.getState().pushToast("Не удалось загрузить изображение", "bad");
    } finally {
      setImageCompressing(false);
    }
    e.target.value = "";
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (!file) continue;
        e.preventDefault();
        if (file.size > 5 * 1024 * 1024) {
          useGame.getState().pushToast("Файл слишком большой (макс 5 МБ)", "bad");
          return;
        }
        playSound("ui_click");
        setImageCompressing(true);
        try {
          const raw = await loadImageAsDataUrl(file);
          const compressed = await compressImage(raw, 1024, 1024, 0.7);
          setPendingImage(compressed);
          setPendingImageCaption("Вставленное изображение");
        } catch {
          useGame.getState().pushToast("Не удалось загрузить изображение", "bad");
        } finally {
          setImageCompressing(false);
        }
        return;
      }
    }
  };

  const handleClear = () => {
    if (!chatSelectedId) return;
    if (!confirm(`Очистить историю чата с ${selectedChar?.name}?`)) return;
    playSound("ui_back");
    clearChatHistory(chatSelectedId);
  };

  const handleExport = () => {
    if (!chatSelectedId || !selectedChar) return;
    playSound("ui_click");
    const history = save?.chatHistory[chatSelectedId] ?? [];
    if (history.length === 0) {
      useGame.getState().pushToast("Чат пуст — нечего экспортировать", "info");
      return;
    }
    const lines = [
      `Чат с ${selectedChar.name} — ${selectedChar.role}`,
      `Star Courier · Глава ${save?.chapter ?? "?"}`,
      `Дата экспорта: ${new Date().toLocaleString()}`,
      "─".repeat(60),
      "",
    ];
    for (const m of history) {
      const time = new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const speaker = m.role === "user" ? "Капитан" : selectedChar.name;
      lines.push(`[${time}] ${speaker}:`);
      lines.push(m.content);
      lines.push("");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${selectedChar.id}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    playSound("ui_click");
    setChatSelected(null);
  };

  // Character list view (no character selected)
  if (!selectedChar) {
    return (
      <div className="relative z-10 min-h-screen px-3 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono tracking-[0.3em] text-amber-300/70">
                ЧАТ С ЭКИПАЖЕМ
              </div>
              <div className="text-lg font-bold text-amber-100">Связь с «Элеей»</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { playSound("ui_click"); setScreen(save ? "bridge" : "menu"); }}
              onMouseEnter={() => playSound("ui_hover")}
              aria-label="Назад"
              title="Назад"
              className="bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 border border-slate-600/40"
            >
              <ArrowLeft className="size-4" /> Назад
            </Button>
          </div>

          <p className="mb-4 text-xs text-slate-400">
            Выберите члена экипажа, чтобы начать разговор. ИИ-сознание каждого персонажа отвечает
            в своём стиле, учитывая ваши отношения и события сюжета.
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {CHARACTERS.map((c) => {
              const rel = save.relationships[c.id] ?? 0;
              const charHistory = save.chatHistory[c.id] ?? [];
              const hasHistory = charHistory.length > 0;
              const isRomanceable = !!c.romanceInterest;
              const romanceActive =
                isRomanceable &&
                c.romanceThreshold !== undefined &&
                rel >= c.romanceThreshold;

              return (
                <button
                  key={c.id}
                  onMouseEnter={() => playSound("ui_hover")}
                  onClick={() => { playSound("ui_click"); setChatSelected(c.id); }}
                  className={`flex items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                    hasHistory
                      ? "border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20"
                      : "border-slate-700/40 bg-slate-800/30 hover:bg-slate-700/40"
                  }`}
                >
                  <div
                    className="size-10 shrink-0 rounded-full border-2"
                    style={{ background: c.portraitColor, borderColor: `${c.portraitColor}88` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-amber-100">{c.name}</span>
                      {romanceActive && <Heart className="size-3 text-rose-400 fill-rose-400" />}
                    </div>
                    <div className="truncate text-[11px] text-slate-400">{c.role}</div>
                    <div className="text-[11px]" style={{ color: rel >= 20 ? "#7fffa0" : rel < 0 ? "#ff7a7a" : "#94a3b8" }}>
                      {relationshipStatus(rel)} · {rel > 0 ? `+${rel}` : rel}
                    </div>
                  </div>
                  {hasHistory && (
                    <span className="rounded bg-amber-500/30 px-1.5 py-0.5 text-[11px] font-mono font-bold text-amber-100">
                      {charHistory.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 panel-glow clip-corner p-3.5 text-[11px] text-slate-400">
            <p className="flex items-start gap-2 leading-relaxed">
              <Lightbulb className="size-3.5 shrink-0 mt-0.5 text-amber-400/70" />
              <span>Подсказка: члены экипажа отвечают в своём уникальном стиле. Развивайте отношения
              через сюжетные выборы — при высоком уровне близости открываются более тёплые,
              интимные реплики.</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Chat view (character selected)
  return (
    <div className="relative z-10 flex h-screen flex-col px-3 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-amber-400/15 pb-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              onMouseEnter={() => playSound("ui_hover")}
              aria-label="К списку экипажа"
              title="Назад"
              className="size-9 shrink-0 bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 border border-slate-600/40"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div
              className="size-10 shrink-0 rounded-full border-2"
              style={{ background: selectedChar.portraitColor, borderColor: `${selectedChar.portraitColor}88` }}
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-amber-100">{selectedChar.name}</div>
              <div className="truncate text-[11px] text-slate-400">{selectedChar.role}</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="hidden rounded-full border px-2.5 py-0.5 text-[11px] sm:inline-block"
              style={{
                color: (save.relationships[selectedChar.id] ?? 0) >= 20 ? "#7fffa0" : (save.relationships[selectedChar.id] ?? 0) < 0 ? "#ff7a7a" : "#94a3b8",
                borderColor: "currentColor",
              }}
            >
              {relationshipStatus(save.relationships[selectedChar.id] ?? 0)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExport}
              onMouseEnter={() => playSound("ui_hover")}
              aria-label="Экспорт чата в текстовый файл"
              title="Экспорт"
              disabled={messages.length === 0}
              className="size-9 bg-slate-800/40 text-amber-300/70 hover:bg-slate-700/60 border border-slate-600/40 disabled:opacity-30"
            >
              <Download className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              onMouseEnter={() => playSound("ui_hover")}
              aria-label="Очистить чат"
              title="Очистить историю"
              disabled={messages.length === 0}
              className="size-9 bg-slate-800/40 text-rose-400/70 hover:bg-slate-700/60 border border-slate-600/40 disabled:opacity-30"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto pr-2"
        >
          <div className="flex flex-col gap-3 pb-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto mt-4 max-w-md rounded-md border border-amber-400/30 bg-amber-500/5 p-4 text-center"
              >
                <div className="mb-2 flex items-center justify-center">
                  <MessageCircle className="size-6 text-amber-300/70" />
                </div>
                <p className="text-sm italic text-amber-100">
                  "{selectedChar.chatGreeting}"
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  — {selectedChar.name}
                </p>
                {selectedChar.chatSuggestions.length > 0 && (
                  <div className="mt-4">
                <p className="mb-2 text-[11px] uppercase tracking-wider text-amber-300/60 font-mono">
                      Попробуйте спросить:
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {selectedChar.chatSuggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            playSound("ui_click");
                            setInput(s);
                            inputRef.current?.focus();
                          }}
                          onMouseEnter={() => playSound("ui_hover")}
                          className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-100 transition-colors hover:border-amber-400/60 hover:bg-amber-500/20"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            {messages.map((m, idx) => {
              const isUser = m.role === "user";
              const hasImage = !!m.image;
              const hasText = !!m.content && m.content.length > 0;
              const isLastMessage = idx === messages.length - 1;
              const isStreaming = !isUser && isLastMessage && chatLoading && !hasImage;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      isUser
                        ? "bg-amber-500/20 text-amber-100 border border-amber-400/40"
                        : "bg-slate-800/60 text-slate-100 border border-slate-600/40"
                    }`}
                  >
                    {!isUser && (
                      <div
                        className="mb-0.5 text-[11px] font-bold"
                        style={{ color: selectedChar.portraitColor }}
                      >
                        {selectedChar.name}
                      </div>
                    )}
                    {hasImage && (
                      <div className={`mb-${hasText ? "2" : "0"} overflow-hidden rounded-md`}>
                        <img
                          src={m.image}
                          alt={m.imageCaption ?? "Фото"}
                          className="max-h-64 w-full object-cover"
                          loading="lazy"
                        />
                        {m.imageCaption && (
                          <div className="mt-1 flex items-center gap-1 px-1 text-[11px] italic text-slate-400">
                            <Camera className="size-3" /> {m.imageCaption}
                          </div>
                        )}
                      </div>
                    )}
                    {hasText && (
                      <div className="whitespace-pre-wrap break-words">
                        {m.content}
                        {isStreaming && (
                          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-amber-300 align-middle" />
                        )}
                      </div>
                    )}
                    {!hasText && !hasImage && (
                      <div className="flex items-center gap-1">
                        <span className="size-2 animate-pulse rounded-full bg-amber-400" style={{ animationDelay: "0ms" }} />
                        <span className="size-2 animate-pulse rounded-full bg-amber-400" style={{ animationDelay: "200ms" }} />
                        <span className="size-2 animate-pulse rounded-full bg-amber-400" style={{ animationDelay: "400ms" }} />
                      </div>
                    )}
                    {!isStreaming && (
                      <div className="mt-1 text-right text-[11px] text-slate-500">
                        {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Pending image preview (above input area) */}
        {imageCompressing && (
          <div className="mb-2 flex items-center gap-3 rounded-md border border-amber-400/40 bg-amber-500/10 p-3">
            <div className="size-12 shrink-0 animate-pulse rounded border border-amber-400/30 bg-amber-500/20" />
            <div className="text-sm text-amber-100">Сжатие изображения…</div>
          </div>
        )}
        {pendingImage && !imageCompressing && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 flex items-center gap-3 rounded-md border border-amber-400/40 bg-amber-500/10 p-2"
          >
            <img
              src={pendingImage}
              alt="Прикреплённое фото"
              className="size-16 shrink-0 rounded border border-slate-600/40 object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-amber-300/70 font-mono">
                  Фото прикреплено
                </span>
                <span className="text-[11px] text-slate-500">
                  {formatBytes(estimateBase64Size(pendingImage))}
                </span>
              </div>
              <input
                type="text"
                value={pendingImageCaption}
                onChange={(e) => setPendingImageCaption(e.target.value)}
                placeholder="Подпись к фото (необязательно)…"
                maxLength={200}
                className="w-full rounded border border-slate-600/40 bg-slate-900/60 px-2 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-400/60 focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                playSound("ui_back");
                setPendingImage(null);
                setPendingImageCaption("");
              }}
              onMouseEnter={() => playSound("ui_hover")}
              aria-label="Убрать фото"
              title="Убрать"
              className="size-7 shrink-0 flex items-center justify-center rounded-full border border-slate-600/40 bg-slate-800/40 text-slate-400 hover:text-rose-400"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}

        {/* Hidden file input for image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,image/bmp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Input */}
        <div className="mt-3 flex gap-2 border-t border-amber-400/15 pt-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={pendingImage ? "Подпись к фото (необязательно)…" : `Написать ${selectedChar.name}…`}
            rows={1}
            maxLength={1000}
            disabled={chatLoading}
            className="flex-1 resize-none rounded-md border border-slate-600/40 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400/60 focus:outline-none disabled:opacity-50"
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />

          {/* Emoji picker */}
          <EmojiPicker onPick={handleEmojiPick} />

          {/* Image upload button */}
          <button
            type="button"
            onClick={() => {
              playSound("ui_click");
              fileInputRef.current?.click();
            }}
            onMouseEnter={() => playSound("ui_hover")}
            disabled={chatLoading}
            aria-label="Прикрепить фото"
            title="Прикрепить фото"
            className="size-10 shrink-0 flex items-center justify-center rounded-md border border-slate-600/40 bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 transition-colors disabled:opacity-30"
          >
            <ImagePlus className="size-4" />
          </button>

          {/* Send button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSend}
            onMouseEnter={() => playSound("ui_hover")}
            disabled={(!input.trim() && !pendingImage) || chatLoading}
            aria-label="Отправить сообщение"
            title="Отправить"
            className="size-10 shrink-0 bg-amber-500/30 text-amber-100 hover:bg-amber-500/50 border border-amber-400/50 disabled:opacity-30"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-slate-600">
          <span className="hidden sm:inline">Esc — к списку экипажа</span>
          <span className="truncate">
            <span className="hidden sm:inline">Enter — отправить · Shift+Enter — новая строка · </span>
            {input.length}/1000
          </span>
        </div>
      </div>
    </div>
  );
}
