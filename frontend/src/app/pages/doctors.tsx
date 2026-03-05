import { useParams } from 'react-router';
import { Navbar } from '../components/navbar';
import { DoctorCard } from '../components/doctor-card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export default function DoctorsPage() {
  const { hospitalId } = useParams();

  const doctors = [
    {
      id: '1',
      name: 'Sarah Mitchell',
      specialization: 'Neurology',
      hospital: 'Memorial Medical Center',
      availability: 'Available Tomorrow',
    },
    {
      id: '2',
      name: 'James Chen',
      specialization: 'Neurology & Pain Management',
      hospital: 'Memorial Medical Center',
      availability: 'Available Today',
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      specialization: 'Pediatric Neurology',
      hospital: 'Memorial Medical Center',
      availability: 'Available in 3 days',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/hospitals"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Hospitals
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Neurologists at Memorial Medical Center
          </h1>
          <p className="text-gray-600">
            Select a doctor to book your appointment
          </p>
        </div>
        
        <div className="space-y-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} {...doctor} />
          ))}
        </div>
        
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help Choosing?</h3>
          <p className="text-gray-600 mb-4">
            Our patient care team can help you find the right specialist based on your specific needs and insurance coverage.
          </p>
          <button className="bg-white text-[#2563EB] px-6 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-blue-200">
            Contact Patient Care
          </button>
        </div>
      </div>
    </div>
  );
}
