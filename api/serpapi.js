export default async function handler(req, res) {
  // ✅ Logando a variável de ambiente
  const apiKey = process.env.SERPAPI_KEY;
  console.log("🔑 SERPAPI_KEY:", apiKey);

  // ✅ Logando o parâmetro recebido
  const location = req.query.location;
  console.log("📍 Location recebida:", location);

  // Validação básica
  if (!apiKey) {
    console.error("❌ API Key da SerpApi não configurada!");
    return res.status(500).json({ error: "API Key da SerpApi não configurada." });
  }

  if (!location) {
    console.error("❌ Parâmetro 'location' ausente.");
    return res.status(400).json({ error: "Parâmetro 'location' ausente." });
  }

  // ✅ Montando a URL
  const url = `https://serpapi.com/search.json?engine=google_maps&q=unidades+de+saúde+em+${encodeURIComponent(location)}&api_key=${apiKey}`;
  console.log("🌐 URL da requisição para a SerpApi:", url);

  try {
    // ✅ Antes de fazer o fetch
    console.log("🚀 Fazendo requisição para a SerpApi...");

    const fetchResponse = await fetch(url);

    console.log("✅ Resposta da SerpApi - status:", fetchResponse.status);

    const data = await fetchResponse.json();

    // ✅ Logando a resposta recebida da SerpApi
    console.log("📦 Dados recebidos da SerpApi:", data);

    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Erro ao consultar a SerpApi:", error);
    res.status(500).json({ error: "Falha ao consultar a SerpApi." });
  }
}
