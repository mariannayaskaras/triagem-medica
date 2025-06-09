export type SeverityLevel = 'leve' | 'moderado' | 'grave';

interface TriageResult {
  severity: 'low' | 'medium' | 'high';
  symptoms: string[];
  recommendation: string;
}

export function analyzeSymptoms(input: string): TriageResult {
  if (typeof input !== 'string') {
    throw new Error('Entrada inválida para análise de sintomas.');
  }

  const normalized = input.toLowerCase();
  const symptoms = normalized
    .split(/,|;|\n|\./) // ✅ Removido o "e" como separador
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

  let severity: 'leve' | 'moderado' | 'grave' = 'leve';

  if (symptoms.some((s) => graveKeywords.some((k) => s.includes(k)))) {
    severity = 'grave';
  } else if (symptoms.some((s) => moderadoKeywords.some((k) => s.includes(k)))) {
    severity = 'moderado';
  }

  const recommendationMap: Record<'leve' | 'moderado' | 'grave', string> = {
    leve: 'Seus sintomas indicam uma condição leve. Procure uma UBS se necessário.',
    moderado: 'Seus sintomas podem necessitar de cuidados em uma UPA. Recomendamos atendimento em até 24h.',
    grave: 'Seus sintomas indicam uma possível emergência médica. Recomendamos chamar uma ambulância imediatamente pelo número 192 (SAMU).',
  };

  const severityMap = {
    leve: 'low',
    moderado: 'medium',
    grave: 'high',
  } as const;

  return {
    severity: severityMap[severity],
    symptoms,
    recommendation: recommendationMap[severity],
  };
}
