const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

app.get('/api/serpapi', async (req, res) => {
  const apiKey = process.env.SERPAPI_KEY;
  const { location } = req.query;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key da SerpApi não configurada." });
  }

  if (!location) {
    return res.status(400).json({ error: "Parâmetro 'location' é obrigatório." });
  }

  const searchUrl = `https://serpapi.com/search.json?engine=google_maps&q=unidades+de+saúde+em+${encodeURIComponent(location)}&api_key=${apiKey}`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!data.local_results) {
      return res.status(404).json({ error: "Nenhum resultado encontrado." });
    }

    const locais = data.local_results.map(local => ({
      nome: local.title,
      endereco: local.address,
      telefone: local.phone,
      horario: local.hours,
      lat: local.gps_coordinates?.latitude,
      lng: local.gps_coordinates?.longitude,
      avaliacao: local.rating,
      reviews: local.reviews
    }));

    res.status(200).json({ locais });
  } catch (error) {
    console.error("❌ Erro ao consultar a SerpApi:", error);
    res.status(500).json({ error: "Erro ao buscar dados da SerpApi." });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
}); 