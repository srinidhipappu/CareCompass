import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Facility {
  id: string;
  name: string;
  type: string;
  position: { lat: number; lng: number };
  address: string;
  waitTime: string;
  rating: number;
}

interface LeafletMapProps {
  facilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (facility: Facility | null) => void;
  mapContainerStyle: { width: string; height: string };
  center: { lat: number; lng: number };
  zoom?: number;
  onViewDetails?: () => void;
}

// Fix for default marker icons in Leaflet
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const clinicIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function LeafletMap({
  facilities,
  selectedFacility,
  onSelectFacility,
  mapContainerStyle,
  center,
  zoom = 13,
  onViewDetails,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current).setView([center.lat, center.lng], zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when facilities change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    facilities.forEach(facility => {
      const marker = L.marker(
        [facility.position.lat, facility.position.lng],
        { icon: facility.type === 'hospital' ? hospitalIcon : clinicIcon }
      ).addTo(map);

      // Create popup content
      const popupContent = `
        <div class="p-2 max-w-xs">
          <h3 class="font-semibold text-gray-900 mb-2">${facility.name}</h3>
          <p class="text-sm text-gray-600 mb-1">${facility.address}</p>
          <div class="flex items-center justify-between text-sm mt-2">
            <span class="text-green-600 font-medium">Wait: ${facility.waitTime}</span>
            <span class="text-yellow-600">${facility.rating} ★</span>
          </div>
          ${onViewDetails ? '<button onclick="handleViewDetails()" class="w-full mt-3 px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#1d4ed8]">View Details</button>' : ''}
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add click handler
      marker.on('click', () => {
        onSelectFacility(facility);
      });

      marker.on('popupclose', () => {
        onSelectFacility(null);
      });

      markersRef.current[facility.id] = marker;
    });

    // Fit bounds to show all markers
    if (facilities.length > 0) {
      const bounds = L.latLngBounds(
        facilities.map(f => [f.position.lat, f.position.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [facilities, onSelectFacility, onViewDetails]);

  // Handle selected facility
  useEffect(() => {
    if (!mapRef.current || !selectedFacility) return;

    const marker = markersRef.current[selectedFacility.id];
    if (marker) {
      marker.openPopup();
      mapRef.current.setView([selectedFacility.position.lat, selectedFacility.position.lng], mapRef.current.getZoom());
    }
  }, [selectedFacility]);

  return (
    <div style={mapContainerStyle}>
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
