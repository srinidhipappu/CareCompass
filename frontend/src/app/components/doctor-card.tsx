import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router';

interface DoctorCardProps {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  availability: string;
}

export function DoctorCard({ id, name, specialization, hospital, availability }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-full flex items-center justify-center text-white text-2xl font-semibold">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">Dr. {name}</h3>
          <p className="text-[#2563EB] font-medium mb-2">{specialization}</p>
          
          <div className="flex items-center gap-1 text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{hospital}</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-600 mb-4">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{availability}</span>
          </div>
          
          <Link
            to={`/booking/${id}`}
            className="inline-block bg-[#2563EB] text-white px-6 py-2.5 rounded-xl hover:bg-[#1d4ed8] transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
