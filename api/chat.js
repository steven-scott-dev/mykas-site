// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(500).json({ error: 'Upstream error', detail: txt });
    }

    const data = await r.json();
    const message = data?.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.';
    return res.status(200).json({ message });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}