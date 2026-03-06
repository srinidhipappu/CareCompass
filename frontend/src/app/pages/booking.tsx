import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Navbar } from '../components/navbar';
import { Calendar, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';

export default function BookingPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  // Retrieve symptoms/urgency saved by new-ticket-modal
  const ticketPayloadRaw = sessionStorage.getItem('ticketPayload');
  const ticketPayload = ticketPayloadRaw ? JSON.parse(ticketPayloadRaw) : {};

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!doctorId) return;
    api.getDoctor(doctorId).then((res) => setDoctor(res?.data)).catch(() => setError('Could not load doctor info'));
  }, [doctorId]);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !user || !doctorId) return;
    setLoading(true);
    setError('');
    try {
      // Combine date + time into ISO string
      const [hourMin, ampm] = selectedTime.split(' ');
      const [h, m] = hourMin.split(':').map(Number);
      const hour24 = ampm === 'PM' && h !== 12 ? h + 12 : ampm === 'AM' && h === 12 ? 0 : h;
      const appointmentDate = new Date(`${selectedDate}T${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);

      await api.createAppointment({
        userId: user._id,
        doctorId,
        hospitalId: doctor?.hospitalId?._id || doctor?.hospitalId,
        appointmentDate: appointmentDate.toISOString(),
        symptoms: ticketPayload.symptoms || ticketPayload.description || '',
        urgency: ticketPayload.urgency || 'Normal',
      });
      setIsConfirmed(true);
    } catch (err: any) {
      setError(err?.error || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initials = doctor?.name
    ? doctor.name.split(' ').map((n: string) => n[0]).join('')
    : '?';

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Appointment Confirmed!</h1>
            <p className="text-gray-600 mb-8">Your appointment has been successfully booked.</p>
            <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Appointment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="text-gray-900 font-medium">{doctor?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialization:</span>
                  <span className="text-gray-900 font-medium">{doctor?.specialization || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-900 font-medium">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="text-gray-900 font-medium">{selectedTime}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/results" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Results
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-full flex items-center justify-center text-white text-2xl font-semibold">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {doctor ? `Book Appointment with ${doctor.name}` : 'Loading...'}
              </h1>
              <p className="text-[#2563EB] font-medium">{doctor?.specialization || ''}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="mb-8">
            <label className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
              <Calendar className="w-5 h-5" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>

          <div className="mb-8">
            <label className="text-gray-900 font-semibold mb-4 block">Select Time Slot</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 rounded-xl font-medium transition-colors ${
                    selectedTime === time
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || loading}
            className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
          >
            {loading ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}
