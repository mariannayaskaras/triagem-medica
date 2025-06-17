import { useEffect, useState } from 'react';

export default function MapaUnidades() {
  const [locais, setLocais] = useState([]);

  useEffect(() => {
    async function fetchLocais() {
      try {
        const response = await fetch('/api/serpapi?location=Aracaju');
        const data = await response.json();
        setLocais(data.locais);
      } catch (error) {
        console.error('Erro ao buscar locais:', error);
      }
    }

    fetchLocais();
  }, []);

  return (
    <div>
      <h2>Unidades de Saúde em Aracaju</h2>
      {locais.length === 0 ? (
        <p>Carregando ou nenhum local encontrado...</p>
      ) : (
        <ul>
          {locais.map((local, index) => (
            <li key={index}>
              <strong>{local.nome}</strong><br />
              📍 {local.endereco}<br />
              ☎️ {local.telefone}<br />
              🕒 {local.horario}<br />
              ⭐ {local.avaliacao} ({local.reviews} avaliações)<br />
              🌍 Lat: {local.lat}, Lng: {local.lng}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
