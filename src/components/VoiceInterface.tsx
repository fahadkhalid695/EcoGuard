import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
import { sensorService } from '../services/sensorService';
import { aiService } from '../services/aiService';

const VoiceInterface: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [commands, setCommands] = useState<string[]>([]);

  const { speak, cancel, speaking } = useSpeechSynthesis();
  const { listen, stop, supported } = useSpeechRecognition({
    onResult: (result: string) => {
      setTranscript(result);
      processVoiceCommand(result);
    },
    onEnd: () => {
      setIsListening(false);
    }
  });

  useEffect(() => {
    setIsSpeaking(speaking);
  }, [speaking]);

  const startListening = () => {
    if (supported) {
      setIsListening(true);
      listen();
    } else {
      alert('Speech recognition is not supported in your browser');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    stop();
  };

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    let responseText = '';

    // Add command to history
    setCommands(prev => [command, ...prev.slice(0, 9)]);

    if (lowerCommand.includes('status') || lowerCommand.includes('overview')) {
      const stats = sensorService.getSensorStatistics();
      responseText = `System status: ${stats.onlineSensors} sensors online out of ${stats.totalSensors} total. System uptime is ${stats.uptime}%. There are ${stats.activeAlerts} active alerts.`;
    } 
    else if (lowerCommand.includes('air quality')) {
      const airSensors = sensorService.getSensorsByType('co2');
      if (airSensors.length > 0 && airSensors[0].lastReading) {
        responseText = `Current air quality: CO2 level is ${airSensors[0].lastReading.value} ${airSensors[0].lastReading.unit}. Air quality is ${airSensors[0].lastReading.quality}.`;
      } else {
        responseText = 'Air quality data is not available at the moment.';
      }
    }
    else if (lowerCommand.includes('temperature')) {
      const tempSensors = sensorService.getSensorsByType('temperature');
      if (tempSensors.length > 0 && tempSensors[0].lastReading) {
        responseText = `Current temperature is ${tempSensors[0].lastReading.value} degrees Celsius.`;
      } else {
        responseText = 'Temperature data is not available at the moment.';
      }
    }
    else if (lowerCommand.includes('alerts')) {
      const alerts = sensorService.getAlerts(false);
      responseText = `There are ${alerts.length} active alerts. ${alerts.length > 0 ? 'The most recent alert is: ' + alerts[0].message : ''}`;
    }
    else if (lowerCommand.includes('energy')) {
      const energySensors = sensorService.getSensorsByType('energy');
      if (energySensors.length > 0 && energySensors[0].lastReading) {
        responseText = `Current energy consumption is ${energySensors[0].lastReading.value} ${energySensors[0].lastReading.unit}.`;
      } else {
        responseText = 'Energy consumption data is not available.';
      }
    }
    else if (lowerCommand.includes('predictions') || lowerCommand.includes('ai')) {
      const predictions = aiService.getPredictions();
      const aiStats = aiService.getModelStatistics();
      responseText = `AI system has generated ${predictions.length} predictions. ${aiStats.activeModels} AI models are currently active with an average accuracy of ${aiStats.averageAccuracy}%.`;
    }
    else if (lowerCommand.includes('help') || lowerCommand.includes('commands')) {
      responseText = 'You can ask me about: system status, air quality, temperature, alerts, energy consumption, AI predictions, or say help for this message.';
    }
    else {
      responseText = 'I didn\'t understand that command. Try asking about system status, air quality, temperature, alerts, energy, or AI predictions.';
    }

    setResponse(responseText);
    speak({ text: responseText });
  };

  const stopSpeaking = () => {
    cancel();
    setIsSpeaking(false);
  };

  const speakResponse = () => {
    if (response) {
      speak({ text: response });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Mic className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Voice Interface</h1>
        </div>
        <p className="text-green-100 text-lg">
          Control your environmental monitoring system using voice commands.
        </p>
      </div>

      {/* Voice Controls */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Voice Assistant</h2>
          
          {/* Microphone Control */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!supported}
              className={`flex items-center space-x-2 px-6 py-4 rounded-full font-semibold transition-all duration-200 ${
                isListening
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } ${!supported ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
            </button>

            <button
              onClick={isSpeaking ? stopSpeaking : speakResponse}
              disabled={!response}
              className={`flex items-center space-x-2 px-6 py-4 rounded-full font-semibold transition-all duration-200 ${
                isSpeaking
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${!response ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              <span>{isSpeaking ? 'Stop Speaking' : 'Repeat Response'}</span>
            </button>
          </div>

          {/* Status Indicators */}
          <div className="flex justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-slate-600">Listening</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-slate-600">Speaking</span>
            </div>
          </div>

          {!supported && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800">
                Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari for the best experience.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Current Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Voice Input */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Voice Input</h3>
          <div className="bg-slate-50 rounded-lg p-4 min-h-24">
            {transcript ? (
              <p className="text-slate-900">{transcript}</p>
            ) : (
              <p className="text-slate-500 italic">Your voice command will appear here...</p>
            )}
          </div>
        </div>

        {/* System Response */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">System Response</h3>
          <div className="bg-slate-50 rounded-lg p-4 min-h-24">
            {response ? (
              <p className="text-slate-900">{response}</p>
            ) : (
              <p className="text-slate-500 italic">System response will appear here...</p>
            )}
          </div>
        </div>
      </div>

      {/* Available Commands */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Available Voice Commands</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { command: '"System status"', description: 'Get overall system health and sensor count' },
            { command: '"Air quality"', description: 'Check current air quality measurements' },
            { command: '"Temperature"', description: 'Get current temperature readings' },
            { command: '"Alerts"', description: 'List active system alerts' },
            { command: '"Energy consumption"', description: 'Check current energy usage' },
            { command: '"AI predictions"', description: 'Get AI model status and predictions' },
            { command: '"Help"', description: 'List available commands' }
          ].map((item, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">{item.command}</h4>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Command History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Commands</h3>
        <div className="space-y-2">
          {commands.length > 0 ? (
            commands.map((command, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-900">{command}</span>
                <span className="text-xs text-slate-500">#{commands.length - index}</span>
              </div>
            ))
          ) : (
            <p className="text-slate-500 italic text-center py-8">No commands yet. Try saying "system status" to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;