import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import SymptomInput from '@/components/SymptomInput';
import VoiceRecorder from '@/components/VoiceRecorder';
import TriageResult, { SeverityLevel } from '@/components/TriageResult';
import EmergencyButton from '@/components/EmergencyButton';
import { analyzeSymptoms } from '@/utils/triageAlgorithm';
import MedicalMap from '@/components/MedicalMap';

const Index = () => {
  const [inputMethod, setInputMethod] = useState<'text' | 'voice'>('text');
  const [symptoms, setSymptoms] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<{
    severity: SeverityLevel;
    symptoms: string[];
    recommendation: string;
  } | null>(null);

  const [triageHistory, setTriageHistory] = useState<
    { date: string; symptoms: string; recommendation: string }[]
  >(() => {
    const stored = localStorage.getItem("triagemHistorico");
    return stored ? JSON.parse(stored) : [];
  });

  const handleSymptomSubmission = (symptomText: string) => {
    if (symptomText.trim().length < 10) {
      alert("Por favor, descreva os sintomas com mais detalhes (mínimo 10 caracteres).");
      return;
    }

    setSymptoms(symptomText);
    setIsLoading(true);

    setTimeout(() => {
      const result = analyzeSymptoms(symptomText);
      setTriageResult(result);
      setShowResults(true);
      setIsLoading(false);

      const novaEntrada = {
        date: new Date().toLocaleString(),
        symptoms: symptomText,
        recommendation: result.recommendation,
      };

      const novoHistorico = [novaEntrada, ...triageHistory];
      setTriageHistory(novoHistorico);
      localStorage.setItem("triagemHistorico", JSON.stringify(novoHistorico));
    }, 1500);
  };

  const handleReset = () => {
    setShowResults(false);
    setSymptoms('');
    setTriageResult(null);
  };

  const clearHistory = () => {
    setTriageHistory([]);
    localStorage.removeItem("triagemHistorico");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 container max-w-4xl py-8 px-4">
        {!showResults ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">Triagem Médica Assistida</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Descreva seus sintomas em detalhes e nossa IA irá analisar a gravidade
                e sugerir o tipo de atendimento médico mais adequado.
              </p>
            </div>

            <div className="flex justify-center">
              <EmergencyButton />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Como você prefere informar seus sintomas?</CardTitle>
                <CardDescription>
                  Escolha entre digitar ou usar sua voz para descrever o que está sentindo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="text"
                  value={inputMethod}
                  onValueChange={(value) => setInputMethod(value as 'text' | 'voice')}
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="text">Digitar Sintomas</TabsTrigger>
                    <TabsTrigger value="voice">Usar Voz</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="space-y-4">
                    <SymptomInput onSubmit={handleSymptomSubmission} />
                  </TabsContent>
                  <TabsContent value="voice">
                    <VoiceRecorder onTranscription={handleSymptomSubmission} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {triageHistory.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Histórico de Triagens</h3>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Limpar histórico
                  </button>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  {triageHistory.map((entry, index) => (
                    <li key={index} className="border p-3 rounded-md bg-white shadow-sm">
                      <p className="text-xs text-gray-400">{entry.date}</p>
                      <p><strong>Sintomas:</strong> {entry.symptoms}</p>
                      <p><strong>Recomendação:</strong> {entry.recommendation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-center text-sm text-gray-500">
              <p>
                Atenção: Este sistema não substitui avaliação médica profissional.
                Em caso de emergência, ligue imediatamente para 192 (SAMU).
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Resultado da Triagem</h2>
              <button 
                onClick={handleReset}
                className="text-triage-blue hover:underline"
              >
                Voltar e fazer nova triagem
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              triageResult && (
                <>
                  <TriageResult 
                    severity={triageResult.severity} 
                    recommendation={triageResult.recommendation}
                    symptoms={triageResult.symptoms}
                  />
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Unidades próximas:</h3>
                    <MedicalMap facilityType="UPA" />
                  </div>
                </>
              )
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container max-w-4xl px-4 text-center text-sm text-gray-500">
          <p>
            © 2025 Medic AI Triagem Pro — 
            <span className="text-xs"> Este é um sistema de avaliação preliminar e não substitui atendimento médico profissional</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
