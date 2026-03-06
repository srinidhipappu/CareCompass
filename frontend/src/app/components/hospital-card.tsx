import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router';

interface HospitalCardProps {
  id: string;
  name: string;
  rating: number;
  distance: number;
  specializations: string[];
}

export function HospitalCard({ id, name, rating, distance, specializations }: HospitalCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{name}</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-gray-900 font-medium">{rating}</span>
        </div>
        
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{distance} km</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {specializations.map((spec, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
          >
            {spec}
          </span>
        ))}
      </div>
      
      <Link
        to={`/doctors/${id}`}
        className="block w-full bg-[#2563EB] text-white text-center py-3 rounded-xl hover:bg-[#1d4ed8] transition-colors"
      >
        View Doctors
      </Link>
    </div>
  );
}
