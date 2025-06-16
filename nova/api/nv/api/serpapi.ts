import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.SERPAPI_KEY;
  const { location } = req.query;

  if (!apiKey) {
    return res.status(500).json({ error: "SerpApi key não configurada nas variáveis de ambiente." });
  }

  if (!location || typeof location !== "string") {
    return res.status(400).json({ error: "Parâmetro 'location' ausente ou inválido." });
  }

  const serpApiUrl = `https://serpapi.com/search.json?engine=google_maps&q=unidades+de+saúde+em+${encodeURIComponent(
    location
  )}&api_key=${apiKey}`;

  try {
    const response = await fetch(serpApiUrl);
    if (!response.ok) {
      throw new Error(`Erro ao chamar SerpApi: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao consultar SerpApi:", error);
    res.status(500).json({ error: "Falha ao consultar SerpApi." });
  }
}
