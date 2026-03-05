import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Navbar } from '../components/navbar';
import { Calendar, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export default function BookingPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      setIsConfirmed(true);
    }
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <Navbar />
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Appointment Confirmed!
            </h1>
            <p className="text-gray-600 mb-8">
              Your appointment has been successfully booked.
            </p>
            
            <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Appointment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="text-gray-900 font-medium">Dr. Sarah Mitchell</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialization:</span>
                  <span className="text-gray-900 font-medium">Neurology</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hospital:</span>
                  <span className="text-gray-900 font-medium">Memorial Medical Center</span>
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
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors"
              >
                Go to Dashboard
              </button>
              <button className="w-full bg-white text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200">
                Add to Calendar
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to={`/doctors/1`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Doctors
        </Link>
        
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-full flex items-center justify-center text-white text-2xl font-semibold">
              SM
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Book Appointment with Dr. Sarah Mitchell
              </h1>
              <p className="text-[#2563EB] font-medium">Neurology</p>
              <p className="text-gray-600 text-sm">Memorial Medical Center</p>
            </div>
          </div>
          
          {/* Date Picker */}
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
          
          {/* Time Slot Selector */}
          <div className="mb-8">
            <label className="text-gray-900 font-semibold mb-4 block">
              Select Time Slot
            </label>
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
          
          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
          >
            Confirm Appointment
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            By booking, you agree to our terms and conditions. You can cancel or reschedule up to 24 hours before your appointment.
          </p>
        </div>
      </div>
    </div>
  );
}