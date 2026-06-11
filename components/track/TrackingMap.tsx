"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface TrackingMapProps {
  packageData: any;
}

export default function TrackingMap({ packageData }: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [clientLocation, setClientLocation] = useState<[number, number] | null>(null);

  // Get real client location
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setClientLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting client location:", error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadMap = async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      // Fix Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (!mapContainerRef.current) return;

      const location = packageData.currentLocation;
      if (!location || !location.coordinates) {
        setLoading(false);
        return;
      }

      // Leaflet expects [lat, lng], MongoDB provides [lng, lat]
      const latLng: [number, number] = [location.coordinates[1], location.coordinates[0]];

      if (!mapRef.current) {
        // Initialize map
        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: false,
        }).setView(latLng, 14);
        
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
      } else {
        // Clear existing markers/layers to prevent duplicates when packageData changes
        mapRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            mapRef.current.removeLayer(layer);
          }
        });
      }

      const bounds = L.latLngBounds([latLng]);

      // Custom SVG Icons
      const branchIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background-color:#f59e0b;border-radius:50%;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);border:2px solid white;color:#0f172a;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      // 1. Add current location marker (Branch/Package)
      const marker = L.marker(latLng, { icon: branchIcon }).addTo(mapRef.current);
      
      const popupContent = `
        <div style="font-family: inherit; padding: 4px;">
          <strong style="color: #0f172a; font-size: 14px;">${location.type.toUpperCase()}</strong>
          ${location.name ? `<br/><span style="color: #475569; font-size: 13px;">${location.name}</span>` : ""}
          ${location.address ? `<br/><span style="color: #64748b; font-size: 12px;">${
            typeof location.address === 'string' 
              ? location.address 
              : [location.address.street, location.address.city, location.address.state].filter(Boolean).join(', ')
          }</span>` : ""}
          ${location.message ? `<br/><br/><span style="color: #fbbf24; font-weight: 600; font-size: 12px;">${location.message}</span>` : ""}
        </div>
      `;
      marker.bindPopup(popupContent).openPopup();



      // 3. Add REAL Client Location Marker (User) and draw route
      if (clientLocation) {
        const clientIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background-color:#3b82f6;border-radius:50%;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);border:2px solid white;color:white;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        const clientMarker = L.marker(clientLocation, { icon: clientIcon }).addTo(mapRef.current);
        
        clientMarker.bindPopup(`
          <div style="font-family: inherit; padding: 4px;">
            <strong style="color: #ef4444; font-size: 14px;">YOU ARE HERE</strong>
            <br/><span style="color: #64748b; font-size: 12px;">Your current device location</span>
          </div>
        `);
        
        bounds.extend(clientLocation);
        
        // Draw route from real client location to the branch if branch pickup and at branch
        if (packageData.destination.type === 'branch_pickup' && packageData.status === 'at_destination_branch') {
           fetch(`https://router.project-osrm.org/route/v1/driving/${latLng[1]},${latLng[0]};${clientLocation[1]},${clientLocation[0]}?overview=full&geometries=geojson`)
             .then(res => res.json())
             .then(data => {
               if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                 const routeCoords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                 L.polyline(routeCoords, {
                   color: '#fbbf24', // amber-400
                   weight: 5,
                   opacity: 0.9
                 }).addTo(mapRef.current);
               } else {
                 // Fallback to straight line if OSRM fails
                 L.polyline([latLng, clientLocation], {
                   color: '#fbbf24',
                   weight: 4,
                   dashArray: '10, 10',
                   opacity: 0.8
                 }).addTo(mapRef.current);
               }
             })
             .catch(err => {
               console.error("OSRM fetch error:", err);
               L.polyline([latLng, clientLocation], {
                 color: '#fbbf24',
                 weight: 4,
                 dashArray: '10, 10',
                 opacity: 0.8
               }).addTo(mapRef.current);
             });
        }
      } else {
        // Fallback: if we can't get real location, draw route to delivery address instead
        if (packageData.destination?.coordinates && packageData.destination.type === 'branch_pickup' && packageData.status === 'at_destination_branch') {
           const destCoords = packageData.destination.coordinates;
           fetch(`https://router.project-osrm.org/route/v1/driving/${latLng[1]},${latLng[0]};${destCoords[0]},${destCoords[1]}?overview=full&geometries=geojson`)
             .then(res => res.json())
             .then(data => {
               if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                 const routeCoords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                 L.polyline(routeCoords, {
                   color: '#fbbf24',
                   weight: 5,
                   opacity: 0.9
                 }).addTo(mapRef.current);
               } else {
                 L.polyline([latLng, [destCoords[1], destCoords[0]]], {
                   color: '#fbbf24', 
                   weight: 4,
                   dashArray: '10, 10',
                   opacity: 0.8
                 }).addTo(mapRef.current);
               }
             })
             .catch(err => {
               L.polyline([latLng, [destCoords[1], destCoords[0]]], {
                 color: '#fbbf24', 
                 weight: 4,
                 dashArray: '10, 10',
                 opacity: 0.8
               }).addTo(mapRef.current);
             });
        }
      }

      // Adjust map view to fit all markers
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else {
        mapRef.current.setView(latLng, 14);
      }

      setLoading(false);
    };

    loadMap();

    // Cleanup on unmount
    return () => {
      // We don't destroy the map on every re-render to avoid flashing,
      // but we could if needed. Since we use `mapRef.current`, it persists.
    };
  }, [packageData, clientLocation]);

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
          <p className="text-sm font-medium tracking-wide text-amber-400">Loading Map...</p>
        </div>
      )}
    </div>
  );
}
