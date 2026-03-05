import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from '../components/navbar';
import { TicketCard, Ticket } from '../components/ticket-card';
import { NewTicketModal } from '../components/new-ticket-modal';
import { LeafletMap } from '../components/leaflet-map';
import { 
  Plus, 
  Calendar, 
  Activity,
  TrendingUp,
  Clock,
  Hospital,
  Stethoscope
} from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Default center (San Francisco)
const center = {
  lat: 37.7749,
  lng: -122.4194,
};

// Mock nearby facilities
const nearbyFacilities = [
  {
    id: '1',
    name: 'City Medical Center',
    type: 'hospital',
    position: { lat: 37.7849, lng: -122.4094 },
    address: '123 Medical Plaza, San Francisco, CA',
    waitTime: '15 min',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'QuickCare Urgent Care',
    type: 'urgent-care',
    position: { lat: 37.7749, lng: -122.4294 },
    address: '456 Health St, San Francisco, CA',
    waitTime: '5 min',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Bay Area Emergency Center',
    type: 'hospital',
    position: { lat: 37.7649, lng: -122.4194 },
    address: '789 Emergency Blvd, San Francisco, CA',
    waitTime: '25 min',
    rating: 4.3,
  },
  {
    id: '4',
    name: 'Mission District Urgent Care',
    type: 'urgent-care',
    position: { lat: 37.7599, lng: -122.4094 },
    address: '321 Mission St, San Francisco, CA',
    waitTime: '10 min',
    rating: 4.6,
  },
];

// Mock tickets data
const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Routine Checkup',
    symptoms: 'Annual physical examination',
    urgency: 'low',
    status: 'confirmed',
    facility: 'City Medical Center',
    doctor: 'Sarah Johnson',
    date: 'Mar 15, 2026',
    time: '10:00 AM',
    location: '123 Medical Plaza, San Francisco',
  },
  {
    id: '2',
    title: 'Flu Symptoms',
    symptoms: 'Fever, cough, body aches',
    urgency: 'medium',
    status: 'pending',
    facility: 'QuickCare Urgent Care',
    date: 'Mar 8, 2026',
    time: '2:30 PM',
    location: '456 Health St, San Francisco',
  },
  {
    id: '3',
    title: 'Follow-up Consultation',
    symptoms: 'Post-surgery checkup',
    urgency: 'low',
    status: 'completed',
    facility: 'Bay Area Emergency Center',
    doctor: 'Michael Chen',
    date: 'Feb 28, 2026',
    time: '11:00 AM',
    location: '789 Emergency Blvd, San Francisco',
  },
];

export default function DashboardPage() {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<typeof nearbyFacilities[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'map'>('overview');
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Total Appointments',
      value: '12',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Upcoming',
      value: '2',
      icon: Clock,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Pending',
      value: '1',
      icon: Activity,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Completed',
      value: '9',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'tickets'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'map'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nearby Facilities
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
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

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Tickets */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Recent Appointments</h2>
                  <button
                    onClick={() => setActiveTab('tickets')}
                    className="text-[#2563EB] text-sm font-medium hover:text-[#1d4ed8]"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {mockTickets.slice(0, 3).map((ticket) => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket}
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                    />
                  ))}
                </div>
              </div>

              {/* Map Preview */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Nearby Facilities</h2>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-[#2563EB] text-sm font-medium hover:text-[#1d4ed8]"
                  >
                    View Map
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="h-[400px]">
                    <LeafletMap
                      facilities={nearbyFacilities}
                      selectedFacility={selectedFacility}
                      onSelectFacility={setSelectedFacility}
                      mapContainerStyle={mapContainerStyle}
                      center={center}
                      zoom={13}
                      onViewDetails={() => navigate('/hospitals')}
                    />
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTickets.map((ticket) => (
                <TicketCard 
                  key={ticket.id} 
                  ticket={ticket}
                  onClick={() => navigate(`/ticket/${ticket.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nearby Healthcare Facilities</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Facilities List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Facilities Near You</h3>
                  <div className="space-y-3">
                    {nearbyFacilities.map((facility) => (
                      <button
                        key={facility.id}
                        onClick={() => setSelectedFacility(facility)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedFacility?.id === facility.id
                            ? 'border-[#2563EB] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            facility.type === 'hospital' 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {facility.type === 'hospital' ? (
                              <Hospital className="w-5 h-5" />
                            ) : (
                              <Stethoscope className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1">{facility.name}</h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-1">{facility.address}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-green-600 font-medium">Wait: {facility.waitTime}</span>
                              <span className="text-yellow-600">{facility.rating} ★</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-[600px]">
                  <LeafletMap
                    facilities={nearbyFacilities}
                    selectedFacility={selectedFacility}
                    onSelectFacility={setSelectedFacility}
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={13}
                    onViewDetails={() => navigate('/hospitals')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
      />
    </div>
  );
}