import { useNavigate } from 'react-router';
import { Navbar } from '../components/navbar';
import { UrgencyBadge } from '../components/urgency-badge';
import { AIExplanation } from '../components/ai-explanation';
import { Stethoscope } from 'lucide-react';

export default function ResultsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* AI Recommendation Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-2xl flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Recommendation</h2>
              <p className="text-gray-600">Based on your symptom analysis</p>
            </div>
            <UrgencyBadge level="urgent" />
          </div>
          
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-[#2563EB] mb-4">Neurology</h3>
            <p className="text-gray-600 text-lg">
              We recommend consulting with a neurologist for your symptoms.
            </p>
          </div>
          
          <AIExplanation>
            <p>
              Based on your symptoms of persistent headaches with light sensitivity and nausea, 
              our AI analysis suggests these could be signs of migraines or other neurological 
              conditions. A neurologist can provide a proper diagnosis and treatment plan.
            </p>
            <p className="mt-3">
              <strong>Key factors identified:</strong>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              <li>Duration and persistence of symptoms</li>
              <li>Photophobia (light sensitivity)</li>
              <li>Associated nausea</li>
              <li>Pattern of occurrence</li>
            </ul>
          </AIExplanation>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/hospitals')}
            className="flex-1 bg-[#2563EB] text-white py-4 rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-blue-200"
          >
            View Nearby Hospitals
          </button>
          <button
            onClick={() => navigate('/symptoms')}
            className="flex-1 bg-white text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200"
          >
            New Symptom Check
          </button>
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-8">
          <strong>Important:</strong> This is an AI-generated recommendation, not a medical diagnosis. 
          Please consult with qualified healthcare professionals for proper medical advice.
        </p>
      </div>
    </div>
  );
}
