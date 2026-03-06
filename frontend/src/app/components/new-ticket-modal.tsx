import { useState } from 'react';
import { X, AlertCircle, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewTicketModal({ isOpen, onClose }: NewTicketModalProps) {
  const [symptoms, setSymptoms] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save payload to sessionStorage then navigate to results page
    try {
      sessionStorage.setItem('ticketPayload', JSON.stringify({ symptoms, description, urgency }));
    } catch (e) {
      // ignore storage errors
    }
    navigate('/results');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold text-gray-900">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2563EB]" />
                Main Symptoms
              </div>
            </label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., Fever, headache, sore throat"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Detailed Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your symptoms in detail, when they started, and any other relevant information..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Be as specific as possible to get the best recommendations
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#2563EB]" />
                How urgent is this?
              </div>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setUrgency('low')}
                className={`p-4 border-2 rounded-xl transition-all ${
                  urgency === 'low'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <div className="font-medium text-gray-900">Low</div>
                  <div className="text-xs text-gray-500 mt-1">Can wait</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUrgency('medium')}
                className={`p-4 border-2 rounded-xl transition-all ${
                  urgency === 'medium'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="text-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-2"></div>
                  <div className="font-medium text-gray-900">Medium</div>
                  <div className="text-xs text-gray-500 mt-1">Soon</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUrgency('high')}
                className={`p-4 border-2 rounded-xl transition-all ${
                  urgency === 'high'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="text-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2"></div>
                  <div className="font-medium text-gray-900">High</div>
                  <div className="text-xs text-gray-500 mt-1">Urgent</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium text-gray-900 mb-1">Next Steps</p>
                <p>
                  After submitting, our AI will analyze your symptoms and recommend appropriate healthcare providers near you. You can then book an appointment directly.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-blue-200"
            >
              Continue to Analysis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
