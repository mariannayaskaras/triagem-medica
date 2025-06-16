export default async function handler(req, res) {
  const apiKey = process.env.SERPAPI_KEY;
  const location = req.query.location;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key não configurada." });
  }

  if (!location) {
    return res.status(400).json({ error: "Parâmetro 'location' ausente." });
  }

  const url = `https://serpapi.com/search.json?engine=google_maps&q=unidades+de+saúde+em+${encodeURIComponent(location)}&api_key=${apiKey}`;

  try {
    const fetchResponse = await fetch(url);
    const data = await fetchResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao consultar SerpApi:", error);
    res.status(500).json({ error: "Falha ao consultar SerpApi." });
  }
}
