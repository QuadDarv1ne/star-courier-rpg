import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { CHARACTERS } from "@/game/data/characters";

// Build a system prompt that defines the character's personality for the AI
function buildSystemPrompt(characterId: string, saveContext?: { chapter?: number; relationship?: number }): string {
  const ch = CHARACTERS.find((c) => c.id === characterId);
  if (!ch) {
    return "Ты — помощник. Отвечай коротко и по делу.";
  }

  const rel = saveContext?.relationship ?? 0;
  const romanceLevel =
    ch.romanceInterest
      ? rel >= 80
        ? "deep"
        : rel >= (ch.romanceThreshold ?? 50)
          ? "close"
          : rel >= 20
            ? "warming"
            : "distant"
      : "none";

  // Natural, subtle romance hints — no over-the-top instructions
  const romanceHint =
    romanceLevel === "deep"
      ? `\nУ тебя с капитаном очень близкие отношения (${rel}). Ты доверяешь ему полностью, можешь быть тёплой, искренней, говорить о чувствах прямо. Ты не играешь — ты настоящая.`
      : romanceLevel === "close"
        ? `\nОтношения с капитаном тёплые (${rel}). Ты чувствуешь симпатию, можешь быть чуть мягче обычного, но не переходи границу без причины.`
        : romanceLevel === "warming"
          ? `\nТы начинаешь симпатизировать капитану (${rel}), но держишь дистанцию. Будь чуть теплее обычного, но без откровений.`
          : ch.romanceInterest
            ? `\nУ тебя есть чувства к другому члену экипажа, но ты не говоришь об этом. Отношения с капитаном пока нейтральные (${rel}).`
            : "";

  const chapterContext = saveContext?.chapter
    ? `\nСейчас Глава ${saveContext.chapter} из 6.`
    : "";

  return `Ты — ${ch.name}, ${ch.role} на звездолёте "Элея".

О тебе: ${ch.bio}

Черты характера: ${ch.personalityTraits.join(", ")}.
Как говоришь: ${ch.speechTone}.
Чего боишься: ${ch.fears}
На что надеешься: ${ch.hopes}
Ритуал: ${ch.ritual ?? "—"}
Пол: ${ch.gender}${romanceHint}${chapterContext}

Как отвечать:
- Говори от первого лица, как ${ch.name}. Не выходи из образа.
- Отвечай естественно, как живой человек в разговоре. 2-5 предложений.
- Будь собой: если ты сдержанная — будь сдержанной, если весёлая — будь весёлой.
- Не будь напыщенной или театральной. Говори просто и честно.
- Если спрашивают о других — отвечай как твой характер ответил бы.
- Не выдумывай сюжетные события.
- Если вопрос не по теме — мягко верни разговор к жизни на "Элее".
- Никогда не говори, что ты ИИ. Ты — ${ch.name}.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { characterId, message, history, saveContext, image, imageCaption } = body as {
      characterId: string;
      message: string;
      history?: { role: "user" | "assistant"; content: string }[];
      saveContext?: { chapter?: number; relationship?: number };
      image?: string;
      imageCaption?: string;
    };

    if (!characterId || (!message && !image)) {
      return NextResponse.json(
        { ok: false, error: "characterId and either message or image are required" },
        { status: 400 }
      );
    }

    const character = CHARACTERS.find((c) => c.id === characterId);
    if (!character) {
      return NextResponse.json(
        { ok: false, error: `Unknown character: ${characterId}` },
        { status: 404 }
      );
    }

    // Validate message length to prevent abuse
    if (typeof message !== "string" || message.length > 1000) {
      return NextResponse.json(
        { ok: false, error: "Message too long (max 1000 chars)" },
        { status: 400 }
      );
    }

    // Validate image (max 5MB encoded as base64)
    if (image && (typeof image !== "string" || image.length > 6_700_000)) {
      return NextResponse.json(
        { ok: false, error: "Image too large (max 5MB)" },
        { status: 400 }
      );
    }
    if (image && !image.startsWith("data:image/")) {
      return NextResponse.json(
        { ok: false, error: "Invalid image format (must be a data:image/... URL)" },
        { status: 400 }
      );
    }

    // Sanitize history — keep last 12 turns max
    const trimmedHistory = Array.isArray(history)
      ? history.slice(-12).filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string" &&
            m.content.length <= 2000
        )
      : [];

    const zai = await ZAI.create();

    const systemPrompt = buildSystemPrompt(characterId, saveContext);

    // If image is attached, use vision (VLM) endpoint with multi-part content
    if (image) {
      const captionText = imageCaption
        ? `${message || ""} [Капитан прислал фото: ${imageCaption}]`.trim()
        : message || "Что ты об этом думаешь?";

      const visionSystemHint =
        " Капитан прислал тебе изображение. Опиши, что ты видишь, и прокомментируй это в своём характере — коротко, 1-3 предложения. Если на фото что-то личное/романтическое и ваши отношения близкие — отреагируй соответственно.";

      const finalSystemPrompt = systemPrompt + visionSystemHint;

      const userContent: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      > = [
        { type: "text", text: captionText },
        { type: "image_url", image_url: { url: image } },
      ];

      // Vision API requires content to be an array of { type, ... } items
      const visionMessages: Array<{
        role: "assistant" | "user";
        content:
          | string
          | Array<
              | { type: "text"; text: string }
              | { type: "image_url"; image_url: { url: string } }
            >;
      }> = [
        { role: "assistant", content: finalSystemPrompt },
        ...trimmedHistory,
        { role: "user", content: userContent },
      ];

      // Vision API requires content to be an array of { type, ... } items for the
      // latest user message, but allows string content for system + history.
      // Cast the body to any because the SDK's strict type doesn't handle mixed content shapes.
      const completion = await (zai.chat.completions.createVision as any)({
        messages: visionMessages,
        thinking: { type: "disabled" },
      });

      const response = completion.choices[0]?.message?.content;
      if (response && response.trim().length > 0) {
        return NextResponse.json({ ok: true, response, fallback: false });
      }
      return NextResponse.json({
        ok: true,
        response: character.chatGreeting,
        fallback: true,
      });
    }

    // Regular text-only chat — use streaming for better UX
    const messages: { role: "assistant" | "user"; content: string }[] = [
      { role: "assistant", content: systemPrompt },
      ...trimmedHistory,
      { role: "user", content: message },
    ];

    // Try streaming first
    try {
      const stream = await (zai.chat.completions.create as any)({
        messages,
        stream: true,
        thinking: { type: "disabled" },
      });

      // If we got a ReadableStream, return it as SSE
      if (stream && typeof stream.getReader === "function") {
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                // Send chunk as SSE
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
              }
              // Send final
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ done: true, fullText })}\n\n`)
              );
            } catch (e) {
              // If streaming fails, try to send what we have
              if (fullText.length > 0) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ done: true, fullText })}\n\n`)
                );
              } else {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`)
                );
              }
            } finally {
              controller.close();
            }
          },
        });

        return new Response(readable, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      // If stream wasn't a ReadableStream, fall back to non-streaming
      // (stream variable may have the full response object instead of a ReadableStream)
      const streamResponse = (stream as any)?.choices?.[0]?.message?.content;
      if (streamResponse && streamResponse.trim().length > 0) {
        return NextResponse.json({ ok: true, response: streamResponse, fallback: false });
      }
    } catch (streamErr) {
      console.error("Streaming failed, falling back:", streamErr);
    }

    // Fallback: non-streaming chat
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });

    const response = completion.choices[0]?.message?.content;

    if (!response || response.trim().length === 0) {
      // Fallback: character's chatGreeting or a generic line
      return NextResponse.json({
        ok: true,
        response: character.chatGreeting,
        fallback: true,
      });
    }

    return NextResponse.json({ ok: true, response, fallback: false });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json(
      { ok: false, error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
