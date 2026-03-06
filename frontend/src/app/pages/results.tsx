import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from '../components/navbar';
import { UrgencyBadge } from '../components/urgency-badge';
import { AIExplanation } from '../components/ai-explanation';
import { Stethoscope, MapPin, Star, Calendar } from 'lucide-react';
import api from '../../lib/api';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);

  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    const raw = sessionStorage.getItem('ticketPayload');
    if (!raw) {
      setError('No symptoms found. Please go back and fill in your symptoms.');
      setLoading(false);
      return;
    }

    const { symptoms, description } = JSON.parse(raw);
    const symptomsText = [symptoms, description].filter(Boolean).join('. ');

    api.analyzeSymptoms({ userId: user?._id, symptomsText, lat: 40.4774, lng: -74.4518 })
      .then(async (res) => {
        const data = res?.data || {};
        setResult(data);

        if (data.predictedSpecialization) {
          try {
            // Try exact specialization match
            const docRes = await api.listDoctors(
              `specialty=${encodeURIComponent(data.predictedSpecialization)}&limit=10`
            );
            let docs = docRes?.data || [];

            // If no doctors found for this spec, fall back to General Medicine
            if (docs.length === 0) {
              const fallback = await api.listDoctors('specialty=General%20Medicine&limit=10');
              docs = fallback?.data || [];
            }

            // If still none, just list available doctors
            if (docs.length === 0) {
              const any = await api.listDoctors('limit=10');
              docs = any?.data || [];
            }

            setDoctors(docs);
          } catch { /* ignore */ }
        }
      })
      .catch((err) => setError(err?.error || 'AI analysis failed. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const predictedSpecialization = result?.predictedSpecialization || '';
  const confidence = result?.confidence ?? 0;
  const urgency: string = result?.urgency || 'Normal';
  const recommended = result?.recommended || [];
  const urgencyLevel = urgency === 'Emergency' ? 'emergency' : urgency === 'Urgent' ? 'urgent' : 'mild';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing your symptoms...</h2>
          <p className="text-gray-600">Our AI is processing your information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-[#2563EB] text-white rounded-xl">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* AI Recommendation */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-2xl flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Recommendation</h2>
              <p className="text-gray-600">Based on your symptom analysis</p>
            </div>
            <UrgencyBadge level={urgencyLevel} />
          </div>
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-[#2563EB] mb-4">{predictedSpecialization}</h3>
            <p className="text-gray-600 text-lg">
              We recommend consulting with a specialist in {predictedSpecialization.toLowerCase()} for your symptoms.
            </p>
            <p className="text-sm text-gray-500 mt-2">Confidence: {(confidence * 100).toFixed(0)}%</p>
          </div>
          <AIExplanation>
            <p>
              This recommendation was generated by our AI analysis. Use it as a guideline and consult a
              healthcare professional for a definitive diagnosis.
            </p>
          </AIExplanation>
        </div>

        {/* Available Doctors */}
        {doctors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Available {predictedSpecialization} Doctors
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {doctors.map((doc: any) => (
                <div key={doc._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                      {doc.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{doc.name}</div>
                      <div className="text-sm text-[#2563EB]">{doc.specialization}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500" />
                      {(doc.rating || 0).toFixed(1)}
                    </span>
                    <span>{doc.experienceYears || 0} yrs exp</span>
                  </div>
                  <button
                    onClick={() => navigate(`/booking/${doc._id}`)}
                    className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended hospitals */}
        {recommended.length > 0 && (
          <div className="bg-white rounded-2xl p-6 mb-6">
            <h4 className="text-lg font-semibold mb-4">Recommended Nearby Facilities</h4>
            <ul className="space-y-3">
              {recommended.map((h: any) => (
                <li key={h._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{h.name}</div>
                      <div className="text-sm text-gray-500">{h.location || ''}</div>
                    </div>
                  </div>
                  <div className="text-sm text-yellow-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />{(h.rating || 0).toFixed(1)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/hospitals')}
            className="flex-1 bg-[#2563EB] text-white py-4 rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-blue-200"
          >
            View Nearby Hospitals
          </button>
          <button
            onClick={() => navigate('/')}
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
