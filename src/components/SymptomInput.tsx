import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SymptomInputProps {
  onSubmit: (symptoms: string[]) => void;
}

const SymptomInput = ({ onSubmit }: SymptomInputProps) => {
  const [symptoms, setSymptoms] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!symptoms.trim()) {
      setError('Por favor, descreva seus sintomas.');
      return;
    }

    if (symptoms.length > 2000) {
      setError('Descrição muito longa. Máximo de 2000 caracteres.');
      return;
    }

    const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i];
    if (suspiciousPatterns.some(pattern => pattern.test(symptoms))) {
      setError('Conteúdo inválido detectado. Por favor, descreva apenas seus sintomas médicos.');
      return;
    }

    // 🔥 Aqui a separação inteligente dos sintomas
    const parsedSymptoms = symptoms
      .split(/,|;|\n/)      // quebra por vírgulas, ponto-e-vírgula e nova linha
      .map(s => s.trim())   // remove espaços
      .filter(Boolean);     // remove vazios

    onSubmit(parsedSymptoms);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSymptoms(value);
    setError('');

    if (value.length > 1900) {
      setError(`${2000 - value.length} caracteres restantes`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="symptoms" className="text-lg font-medium text-gray-700">
          Descreva seus sintomas em detalhes:
        </label>
        <Textarea
          id="symptoms"
          placeholder="Por exemplo: Estou com dor de cabeça forte há 2 dias, febre de 38°C e dificuldade para respirar..."
          className="min-h-[150px] p-4 text-base"
          value={symptoms}
          onChange={handleInputChange}
          maxLength={2000}
          required
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{symptoms.length}/2000 caracteres</span>
          {error && <span className="text-red-500">{error}</span>}
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-triage-blue hover:bg-blue-600 text-white"
          disabled={!symptoms.trim() || symptoms.length > 2000 || !!error}
        >
          Analisar Sintomas
        </Button>
      </div>
    </form>
  );
};

export default SymptomInput;
