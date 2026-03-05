# Leaflet Migration Guide

## Summary
Google Maps has been completely replaced with Leaflet throughout the CareCompass AI application. Using vanilla Leaflet (not react-leaflet) for maximum stability and compatibility.

## What Changed

### ✅ Completed
- **Installed Packages:**
  - `leaflet` (v1.9.4) - Using vanilla JS API directly for better React compatibility

- **Removed Packages:**
  - `@react-google-maps/api` (no longer needed)
  - `react-leaflet` (removed due to React 18 compatibility issues)

- **New Components:**
  - `/src/app/components/leaflet-map.tsx` - Main map component using Leaflet

- **Removed Components:**
  - `/src/app/components/google-map-wrapper.tsx` - Old Google Maps wrapper
  - `/src/app/components/map-fallback.tsx` - No longer needed (Leaflet doesn't require API keys)

- **Updated Files:**
  - `/src/app/pages/dashboard.tsx` - Now uses LeafletMap component
  - `/src/app/pages/hospitals.tsx` - Now uses LeafletMap with interactive facility selection
  - `/src/styles/index.css` - Added Leaflet CSS import
  - `/package.json` - Updated dependencies

## Benefits

### 🚀 Advantages of Leaflet
1. **No API Key Required** - Works out of the box without any configuration
2. **Free & Open Source** - No usage limits or costs
3. **Lightweight** - Smaller bundle size than Google Maps
4. **Privacy-Friendly** - Uses OpenStreetMap tiles
5. **No Console Errors** - Clean implementation without API warnings

### 🗺️ Features Preserved
All previous Google Maps functionality is maintained:
- ✅ Interactive markers (red for hospitals, blue for clinics)
- ✅ Popup info windows with facility details
- ✅ Automatic bounds fitting to show all facilities
- ✅ Click handlers for facility selection
- ✅ Zoom controls
- ✅ Responsive design
- ✅ Custom styling to match CareCompass AI brand

## Technical Details

### Map Tiles
- **Provider:** OpenStreetMap
- **URL:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Attribution:** OpenStreetMap contributors

### Marker Icons
- **Hospital Markers:** Red pin icon
- **Clinic/Urgent Care:** Blue pin icon
- **Source:** Leaflet Color Markers (via CDN)

### Component API
The `LeafletMap` component accepts the same props as the previous `GoogleMapWrapper`:
```typescript
interface LeafletMapProps {
  facilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (facility: Facility | null) => void;
  mapContainerStyle: { width: string; height: string };
  center: { lat: number; lng: number };
  zoom?: number;
  onViewDetails?: () => void;
}
```

## Usage Example

```tsx
import { LeafletMap } from './components/leaflet-map';

<LeafletMap
  facilities={nearbyFacilities}
  selectedFacility={selectedFacility}
  onSelectFacility={setSelectedFacility}
  mapContainerStyle={{ width: '100%', height: '100%' }}
  center={{ lat: 37.7749, lng: -122.4194 }}
  zoom={13}
  onViewDetails={() => navigate('/hospitals')}
/>
```

## Development Notes

### CSS Import
Leaflet CSS is imported in two places for redundancy:
1. `/src/styles/index.css` - Global import
2. `/src/app/components/leaflet-map.tsx` - Component-level import

### Implementation Details
The component uses vanilla Leaflet with React hooks:
- `useRef` - For maintaining map instance and marker references
- `useEffect` - For map initialization, marker updates, and facility selection
- Direct Leaflet API calls - No react-leaflet wrapper to avoid context issues
- Programmatic popup control via marker references

## Future Enhancements

Potential improvements for the Leaflet implementation:
- [ ] Add marker clustering for better performance with many facilities
- [ ] Implement custom marker icons specific to CareCompass AI brand
- [ ] Add route directions between user location and selected facility
- [ ] Include traffic layer overlay
- [ ] Add geolocation to center map on user's current location
- [ ] Implement search/geocoding for address lookup

## Troubleshooting

### Map not displaying
- Ensure Leaflet CSS is properly imported
- Check that container has explicit height set
- Verify network can reach OpenStreetMap tile servers

### Markers not appearing
- Confirm marker icon URLs are accessible
- Check that facility positions have valid lat/lng coordinates
- Verify marker references are properly set

### Popups not working
- Ensure popup event handlers are properly bound
- Check that `onSelectFacility` function is provided
- Verify selected facility state is properly managed

---

**Migration Date:** March 5, 2026  
**Migrated By:** AI Assistant  
**Status:** ✅ Complete
