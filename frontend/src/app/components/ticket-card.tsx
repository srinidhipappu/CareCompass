import { Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { UrgencyBadge } from './urgency-badge';

export interface Ticket {
  id: string;
  title: string;
  symptoms: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  facility: string;
  doctor?: string;
  date: string;
  time: string;
  location: string;
}

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {ticket.title}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <UrgencyBadge urgency={ticket.urgency} />
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[ticket.status]}`}>
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="line-clamp-1">{ticket.symptoms}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="line-clamp-1">{ticket.facility}</span>
        </div>
        
        {ticket.doctor && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Dr.</span>
            <span>{ticket.doctor}</span>
          </div>
        )}
        
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2563EB]" />
            <span className="font-medium text-gray-900">{ticket.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            <span className="font-medium text-gray-900">{ticket.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
