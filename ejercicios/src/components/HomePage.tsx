import React from 'react';
import { Activity, AudioWaveform as Waveform, Brain, Zap, Upload, BookOpen } from 'lucide-react';

interface HomePageProps {
  onStartEvaluation: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartEvaluation }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-gray-900 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gray-900 to-transparent" />
      </div>
      
      <div className="relative z-10">
        <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                DLM EMG
              </span>
            </div>
          </div>
        </nav>
        
        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400 mr-3 sm:mr-4" />
              <Waveform className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 px-4">
              Electromiografía DLM
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed px-4">
              Revolucionando el diagnóstico neurofisiológico con tecnología avanzada e inteligencia artificial
            </p>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              Combine la precisión del análisis electromiográfico con herramientas de enseñanza interactivas para un diagnóstico más preciso y una experiencia de aprendizaje enriquecedora
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <a
                href="/exercise"
                className="group relative inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-full overflow-hidden transition-all duration-300 hover:from-amber-400 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:scale-105 w-full sm:w-auto shadow-lg shadow-amber-500/20"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Modo Ejercicio
                <div className="absolute inset-0 bg-white/20 transform translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
              </a>
              <button
                onClick={onStartEvaluation}
                className="group relative inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full overflow-hidden transition-all duration-300 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:scale-105 w-full sm:w-auto"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-pulse" />
                Iniciar Evaluación
                <div className="absolute inset-0 bg-white/20 transform translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              
              <a
                href="/file-upload"
                className="group relative inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-full overflow-hidden transition-all duration-300 hover:from-green-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:scale-105 w-full sm:w-auto"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Subir Archivo
                <div className="absolute inset-0 bg-white/20 transform translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
              </a>
            </div>
          </div>
          
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700 transform hover:scale-105 transition-transform duration-300">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Análisis Preciso</h3>
              <p className="text-sm sm:text-base text-gray-400">Evaluación detallada de la actividad muscular y nerviosa con tecnología de última generación</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700 transform hover:scale-105 transition-transform duration-300">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">IA Asistida</h3>
              <p className="text-sm sm:text-base text-gray-400">Interpretación avanzada de resultados potenciada por inteligencia artificial</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700 transform hover:scale-105 transition-transform duration-300">
              <Waveform className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Visualización Dinámica</h3>
              <p className="text-sm sm:text-base text-gray-400">Representación visual clara y detallada de los patrones electromiográficos</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage; 