import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../../lib/api';
import { Navbar } from '../components/navbar';
import { LoadingSpinner } from '../components/loading-spinner';
import { Mic } from 'lucide-react';

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;

    setIsAnalyzing(true);
    try {
      const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const parsedUser = user ? JSON.parse(user) : null;
      const payload = { userId: parsedUser?.id, symptomsText: symptoms };
      const res = await api.analyzeSymptoms(payload);
      if (res && res.data) {
        localStorage.setItem('lastAIResult', JSON.stringify(res.data));
      }
      navigate('/results');
    } catch (err: any) {
      localStorage.setItem('lastAIResult', JSON.stringify({ predictedSpecialization: 'General Medicine', confidence: 0.6, urgency: 'Normal', recommended: [] }));
      navigate('/results');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {!isAnalyzing ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Describe Your Symptoms
            </h1>
            <p className="text-gray-600 mb-8">
              Tell us what you're experiencing. Be as detailed as possible for better recommendations.
            </p>
            
            <div className="relative mb-6">
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms in detail...&#10;&#10;For example: 'I've been experiencing a persistent headache for 3 days, along with sensitivity to light and occasional nausea...'"
                className="w-full h-64 px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
              />
              <button className="absolute bottom-4 right-4 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
                <Mic className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={!symptoms.trim()}
              className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
            >
              Analyze Symptoms
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              <strong>Disclaimer:</strong> This is not a medical diagnosis. Always consult with qualified healthcare professionals.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12">
            <LoadingSpinner message="Analyzing your symptoms..." />
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse"></div>
                <span>Processing symptom description...</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-2 h-2 bg-[#0EA5E9] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <span>Matching with medical database...</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <span>Identifying specialists...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
