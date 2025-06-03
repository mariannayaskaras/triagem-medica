
import { SeverityLevel } from "@/components/TriageResult";

// Emergency keywords in Portuguese
const emergencyKeywords = [
  'desmaio', 'inconsciente', 'convulsão', 'convulsoes', 'parou de respirar', 
  'avc', 'infarto', 'derrame', 'sangrando muito', 'sangramento intenso',
  'dor no peito', 'dificuldade para respirar', 'sufocando', 'não consigo respirar'
];

const urgentKeywords = [
  'febre alta', 'vomitando', 'vômito intenso', 'diarréia forte', 'dor forte',
  'queimadura', 'corte profundo', 'infecção', 'desidratação', 'fratura',
  'tontura intensa', 'enxaqueca forte'
];

interface AnalysisResult {
  severity: SeverityLevel;
  symptoms: string[];
  recommendation: string;
}

export const analyzeSymptoms = (symptomsText: string): AnalysisResult => {
  // Security: Validate and sanitize input
  if (!symptomsText || typeof symptomsText !== 'string') {
    return {
      severity: 'low',
      symptoms: ['Entrada inválida'],
      recommendation: 'Por favor, forneça uma descrição válida dos sintomas.'
    };
  }
  
  // Security: Limit input length to prevent abuse
  if (symptomsText.length > 2000) {
    return {
      severity: 'low',
      symptoms: ['Descrição muito longa'],
      recommendation: 'Por favor, forneça uma descrição mais concisa dos sintomas (máximo 2000 caracteres).'
    };
  }
  
  // Security: Basic sanitization - remove HTML tags and script content
  const sanitizedText = symptomsText
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
  
  // Convert to lowercase for easier comparison
  const text = sanitizedText.toLowerCase();
  
  // Check for emergency keywords first
  for (const keyword of emergencyKeywords) {
    if (text.includes(keyword)) {
      return {
        severity: 'high',
        symptoms: extractSymptoms(text, 'high'),
        recommendation: 'Seus sintomas indicam uma possível emergência médica. Recomendamos chamar uma ambulância imediatamente pelo número 192 (SAMU).'
      };
    }
  }
  
  // Check for urgent keywords
  for (const keyword of urgentKeywords) {
    if (text.includes(keyword)) {
      return {
        severity: 'medium',
        symptoms: extractSymptoms(text, 'medium'),
        recommendation: 'Seus sintomas indicam que você deve procurar atendimento em uma Unidade de Pronto Atendimento (UPA) nas próximas horas.'
      };
    }
  }
  
  // Default to low severity if no specific keywords detected
  return {
    severity: 'low',
    symptoms: extractSymptoms(text, 'low'),
    recommendation: 'Seus sintomas não parecem graves no momento. Recomendamos agendar uma consulta em uma Unidade Básica de Saúde (UBS) para avaliação.'
  };
};

// Simple function to extract main symptoms from the text
const extractSymptoms = (text: string, severity: SeverityLevel): string[] => {
  // In a real application, this would use NLP to extract symptoms
  // For this demo, we'll use some simple rules
  
  const symptoms: string[] = [];
  
  // Common symptom patterns
  const symptomPatterns = [
    { regex: /dor\s+(?:de|na|no|nas|nos)\s+(.+?)(?:\.|\,|\s+e|\s+há|\s+por|\s+desde|$)/gi, label: "Dor" },
    { regex: /(febre|temperatura)(?:\s+de\s+(\d+))?/gi, label: "Febre" },
    { regex: /(tosse|tossindo)/gi, label: "Tosse" },
    { regex: /(náusea|enjoo|vômito|vomitando)/gi, label: "Náusea/Vômito" },
    { regex: /(cansaço|fadiga|fraqueza)/gi, label: "Cansaço/Fadiga" },
    { regex: /(falta\s+de\s+ar|dificuldade\s+(?:para|de|em)\s+respirar)/gi, label: "Dificuldade Respiratória" },
  ];
  
  // Extract symptoms based on patterns
  symptomPatterns.forEach(pattern => {
    const matches = [...text.matchAll(pattern.regex)];
    if (matches.length > 0) {
      const match = matches[0];
      if (match[1]) {
        // For "dor de cabeça", we get "cabeça" from the regex group
        if (pattern.label === "Dor") {
          symptoms.push(`${pattern.label} ${match[1].trim()}`);
        } else if (pattern.label === "Febre" && match[2]) {
          // For fever with temperature, add the temperature
          symptoms.push(`${pattern.label} ${match[2]}°C`);
        } else {
          symptoms.push(pattern.label);
        }
      }
    }
  });
  
  // Add duration if mentioned
  const durationMatch = text.match(/(?:há|por|desde)\s+(\d+)\s+(dia|dias|semana|semanas|hora|horas)/i);
  if (durationMatch) {
    const duration = `${durationMatch[1]} ${durationMatch[2]}`;
    symptoms.push(`Sintomas presentes há ${duration}`);
  }
  
  // If no symptoms were extracted, add a generic one based on severity
  if (symptoms.length === 0) {
    switch(severity) {
      case 'high':
        symptoms.push('Sintomas potencialmente graves');
        break;
      case 'medium':
        symptoms.push('Sintomas de urgência moderada');
        break;
      case 'low':
        symptoms.push('Sintomas leves');
        break;
    }
  }
  
  return symptoms;
};
