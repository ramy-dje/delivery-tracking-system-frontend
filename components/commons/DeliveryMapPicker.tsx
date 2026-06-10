"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Crosshair, Loader2 } from "lucide-react";

interface DeliveryMapPickerProps {
  value?: { lat: number; lng: number };
  onChange: (coords: { lat: number; lng: number } | null) => void;
  disabled?: boolean;
  address?: string;
}

export default function DeliveryMapPicker({ value, onChange, disabled, address }: DeliveryMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [searchAddress, setSearchAddress] = useState(address || "");

  // Load Leaflet dynamically (avoid SSR issues)
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

      if (!mapContainerRef.current || mapRef.current) return;

      // Default center (Algiers)
      const defaultCenter: [number, number] = value 
        ? [value.lat, value.lng] 
        : [36.7538, 3.0588];

      const map = L.map(mapContainerRef.current).setView(defaultCenter, 13);
      
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Add marker if value exists
      if (value) {
        const marker = L.marker([value.lat, value.lng], { draggable: !disabled })
          .addTo(map);
        
        marker.on("dragend", () => {
          const { lat, lng } = marker.getLatLng();
          onChange({ lat, lng });
        });
        
        markerRef.current = marker;
      }

      // Handle map click
      map.on("click", (e: any) => {
        if (disabled) return;
        const { lat, lng } = e.latlng;
        
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const marker = L.marker([lat, lng], { draggable: !disabled }).addTo(map);
          marker.on("dragend", () => {
            const { lat: newLat, lng: newLng } = marker.getLatLng();
            onChange({ lat: newLat, lng: newLng });
          });
          markerRef.current = marker;
        }
        
        onChange({ lat, lng });
      });

      mapRef.current = map;
      setLoading(false);
    };

    loadMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker when value changes externally
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !value) return;
    markerRef.current.setLatLng([value.lat, value.lng]);
    mapRef.current.setView([value.lat, value.lng], mapRef.current.getZoom());
  }, [value]);

  // Geocode address
  const handleGeocode = async () => {
    if (!searchAddress.trim()) return;
    
    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
        
        if (markerRef.current) {
          markerRef.current.setLatLng([coords.lat, coords.lng]);
        } else if (mapRef.current) {
          const marker = mapRef.current;
          // Create marker...
        }
        
        mapRef.current?.setView([coords.lat, coords.lng], 15);
        onChange(coords);
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    } finally {
      setGeocoding(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        if (markerRef.current) {
          markerRef.current.setLatLng([coords.lat, coords.lng]);
        }
        mapRef.current?.setView([coords.lat, coords.lng], 15);
        onChange(coords);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please check your browser permissions.");
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Search address..."
            className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
            onKeyDown={(e) => e.key === "Enter" && handleGeocode()}
          />
          {geocoding && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-500" />
          )}
        </div>
        <button
          type="button"
          onClick={handleGeocode}
          disabled={geocoding}
          className="px-3 py-2 rounded-lg text-sm bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all"
        >
          Search
        </button>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
          title="Use my current location"
        >
          <Crosshair size={16} />
        </button>
      </div>

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="w-full h-80 rounded-xl overflow-hidden border border-white/10 bg-slate-900"
        style={{ minHeight: "320px" }}
      >
        {loading && (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}
      </div>

      {/* Coordinates display */}
      {value && (
        <div className="flex items-center gap-4 p-2 rounded-lg bg-white/5 border border-white/5">
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-amber-400" />
            <span className="text-[11px] font-mono text-slate-400">
              Lat: {value.lat.toFixed(6)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-amber-400" />
            <span className="text-[11px] font-mono text-slate-400">
              Lng: {value.lng.toFixed(6)}
            </span>
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-600">
        Click on the map to set delivery location. Drag marker to adjust.
      </p>
    </div>
  );
}