import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Navbar } from '../components/navbar';
import { UrgencyBadge } from '../components/urgency-badge';
import {
  ArrowLeft, Calendar, Clock, MapPin, FileText, Phone, X, CheckCircle, AlertCircle
} from 'lucide-react';
import api from '../../lib/api';

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [appt, setAppt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (!ticketId) return;
    api.getAppointment(ticketId)
      .then((res) => setAppt(res?.data))
      .catch(() => setAppt(null))
      .finally(() => setLoading(false));
  }, [ticketId]);

  const handleCancel = async () => {
    if (!ticketId) return;
    await api.deleteAppointment(ticketId).catch(() => {});
    setShowCancelDialog(false);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!appt) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 mb-4">Appointment not found.</p>
          <Link to="/dashboard" className="text-[#2563EB] font-medium">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const date = new Date(appt.appointmentDate);
  const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const urgencyRaw: string = appt.urgency || 'Normal';
  const urgencyLevel = urgencyRaw === 'Emergency' ? 'emergency' : urgencyRaw === 'Urgent' ? 'urgent' : 'mild';

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const status: string = appt.status || 'pending';
  const StatusIcon = status === 'confirmed' || status === 'completed' ? CheckCircle : status === 'cancelled' ? X : Clock;

  const doctor = appt.doctorId;
  const hospital = appt.hospitalId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] px-8 py-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-1">{doctor?.specialization || 'Appointment'}</h1>
                <p className="text-blue-100 text-sm">Ticket #{ticketId}</p>
              </div>
              <UrgencyBadge level={urgencyLevel} />
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="capitalize">{status}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left: Appointment details */}
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">{dateStr}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium text-gray-900">{timeStr}</p>
                  </div>
                </div>

                {appt.symptoms && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Symptoms</p>
                      <p className="font-medium text-gray-900">{appt.symptoms}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Provider + Hospital */}
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900">Provider Information</h2>

                {doctor && (
                  <div>
                    <p className="text-sm text-gray-500">Doctor</p>
                    <p className="font-medium text-gray-900">{doctor.name}</p>
                    <p className="text-sm text-[#2563EB]">{doctor.specialization}</p>
                  </div>
                )}

                {hospital && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Hospital</p>
                      <p className="font-medium text-gray-900">{hospital.name}</p>
                      <p className="text-sm text-gray-600">{hospital.location}</p>
                    </div>
                  </div>
                )}

                {hospital?.contact && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <a href={`tel:${hospital.contact}`} className="font-medium text-[#2563EB] hover:text-[#1d4ed8]">
                        {hospital.contact}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reminder */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm">
                  Please arrive 15 minutes early. Bring a valid ID and any relevant medical records or previous test results.
                </p>
              </div>
            </div>

            {(status === 'pending' || status === 'confirmed') && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="w-full sm:w-auto px-8 py-3 bg-white text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors border border-red-200"
              >
                Cancel Appointment
              </button>
            )}

            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-sm text-gray-400">
                Booked on {new Date(appt.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Cancel Appointment?</h2>
            <p className="text-gray-600 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Keep
              </button>
              <button
                onClick={handleCancel}
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
