
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import SymptomInput from '@/components/SymptomInput';
import VoiceRecorder from '@/components/VoiceRecorder';
import TriageResult, { SeverityLevel } from '@/components/TriageResult';
import EmergencyButton from '@/components/EmergencyButton';
import { analyzeSymptoms } from '@/utils/triageAlgorithm';

const Index = () => {
  const [inputMethod, setInputMethod] = useState<'text' | 'voice'>('text');
  const [symptoms, setSymptoms] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [triageResult, setTriageResult] = useState<{
    severity: SeverityLevel;
    symptoms: string[];
    recommendation: string;
  } | null>(null);

  const handleSymptomSubmission = (symptomText: string) => {
    setSymptoms(symptomText);
    
    // Analyze symptoms using our triageAlgorithm
    const result = analyzeSymptoms(symptomText);
    setTriageResult(result);
    setShowResults(true);
  };

  const handleReset = () => {
    setShowResults(false);
    setSymptoms('');
    setTriageResult(null);
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
            
            {triageResult && (
              <TriageResult 
                severity={triageResult.severity} 
                recommendation={triageResult.recommendation}
                symptoms={triageResult.symptoms}
              />
            )}
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container max-w-4xl px-4 text-center text-sm text-gray-500">
          <p>
            © 2025 Medic AI Triagem Pro - 
            <span className="text-xs">Este é um sistema de avaliação preliminar e não substitui atendimento médico profissional</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
