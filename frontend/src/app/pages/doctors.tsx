import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Navbar } from '../components/navbar';
import { ArrowLeft, Star, Calendar } from 'lucide-react';
import api from '../../lib/api';

export default function DoctorsPage() {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hospitalId) return;
    Promise.all([
      api.listDoctors(`hospitalId=${hospitalId}&limit=20`),
      api.getHospital(hospitalId),
    ])
      .then(([docRes, hospRes]) => {
        setDoctors(docRes?.data || []);
        setHospital(hospRes?.data || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hospitalId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/hospitals" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Hospitals
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {hospital ? `Doctors at ${hospital.name}` : 'Doctors'}
          </h1>
          {hospital?.location && (
            <p className="text-gray-600">{hospital.location}</p>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading doctors...</p>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <p className="font-medium">No doctors found at this hospital.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.map((doc) => (
              <div key={doc._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {doc.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{doc.name}</p>
                    <p className="text-[#2563EB] text-sm font-medium">{doc.specialization}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500" />
                        {(doc.rating || 0).toFixed(1)}
                      </span>
                      {doc.experienceYears && <span>{doc.experienceYears} yrs exp</span>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/booking/${doc._id}`)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1d4ed8] transition-colors flex-shrink-0"
                >
                  <Calendar className="w-4 h-4" />
                  Book
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
