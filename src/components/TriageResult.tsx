import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CircleCheck } from 'lucide-react';
import EmergencyButton from './EmergencyButton';
import MedicalMap from './MedicalMap';
import { supabase } from '@/lib/supabaseClient';

export type SeverityLevel = 'low' | 'medium' | 'high';

interface TriageResultProps {
  severity: SeverityLevel;
  recommendation: string;
  symptoms: string[];
}

const TriageResult = ({ severity, recommendation, symptoms }: TriageResultProps) => {
  const severityConfig = {
    low: {
      title: 'Baixa Severidade',
      color: 'triage-low',
      icon: CircleCheck,
      facilityType: 'UBS' as const,
      description: 'Seus sintomas indicam uma condição que pode ser tratada em uma Unidade Básica de Saúde (UBS).'
    },
    medium: {
      title: 'Severidade Média',
      color: 'triage-medium',
      icon: AlertCircle,
      facilityType: 'UPA' as const,
      description: 'Seus sintomas indicam que você deve procurar uma Unidade de Pronto Atendimento (UPA).'
    },
    high: {
      title: 'Alta Severidade',
      color: 'triage-high',
      icon: AlertCircle,
      facilityType: 'Hospital' as const,
      description: 'Seus sintomas indicam uma possível emergência médica. Recomendamos chamar uma ambulância.'
    }
  };

  const config = severityConfig[severity];

  useEffect(() => {
    const salvarTriagem = async () => {
      const data_hora = new Date().toISOString();

      const triagemData = {
        sintomas: symptoms,
        resultado: config.title,
        data_hora,
        recomendacao: recommendation
      };

      console.log("📤 Enviando triagem para Supabase:", triagemData);

      const { error } = await supabase.from('triagem-medica').insert([triagemData]);

      if (error) {
        console.error('❌ Erro ao salvar triagem:', error);
      }
    };

    salvarTriagem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <Card className={`border-2 border-${config.color}`}>
        <CardHeader className={`bg-${config.color}/10`}>
          <div className="flex items-center gap-2">
            <config.icon className={`h-6 w-6 text-${config.color}`} />
            <CardTitle className={`text-${config.color}`}>{config.title}</CardTitle>
          </div>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Sintomas identificados:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {symptoms.map((symptom, index) => (
                <li key={index}>{symptom}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Recomendação:</h3>
            <p>{recommendation}</p>
          </div>

          {severity === 'high' && (
            <div className="flex justify-center py-2">
              <EmergencyButton />
            </div>
          )}
        </CardContent>
      </Card>

      {severity !== 'high' && (
        <Card>
          <CardHeader>
            <CardTitle>Unidades de saúde próximas</CardTitle>
            <CardDescription>
              Baseado na sua localização atual, encontramos estas opções
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MedicalMap facilityType={config.facilityType} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TriageResult;
