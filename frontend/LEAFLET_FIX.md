# Leaflet React Context Error Fix

## Problem
When integrating Leaflet maps using `react-leaflet` v5.0.0, the following errors occurred:

```
Warning: Rendering <Context> directly is not supported
Warning: A context consumer was rendered with multiple children, or a child that isn't a function
TypeError: a is not a function
```

## Root Cause
`react-leaflet` v5.0.0 has compatibility issues with:
- React 18's strict mode
- Figma Make's rendering environment
- The way React context consumers expect their children to be structured

The `MapContainer` component from `react-leaflet` wraps Leaflet's map in a React context, but this context API was being rendered incorrectly, causing context consumer errors.

## Solution
Switched from `react-leaflet` to **vanilla Leaflet** with React hooks:

### Before (react-leaflet)
```tsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

<MapContainer center={center} zoom={zoom}>
  <TileLayer url="..." />
  <MapController />
  {facilities.map(f => (
    <Marker position={[f.lat, f.lng]}>
      <Popup>...</Popup>
    </Marker>
  ))}
</MapContainer>
```

### After (vanilla Leaflet)
```tsx
import L from 'leaflet';

useEffect(() => {
  const map = L.map(mapContainerRef.current).setView([lat, lng], zoom);
  L.tileLayer('...').addTo(map);
  
  facilities.forEach(f => {
    const marker = L.marker([f.lat, f.lng]).addTo(map);
    marker.bindPopup('...');
  });
}, []);
```

## Changes Made

1. **Rewrote `/src/app/components/leaflet-map.tsx`**
   - Removed all `react-leaflet` imports
   - Used `L.map()` directly to create map instance
   - Used `useRef` to maintain map and marker references
   - Used `useEffect` for lifecycle management

2. **Updated `/package.json`**
   - Removed `react-leaflet` dependency
   - Kept `leaflet` v1.9.4

3. **Updated `/LEAFLET_MIGRATION.md`**
   - Documented the vanilla Leaflet approach
   - Explained why react-leaflet was removed

## Benefits of Vanilla Leaflet

✅ **No React Context Issues** - Direct DOM manipulation avoids context API  
✅ **Better Compatibility** - Works in all React environments  
✅ **Smaller Bundle** - No wrapper library needed  
✅ **More Control** - Direct access to Leaflet API  
✅ **No Console Warnings** - Clean implementation  
✅ **Same Features** - All functionality preserved  

## Features Preserved

- ✅ Interactive markers (red for hospitals, blue for clinics)
- ✅ Popup info windows with facility details
- ✅ Automatic bounds fitting to show all facilities
- ✅ Click handlers for facility selection
- ✅ Programmatic popup opening when facility selected
- ✅ Zoom controls and map interactions
- ✅ Responsive design

## Implementation Pattern

```tsx
// 1. Create refs for map and markers
const mapRef = useRef<L.Map | null>(null);
const markersRef = useRef<{ [key: string]: L.Marker }>({});

// 2. Initialize map once
useEffect(() => {
  const map = L.map(containerRef.current).setView([lat, lng], zoom);
  L.tileLayer(url).addTo(map);
  mapRef.current = map;
  
  return () => map.remove(); // Cleanup
}, []);

// 3. Update markers when data changes
useEffect(() => {
  // Clear old markers
  Object.values(markersRef.current).forEach(m => m.remove());
  
  // Add new markers
  facilities.forEach(f => {
    const marker = L.marker([f.lat, f.lng]).addTo(mapRef.current);
    markersRef.current[f.id] = marker;
  });
}, [facilities]);

// 4. Handle selection changes
useEffect(() => {
  if (selectedFacility) {
    markersRef.current[selectedFacility.id]?.openPopup();
  }
}, [selectedFacility]);
```

## Lessons Learned

1. **React wrappers aren't always better** - Sometimes vanilla JS libraries work better with React than their React wrappers
2. **Context API can be fragile** - Complex context structures may not work in all environments
3. **Direct DOM manipulation is okay** - When wrapped in proper React lifecycle hooks (useEffect, useRef)
4. **Simplicity wins** - The vanilla implementation is actually simpler and more maintainable

---

**Status:** ✅ Fixed  
**Date:** March 5, 2026  
**Impact:** All map functionality working without errors
