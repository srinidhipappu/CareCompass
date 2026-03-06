import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from '../components/navbar';
import { TicketCard, Ticket } from '../components/ticket-card';
import { NewTicketModal } from '../components/new-ticket-modal';
import { LeafletMap } from '../components/leaflet-map';
import { Plus, Calendar, Activity, TrendingUp, Clock, Hospital, Stethoscope } from 'lucide-react';
import api from '../../lib/api';

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 40.7128, lng: -74.006 };

function mapAppointmentToTicket(appt: any): Ticket {
  const date = new Date(appt.appointmentDate);
  const urgencyMap: Record<string, Ticket['urgency']> = {
    Emergency: 'high', Urgent: 'medium', Normal: 'low',
    high: 'high', medium: 'medium', low: 'low',
  };
  return {
    id: appt._id,
    title: appt.doctorId?.specialization || 'Appointment',
    symptoms: appt.symptoms || '',
    urgency: urgencyMap[appt.urgency] || 'low',
    status: appt.status || 'pending',
    facility: appt.hospitalId?.name || appt.hospitalId || '—',
    doctor: appt.doctorId?.name || undefined,
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    location: appt.hospitalId?.location || '',
  };
}

export default function DashboardPage() {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'map'>('overview');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const navigate = useNavigate();

  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.getUserAppointments(user._id)
      .then((res) => setTickets((res?.data || []).map(mapAppointmentToTicket)))
      .catch(() => setTickets([]))
      .finally(() => setLoadingTickets(false));
  }, []);

  const upcoming = tickets.filter((t) => t.status === 'pending' || t.status === 'confirmed');
  const completed = tickets.filter((t) => t.status === 'completed');

  const stats = [
    { label: 'Total Appointments', value: String(tickets.length), icon: Calendar, color: 'bg-blue-100 text-blue-600' },
    { label: 'Upcoming', value: String(upcoming.length), icon: Clock, color: 'bg-green-100 text-green-600' },
    { label: 'Pending', value: String(tickets.filter((t) => t.status === 'pending').length), icon: Activity, color: 'bg-orange-100 text-orange-600' },
    { label: 'Completed', value: String(completed.length), icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-gray-600 mt-1">Manage your healthcare appointments and find nearby facilities</p>
            </div>
            <button
              onClick={() => setIsNewTicketModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-blue-200"
            >
              <Plus className="w-5 h-5" />
              New Ticket
            </button>
          </div>

          <div className="flex gap-2 mt-6">
            {(['overview', 'tickets', 'map'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'tickets' ? 'My Tickets' : 'Nearby Facilities'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Two Column */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Recent Appointments</h2>
                  <button onClick={() => setActiveTab('tickets')} className="text-[#2563EB] text-sm font-medium hover:text-[#1d4ed8]">
                    View All
                  </button>
                </div>
                {loadingTickets ? (
                  <p className="text-gray-500 text-sm">Loading...</p>
                ) : tickets.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
                    <p className="font-medium mb-1">No appointments yet</p>
                    <p className="text-sm">Create a new ticket to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.slice(0, 3).map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} onClick={() => navigate(`/ticket/${ticket.id}`)} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Nearby Facilities</h2>
                  <button onClick={() => setActiveTab('map')} className="text-[#2563EB] text-sm font-medium hover:text-[#1d4ed8]">
                    View Map
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-[300px] flex items-center justify-center">
                  <div className="text-center text-gray-500 p-6">
                    <Hospital className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium mb-2">Find Nearby Hospitals</p>
                    <button
                      onClick={() => navigate('/hospitals')}
                      className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm hover:bg-[#1d4ed8] transition-colors"
                    >
                      Search by Zipcode
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Appointments</h2>
              <button
                onClick={() => setIsNewTicketModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Ticket
              </button>
            </div>
            {loadingTickets ? (
              <p className="text-gray-500">Loading...</p>
            ) : tickets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-500">
                <p className="text-lg font-medium mb-2">No appointments yet</p>
                <p className="text-sm mb-6">Submit a ticket to describe your symptoms and find a doctor</p>
                <button
                  onClick={() => setIsNewTicketModalOpen(true)}
                  className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors"
                >
                  Create First Ticket
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onClick={() => navigate(`/ticket/${ticket.id}`)} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nearby Healthcare Facilities</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
              <Hospital className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Search for Hospitals Near You</p>
              <p className="text-sm mb-6">Use the Hospitals page to search by zipcode and view on the map</p>
              <button
                onClick={() => navigate('/hospitals')}
                className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors"
              >
                Go to Hospital Search
              </button>
            </div>
          </div>
        )}
      </div>

      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
      />
    </div>
  );
}
