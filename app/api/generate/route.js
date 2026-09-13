import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT, validateConfig } from "@/lib/prompt";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const prompt = (body?.prompt || "").trim();
  if (!prompt) {
    return Response.json({ error: "Deskripsi server tidak boleh kosong" }, { status: 400 });
  }
  if (prompt.length > 2000) {
    return Response.json({ error: "Deskripsi terlalu panjang (maks 2000 karakter)" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: "GEMINI_API_KEY belum diset di server" }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let config;
    try {
      config = JSON.parse(text);
    } catch {
      return Response.json({ error: "AI mengembalikan format yang tidak bisa dibaca, coba lagi" }, { status: 502 });
    }

    const validationError = validateConfig(config);
    if (validationError) {
      return Response.json({ error: `Hasil AI tidak valid: ${validationError}` }, { status: 502 });
    }

    return Response.json({ config });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Gagal menghubungi Gemini API" }, { status: 502 });
  }
}
