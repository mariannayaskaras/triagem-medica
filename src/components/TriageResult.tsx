import React, { useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { AlertCircle, CircleCheck } from 'lucide-react';
import EmergencyButton from './EmergencyButton';
import MedicalMap from './MedicalMap';
import { supabase } from '@/lib/supabaseClient';

export type SeverityLevel = 'low' | 'medium' | 'high';
type FacilityType = 'ubs' | 'upa' | 'hospital';

interface TriageResultProps {
  severity: SeverityLevel;
  recommendation: string;
  symptoms: string[];
}

const colorClasses = {
  low: {
    border: 'border-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    icon: CircleCheck,
    facilityType: 'ubs' as FacilityType,
    title: 'Baixa Severidade',
    description: 'Seus sintomas indicam uma condição que pode ser tratada em uma Unidade Básica de Saúde (UBS).'
  },
  medium: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-500',
    icon: AlertCircle,
    facilityType: 'upa' as FacilityType,
    title: 'Severidade Média',
    description: 'Seus sintomas indicam que você deve procurar uma Unidade de Pronto Atendimento (UPA).'
  },
  high: {
    border: 'border-red-500',
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    icon: AlertCircle,
    facilityType: 'hospital' as FacilityType,
    title: 'Alta Severidade',
    description: 'Seus sintomas indicam uma possível emergência médica. Recomendamos chamar uma ambulância.'
  }
};

const TriageResult = ({ severity, recommendation, symptoms }: TriageResultProps) => {
  const config = colorClasses[severity];
  const Icon = config.icon;

  useEffect(() => {
    const salvarTriagem = async () => {
      const data_hora = new Date().toISOString();

      const triagemData = {
        sintomas: symptoms,
        resultado: config.title,
        data_hora,
        recomendacao: recommendation
      };

      if (import.meta.env.DEV) {
        console.log('📤 Enviando triagem para Supabase:', triagemData);
      }

      const { error } = await supabase.from('triagem-medica').insert([triagemData]);

      if (error) {
        console.error('❌ Erro ao salvar triagem:', error);
      }
    };

    salvarTriagem();
  }, [config, recommendation, symptoms]);

  return (
    <div className="space-y-6">
      <Card className={`border-2 ${config.border}`}>
        <CardHeader className={config.bg}>
          <div className="flex items-center gap-2">
            <Icon className={`h-6 w-6 ${config.text}`} />
            <CardTitle className={config.text}>{config.title}</CardTitle>
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
              Baseado na sua localização atual, encontramos estas opções:
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
