

import { useState, useEffect } from 'react';
import zipcodes from 'zipcodes';
import { Navbar } from '../components/navbar';
import { HospitalCard } from '../components/hospital-card';
import { LeafletMap } from '../components/leaflet-map';
import { SlidersHorizontal } from 'lucide-react';
import api from '../../lib/api';

export default function HospitalsPage() {
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [center, setCenter] = useState({ lat: 40.4774, lng: -74.4518 }); // New Brunswick, NJ default
  const [zip, setZip] = useState('08901');
  const [loading, setLoading] = useState(false);

  // Compute distance (km) between two lat/lng points
  const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSearchByZip = async () => {
    try {
      setLoading(true);
      const info = zipcodes.lookup(zip.trim());
      if (!info || !info.latitude || !info.longitude) {
        alert('Invalid or unsupported zipcode');
        setLoading(false);
        return;
      }
      const lat = parseFloat(info.latitude);
      const lng = parseFloat(info.longitude);
      setCenter({ lat, lng });

      const res = await api.listHospitalsNearby(lat, lng, 200, 1, 50);
      const items = res.data || [];

      // Map hospitals to UI shapes
      const mapped = items.map((h: any) => {
        const [lngH = 0, latH = 0] = (h.locationCoords && h.locationCoords.coordinates) || [0, 0];
        const d = distanceKm(lat, lng, latH, lngH);
        return {
          id: h._id,
          name: h.name,
          rating: h.rating || 0,
          distance: Math.round(d * 10) / 10,
          specializations: h.specializations || [],
          address: h.location || '',
          position: { lat: latH, lng: lngH },
        };
      });

      setHospitals(mapped);
      // Build facilities for map
      const facs = mapped.map((m) => ({
        id: m.id,
        name: m.name,
        type: 'hospital',
        position: m.position,
        address: m.address,
        waitTime: '—',
        rating: m.rating,
      }));
      setFacilities(facs);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch nearby hospitals');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run initial search on page load using default zipcode
  useEffect(() => {
    // run on mount
    handleSearchByZip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapContainerStyle = { width: '100%', height: '100%' };

  const sortedHospitals = [...hospitals].sort((a, b) => {
    if (sortBy === 'distance') return a.distance - b.distance;
    return b.rating - a.rating;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nearby Hospitals</h1>
          <p className="text-gray-600">Enter a US zipcode to find nearby hospitals</p>
        </div>

        <div className="mb-6 flex gap-2 items-center">
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="Zipcode (e.g., 94107)"
            className="px-4 py-2 border rounded-lg w-48"
          />
          <button
            onClick={handleSearchByZip}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {loading ? 'Searching…' : 'Find'}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Hospital List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              <SlidersHorizontal className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 font-medium">Sort by:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('distance')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sortBy === 'distance' ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Distance
                </button>
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sortBy === 'rating' ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Rating
                </button>
              </div>
            </div>

            {/* Hospital Cards */}
            <div className="space-y-4">
              {sortedHospitals.map((hospital) => (
                <HospitalCard key={hospital.id} {...hospital} />
              ))}
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Map View</h3>
              </div>
              <div className="h-[500px]">
                <LeafletMap
                  facilities={facilities}
                  selectedFacility={selectedFacility}
                  onSelectFacility={setSelectedFacility}
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={13}
                />
              </div>
              <div className="p-6 pt-4 space-y-2">
                {sortedHospitals.slice(0, 3).map((hospital, index) => (
                  <button
                    key={hospital.id}
                    onClick={() => {
                      const facility = facilities.find((f) => f.id === hospital.id);
                      setSelectedFacility(facility || null);
                    }}
                    className={`w-full flex items-center gap-2 text-sm p-2 rounded-lg transition-colors ${
                      selectedFacility?.id === hospital.id ? 'bg-blue-50 border border-[#2563EB]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-6 h-6 bg-[#2563EB] text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 truncate">{hospital.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
