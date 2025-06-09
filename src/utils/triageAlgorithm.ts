export type SeverityLevel = 'leve' | 'moderado' | 'grave';

interface TriageResult {
  severity: SeverityLevel;
  symptoms: string[];
  recommendation: string;
}

export function analyzeSymptoms(input: string): TriageResult {
  const normalized = input.toLowerCase();
  const symptoms = normalized
    .split(/,|e|\n|\./)
    .map((s) => s.trim())
    .filter(Boolean);

  const graveKeywords = [
    'inconsciência',
    'desmaio',
    'dor no peito',
    'dificuldade para respirar',
    'hemorragia',
    'convulsão',
  ];
  const moderadoKeywords = [
    'febre alta',
    'dor intensa',
    'queda',
    'fratura',
    'vômito constante',
  ];
  const leveKeywords = [
    'dor de cabeça',
    'coriza',
    'tosse',
    'garganta',
    'náusea',
    'dor nas costas',
  ];

  let severity: SeverityLevel = 'leve';

  if (symptoms.some((s) => graveKeywords.some((k) => s.includes(k)))) {
    severity = 'grave';
  } else if (symptoms.some((s) => moderadoKeywords.some((k) => s.includes(k)))) {
    severity = 'moderado';
  }

  const recommendationMap = {
    leve: 'Seus sintomas indicam uma condição leve. Procure uma UBS se necessário.',
    moderado:
      'Seus sintomas podem necessitar de cuidados em uma UPA. Recomendamos atendimento em até 24h.',
    grave:
      'Seus sintomas indicam uma possível emergência médica. Recomendamos chamar uma ambulância imediatamente pelo número 192 (SAMU).',
  };

  return {
    severity,
    symptoms,
    recommendation: recommendationMap[severity],
  };
}
