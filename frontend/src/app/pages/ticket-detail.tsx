import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Navbar } from '../components/navbar';
import { UrgencyBadge } from '../components/urgency-badge';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Phone,
  Mail,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Mock ticket data - in real app, fetch based on ticketId
  const ticket = {
    id: ticketId,
    title: 'Routine Checkup',
    symptoms: 'Annual physical examination, general health assessment',
    urgency: 'low' as const,
    status: 'confirmed' as const,
    facility: 'City Medical Center',
    doctor: 'Sarah Johnson',
    specialization: 'General Practice',
    date: 'March 15, 2026',
    time: '10:00 AM',
    location: '123 Medical Plaza, San Francisco, CA 94102',
    phone: '(415) 555-0123',
    email: 'appointments@citymedical.com',
    notes: 'Please arrive 15 minutes early to complete any necessary paperwork. Bring your insurance card and ID.',
    createdAt: 'March 1, 2026',
  };

  const handleCancelAppointment = () => {
    // In real app, make API call to cancel
    setShowCancelDialog(false);
    navigate('/dashboard');
  };

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-800', icon: X },
  };

  const StatusIcon = statusConfig[ticket.status].icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] px-8 py-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{ticket.title}</h1>
                <p className="text-blue-100">Ticket #{ticket.id}</p>
              </div>
              <div className="flex gap-2">
                <UrgencyBadge urgency={ticket.urgency} />
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig[ticket.status].color}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="font-medium capitalize">{ticket.status}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Appointment Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Appointment Details</h2>
                
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#2563EB] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">{ticket.date}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#2563EB] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">{ticket.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[#2563EB] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Symptoms</p>
                    <p className="font-medium text-gray-900">{ticket.symptoms}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Provider Information</h2>
                
                <div>
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-medium text-gray-900">Dr. {ticket.doctor}</p>
                  <p className="text-sm text-[#2563EB]">{ticket.specialization}</p>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#2563EB] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{ticket.facility}</p>
                    <p className="text-sm text-gray-600">{ticket.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#2563EB] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a href={`tel:${ticket.phone}`} className="font-medium text-[#2563EB] hover:text-[#1d4ed8]">
                      {ticket.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#2563EB] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a href={`mailto:${ticket.email}`} className="font-medium text-[#2563EB] hover:text-[#1d4ed8]">
                      {ticket.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            {ticket.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Important Notes</h3>
                    <p className="text-gray-700">{ticket.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {ticket.status === 'confirmed' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-[#2563EB] text-white py-3 rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors">
                  Add to Calendar
                </button>
                <button className="flex-1 bg-white text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200">
                  Reschedule
                </button>
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="flex-1 bg-white text-red-600 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors border border-red-200"
                >
                  Cancel Appointment
                </button>
              </div>
            )}

            {ticket.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">Pending Confirmation</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Your appointment is pending confirmation from the healthcare provider. You will receive a notification once it's confirmed.
                </p>
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="text-red-600 font-medium hover:text-red-700"
                >
                  Cancel Request
                </button>
              </div>
            )}

            {ticket.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Appointment Completed</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  This appointment was completed on {ticket.date}. Thank you for choosing {ticket.facility}.
                </p>
                <button className="text-[#2563EB] font-medium hover:text-[#1d4ed8]">
                  Book Follow-up Appointment
                </button>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Ticket created on {ticket.createdAt}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Cancel Appointment?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelAppointment}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
