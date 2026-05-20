"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { getWilayas as svcGetWilayas, getAllCommunes as svcGetCommunes } from "@/services/LocationService";

export interface MapCoords {
    latitude: number;
    longitude: number;
}

interface MapPickerProps {
    value?: MapCoords | null;
    onChange: (coords: MapCoords | null) => void;
    centerOn?: MapCoords | null;
    disabled?: boolean;
    onLocationDetected?: (data: {
        latitude: number;
        longitude: number;
        wilayaId?: string;
        communeId?: string;
    }) => void;
}

// Algeria bounds (SW, NE)
const ALGERIA_BOUNDS: [number, number][] = [
    [18.9, -8.7],
    [37.1, 11.9],
];

// cached wilayas/communes to avoid repeated requests
let cachedWilayas: any[] | null = null;
const loadWilayasOnce = async () => {
    if (cachedWilayas) return cachedWilayas;
    try {
        const w = await svcGetWilayas();
        cachedWilayas = w;
        return w;
    } catch (e) {
        cachedWilayas = [];
        return cachedWilayas;
    }
};

function ensureLeafletCss() {
    if (typeof window === "undefined") return;
    const id = "leaflet-css-deliverydz";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "";
    link.crossOrigin = "";
    document.head.appendChild(link);
}

function makeAmberIcon(L: any) {
    return L.divIcon({
        className: "",
        html: `
            <div style="
                width:32px;height:32px;
                background:linear-gradient(135deg,#fbbf24,#f59e0b);
                border-radius:50% 50% 50% 0;
                transform:rotate(-45deg);
                border:2px solid rgba(251,191,36,0.4);
                box-shadow:0 4px 14px rgba(251,191,36,0.45);
                display:flex;align-items:center;justify-content:center;
            ">
                <div style="
                    width:8px;height:8px;
                    background:#030712;
                    border-radius:50%;
                    transform:rotate(45deg);
                "></div>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });
}

function MapPickerInner({ value, onChange, centerOn, disabled, onLocationDetected }: MapPickerProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const instanceRef = useRef<{
        L?: typeof import("leaflet");
        map?: any;
        marker?: any;
        tileLayer?: any;
        altTileLayer?: any;
        ro?: ResizeObserver | null;
    }>({ L: undefined, map: undefined, marker: undefined, tileLayer: undefined, altTileLayer: undefined, ro: null });

    const [ready, setReady] = useState(false);

    const propsOnLocationDetected = onLocationDetected;

    async function detectLocationForCoords(lat: number, lng: number): Promise<{ wilayaId?: string; communeId?: string }> {
        // 1) Try backend specific reverse endpoint if available
        try {
            const url = `/api/locations/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
            const res = await fetch(url, { method: 'GET' });
            if (res.ok) {
                const json = await res.json();
                // Expecting { wilayaId?: string, communeId?: string }
                if (json?.wilayaId || json?.communeId) return { wilayaId: json.wilayaId, communeId: json.communeId };
            }
        } catch (e) {
            // ignore and fallback to nominatim
        }

        // 2) Use Nominatim reverse geocoding
        try {
            const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=10&accept-language=fr`;
            const r = await fetch(nomUrl, { method: 'GET' });
            if (r.ok) {
                const data = await r.json();
                const addr = data?.address || {};

                const candidates = await loadWilayasOnce();
                // Try direct name match against common address fields
                const addrNames = [addr.state, addr.county, addr.region, addr['ISO3166-2-lvl4'], addr['state_district']].filter(Boolean).map((s: any) => String(s).toLowerCase());
                let foundWilaya: any = null;
                for (const w of candidates) {
                    const names = [w.nameFr, w.nameAr].filter(Boolean).map((s: any) => String(s).toLowerCase());
                    const code = String(w.code || w.codeWilaya || w.numero || w.id || '').toLowerCase();
                    if (addrNames.some(a => names.includes(a) || a.includes(code) || names.some(n => n.includes(a)))) { foundWilaya = w; break; }
                }

                let wilayaId: string | undefined = foundWilaya?.id;
                let communeId: string | undefined = undefined;

                if (wilayaId) {
                    try {
                        const communes = await svcGetCommunes({ wilayaId, pageNumber: 1, pageSize: 50 });
                        const placeNames = [addr.city, addr.town, addr.village, addr.hamlet, addr.municipality, addr.suburb, addr.county].filter(Boolean).map((s: any) => String(s).toLowerCase());
                        for (const c of communes) {
                            const cnames = [c.nameFr, c.nameAr].filter(Boolean).map((s: any) => String(s).toLowerCase());
                            if (placeNames.some(p => cnames.includes(p) || cnames.some(n => n.includes(p)))) { communeId = c.id; break; }
                        }
                    } catch (e) { /* ignore */ }
                }

                // 3) If not found, fallback to nearest wilaya center if available
                if (!wilayaId) {
                    try {
                        const wlist = candidates || [];
                        let best: any = null; let bestDist = Infinity;
                        for (const w of wlist) {
                            const latw = w.latitude ?? w.lat ?? w.centerLat ?? (w.center && w.center.lat);
                            const lonw = w.longitude ?? w.lng ?? w.lon ?? w.center?.lng ?? w.center?.lon;
                            if (latw == null || lonw == null) continue;
                            const d = haversineDistance(lat, lng, Number(latw), Number(lonw));
                            if (d < bestDist) { bestDist = d; best = w; }
                        }
                        if (best) wilayaId = best.id;
                    } catch (e) { /* ignore */ }
                }

                return { wilayaId, communeId };
            }
        } catch (e) {
            // ignore nominatim errors
        }

        // Final fallback: return nearest wilaya id if possible
        try {
            const candidates = await loadWilayasOnce();
            let best: any = null; let bestDist = Infinity;
            for (const w of candidates) {
                const latw = w.latitude ?? w.lat ?? w.centerLat ?? (w.center && w.center.lat);
                const lonw = w.longitude ?? w.lng ?? w.lon ?? w.center?.lng ?? w.center?.lon;
                if (latw == null || lonw == null) continue;
                const d = haversineDistance(lat, lng, Number(latw), Number(lonw));
                if (d < bestDist) { bestDist = d; best = w; }
            }
            if (best) return { wilayaId: best.id };
        } catch (e) { }

        return {};
    }

    function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const toRad = (v: number) => v * Math.PI / 180;
        const R = 6371; // km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const initMap = useCallback(async () => {
        const container = containerRef.current;
        if (!container) return;

        ensureLeafletCss();

        const L = await import("leaflet");

        // Fix icons when bundlers relocate assets
        try {
            // remove old _getIconUrl to force default option urls
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });
        } catch (e) {
            // ignore
        }

        // Destroy any previous map on the container
        if ((container as any)._leaflet_id != null) {
            instanceRef.current.map?.remove();
            instanceRef.current.map = undefined;
            instanceRef.current.marker = undefined;
        }

        const bounds = L.latLngBounds(ALGERIA_BOUNDS as any);

        const defaultCenter: [number, number] = value
            ? [value.latitude, value.longitude]
            : [28.0339, 1.6596];

        const map = L.map(container, {
            center: defaultCenter,
            zoom: value ? 10 : 6,
            minZoom: 5,
            maxZoom: 13,
            zoomControl: false,
            attributionControl: false,
            maxBounds: bounds,
            maxBoundsViscosity: 1.0,
        });

        // Add controls
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Stable OSM tiles + attribution
        const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        const tileOpts = { attribution: "© OpenStreetMap contributors", maxZoom: 19 };

        const tileLayer = L.tileLayer(tileUrl, tileOpts).addTo(map);

        // fallback tile layer (only used on repeated errors)
        const altTileLayer = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", tileOpts);

        instanceRef.current = { L, map, marker: undefined, tileLayer, altTileLayer, ro: null };

        // handle tileerror -> attach alt layer on persistent failures
        let tileErrorCount = 0;
        tileLayer.on("tileerror", () => {
            tileErrorCount += 1;
            if (tileErrorCount > 5 && instanceRef.current && !instanceRef.current.altTileLayer._map) {
                try {
                    instanceRef.current.altTileLayer.addTo(map);
                } catch (e) {
                    // ignore
                }
            }
        });

        // Add marker if value provided
        const amberIcon = makeAmberIcon(L as any);
        if (value) {
            const m = L.marker([value.latitude, value.longitude], { icon: amberIcon, draggable: !disabled }).addTo(map);
            m.on("dragend", () => {
                const { lat, lng } = m.getLatLng();
                const latlng = L.latLng(lat, lng);
                if (!bounds.contains(latlng)) {
                    // clamp back into bounds
                    const clamped = bounds.getCenter();
                    m.setLatLng(clamped);
                    onChange({ latitude: +clamped.lat.toFixed(6), longitude: +clamped.lng.toFixed(6) });
                    return;
                }
                onChange({ latitude: +lat.toFixed(6), longitude: +lng.toFixed(6) });
                // detect location after drag
                detectLocationForCoords(+lat, +lng).then((detected) => {
                    if (propsOnLocationDetected) propsOnLocationDetected({ latitude: +lat, longitude: +lng, ...detected });
                }).catch(() => { });
            });
            instanceRef.current.marker = m;
        }

        // Click to drop marker (only when not disabled)
        if (!disabled) {
            map.on("click", (e: any) => {
                const lat = +e.latlng.lat;
                const lng = +e.latlng.lng;
                const latlng = L.latLng(lat, lng);
                if (!bounds.contains(latlng)) return; // ignore clicks outside Algeria

                if (instanceRef.current?.marker) {
                    instanceRef.current.marker.setLatLng(latlng);
                } else {
                    const m = L.marker(latlng, { icon: amberIcon, draggable: true }).addTo(map);
                    m.on("dragend", async () => {
                        const { lat: dlat, lng: dlng } = m.getLatLng();
                        const latlng2 = L.latLng(dlat, dlng);
                        if (!bounds.contains(latlng2)) return;
                        onChange({ latitude: +dlat.toFixed(6), longitude: +dlng.toFixed(6) });
                        // detect location
                        try {
                            const detected = await detectLocationForCoords(+dlat, +dlng);
                            if (propsOnLocationDetected) propsOnLocationDetected({ latitude: +dlat, longitude: +dlng, ...detected });
                        } catch (err) {
                            // ignore detection errors
                        }
                    });
                    instanceRef.current!.marker = m;
                }
                onChange({ latitude: +lat.toFixed(6), longitude: +lng.toFixed(6) });
                // async detect
                detectLocationForCoords(lat, lng).then((detected) => {
                    if (propsOnLocationDetected) propsOnLocationDetected({ latitude: lat, longitude: lng, ...detected });
                }).catch(() => { });
            });
        }

        // Disable interaction when disabled
        const setInteraction = (isDisabled: boolean) => {
            if (!map) return;
            if (isDisabled) {
                map.dragging.disable();
                map.touchZoom.disable();
                map.doubleClickZoom.disable();
                map.scrollWheelZoom.disable();
                map.boxZoom.disable();
                map.keyboard.disable();
            } else {
                map.dragging.enable();
                map.touchZoom.enable();
                map.doubleClickZoom.enable();
                map.scrollWheelZoom.enable();
                map.boxZoom.enable();
                map.keyboard.enable();
            }
        };

        setInteraction(Boolean(disabled));

        // Ensure map shows correctly inside modals/layouts
        const tryInvalidate = () => {
            if (!map) return;
            try {
                // ensure container exists and Leaflet methods are available
                if (!map.invalidateSize || !map.getContainer) return;
                const containerEl = map.getContainer();
                if (!containerEl || !document.body.contains(containerEl)) return;
                map.invalidateSize();
                requestAnimationFrame(() => {
                    try { map.invalidateSize(); } catch (e) { /* ignore */ }
                });
                setTimeout(() => { try { map.invalidateSize(); } catch (e) { /* ignore */ } }, 200);
            } catch (err) {
                // swallow Leaflet internal errors (e.g., _leaflet_pos missing)
            }
        };

        map.whenReady(() => {
            tryInvalidate();
            setReady(true);
        });

        // ResizeObserver to handle container size changes (modals, split panes)
        try {
            const ro = new ResizeObserver(() => {
                tryInvalidate();
            });
            ro.observe(container);
            instanceRef.current.ro = ro;
        } catch (e) {
            // ResizeObserver not available -> fallback
            window.addEventListener("resize", tryInvalidate);
            instanceRef.current.ro = null;
        }
    }, [value, disabled, onChange]);

    useEffect(() => {
        let mounted = true;
        initMap().catch(() => {
            /* ignore init errors */
        });
        return () => {
            mounted = false;
            const inst = instanceRef.current;
            try {
                inst?.ro && inst.ro.disconnect?.();
            } catch (e) {
                // ignore
            }
            try {
                inst?.map?.remove();
            } catch (e) {
                // ignore
            }
            instanceRef.current = { L: undefined, map: undefined, marker: undefined, tileLayer: undefined, altTileLayer: undefined, ro: null };
            setReady(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-center on external `centerOn` changes
    useEffect(() => {
        const inst = instanceRef.current;
        if (!inst?.map || !centerOn) return;
        try {
            inst.map.flyTo([centerOn.latitude, centerOn.longitude], 9, { duration: 1.0 });
        } catch (e) {
            // ignore
        }
    }, [centerOn]);

    // Sync `value` prop to marker
    useEffect(() => {
        const inst = instanceRef.current;
        if (!inst?.map) return;

        const L = inst.L; if (!L) return;
        const bounds = L.latLngBounds(ALGERIA_BOUNDS as any);

        if (!value) {
            inst.marker?.remove();
            inst.marker = undefined;
            return;
        }

        const pos = L.latLng(value.latitude, value.longitude);
        if (!bounds.contains(pos)) {
            // If external value out of bounds, ignore or clamp to center
            return;
        }

        if (inst.marker) {
            inst.marker.setLatLng(pos);
        } else {
            const m = L.marker(pos, { icon: makeAmberIcon(L), draggable: !disabled }).addTo(inst.map);
            m.on("dragend", () => {
                const { lat, lng } = m.getLatLng();
                const latlng = L.latLng(lat, lng);
                if (!bounds.contains(latlng)) return;
                onChange({ latitude: +lat.toFixed(6), longitude: +lng.toFixed(6) });
                detectLocationForCoords(+lat, +lng).then((detected) => {
                    if (propsOnLocationDetected) propsOnLocationDetected({ latitude: +lat, longitude: +lng, ...detected });
                }).catch(() => { });
            });
            inst.marker = m;
        }
    }, [value?.latitude, value?.longitude, disabled, onChange]);

    // React to disabled prop changes
    useEffect(() => {
        const inst = instanceRef.current;
        if (!inst?.map) return;
        try {
            if (disabled) inst.map.dragging.disable(); else inst.map.dragging.enable();
        } catch (e) {
            // ignore
        }
    }, [disabled]);

    return (
        <div className="relative">
            <div
                ref={containerRef}
                style={{ height: 280, width: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
            />

            {!ready && (
                <div className="absolute inset-0 rounded-xl flex items-center justify-center"
                    style={{ background: "#0a0f18" }}>
                    <svg className="animate-spin text-amber-500" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                            strokeDasharray="60" strokeDashoffset="20" />
                    </svg>
                </div>
            )}

            {ready && !value && !disabled && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 pointer-events-none select-none"
                    style={{
                        background: "rgba(6,10,16,0.82)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backdropFilter: "blur(4px)",
                        whiteSpace: "nowrap",
                    }}>
                    Click on the map to pin the location
                </div>
            )}

            {value && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono pointer-events-none"
                    style={{
                        background: "rgba(6,10,16,0.85)",
                        border: "1px solid rgba(251,191,36,0.2)",
                        color: "#fbbf24",
                        backdropFilter: "blur(4px)",
                    }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                            fill="currentColor" />
                    </svg>
                    {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
                </div>
            )}

            {value && !disabled && (
                <button
                    type="button"
                    onClick={() => {
                        const inst = instanceRef.current;
                        inst?.marker?.remove();
                        if (inst) inst.marker = undefined;
                        onChange(null);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white transition-all"
                    style={{
                        background: "rgba(6,10,16,0.82)",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    title="Clear pin"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </div>
    );
}

const MapPickerDynamic = dynamic(() => Promise.resolve(MapPickerInner), {
    ssr: false,
    loading: () => (
        <div className="rounded-xl flex items-center justify-center"
            style={{ height: 280, background: "#0a0f18", border: "1px solid rgba(255,255,255,0.06)" }}>
            <svg className="animate-spin text-amber-500/50" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                    strokeDasharray="60" strokeDashoffset="20" />
            </svg>
        </div>
    ),
});

export default function MapPicker(props: MapPickerProps) {
    return <MapPickerDynamic {...props} />;
}