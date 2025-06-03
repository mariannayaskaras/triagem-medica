
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
}

const VoiceRecorder = ({ onTranscription }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Cleanup function to stop recording when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          setIsProcessing(true);
          
          // Create audio blob from recorded chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // In a real application, we would send this audio to a speech recognition service
          // For this demo version, we're simulating a delay and using placeholder text
          
          // Simulating API call delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // This is where you would integrate with a real speech-to-text service
          // For example: const response = await sendAudioToTranscriptionAPI(audioBlob);
          
          // For demo purposes, we'll use simulated responses based on recording length
          const recordingLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
          let simulatedTranscript = "";
          
          if (recordingLength < 10000) {
            simulatedTranscript = "Estou com dor de cabeça forte há 2 dias.";
          } else if (recordingLength < 50000) {
            simulatedTranscript = "Estou com dor de cabeça forte, febre de 38 graus e dor no corpo há 2 dias. Tomei remédio mas não melhorou.";
          } else {
            simulatedTranscript = "Estou com dor de cabeça forte, febre de 39 graus, dificuldade para respirar e dor no peito. Começou ontem e está piorando. Tenho histórico de hipertensão.";
          }
          
          setTranscript(simulatedTranscript);
          setIsProcessing(false);
          
          toast({
            title: "Áudio transcrito com sucesso",
            description: "Verifique se o texto corresponde ao que você disse",
          });
        } catch (error) {
          console.error('Error processing audio:', error);
          setError('Houve um erro ao processar o áudio.');
          setIsProcessing(false);
          
          toast({
            variant: "destructive",
            title: "Erro na transcrição",
            description: "Não foi possível transcrever o áudio. Tente novamente.",
          });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Gravação iniciada",
        description: "Fale seus sintomas claramente...",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
      
      toast({
        variant: "destructive",
        title: "Erro de acesso ao microfone",
        description: "Verifique se o seu navegador tem permissão para acessar o microfone.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmit = () => {
    if (transcript) {
      onTranscription(transcript);
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-700">Descreva seus sintomas por voz</h3>
          <p className="text-sm text-gray-500">
            Aperte o botão abaixo e fale seus sintomas claramente
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-triage-blue/20 p-6">
                <Loader className="h-8 w-8 text-triage-blue animate-spin" />
              </div>
              <span className="text-sm">Processando áudio...</span>
            </div>
          ) : (
            <>
              <Button
                type="button"
                className={`rounded-full p-6 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-triage-blue hover:bg-blue-600'
                }`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                aria-label={isRecording ? "Parar gravação" : "Iniciar gravação"}
              >
                {isRecording ? (
                  <MicOff className="h-8 w-8 text-white" />
                ) : (
                  <Mic className="h-8 w-8 text-white" />
                )}
              </Button>
              <span className="text-sm">
                {isRecording ? 'Gravando... Clique para parar' : 'Clique para começar a gravação'}
              </span>
            </>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {transcript && !isProcessing && (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-gray-700">{transcript}</p>
            </div>
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setTranscript('')}
                disabled={isProcessing}
              >
                Limpar
              </Button>
              <Button 
                className="bg-triage-blue hover:bg-blue-600 text-white"
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                Confirmar e Analisar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
