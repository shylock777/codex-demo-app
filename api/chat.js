// Vercel Serverless Function: 代理前端请求到 DeepSeek，密钥只在后端使用
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  if (!apiKey) {
    res.status(500).json({ error: "DEEPSEEK_API_KEY 未配置" });
    return;
  }

  try {
    const { message } = req.body || {};
    if (!message) {
      res.status(400).json({ error: "缺少 message" });
      return;
    }

    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: message }],
        stream: false,
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: data });
      return;
    }

    const reply = data.choices?.[0]?.message?.content || "(无回复)";
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
