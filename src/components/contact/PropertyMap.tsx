'use client';

import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl, useMap } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Building2, LayoutGrid, Bath, Car, ExternalLink, PanelLeftClose, PanelRightOpen } from 'lucide-react';
import type { Property } from '@/types/property';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();

const DEFAULT_VIEW = {
  latitude: 52.5200, // Berlin default if none provided
  longitude: 13.4050,
  zoom: 12,
  pitch: 45,
  bearing: 0,
};

interface PlacedProperty {
  property: Property;
  lng: number;
  lat: number;
}

function markerColor(property: Property): string {
  switch (property.status) {
    case 'For Sale': return '#d4e542'; // brand lime (primary)
    case 'For Rent': return '#d4e542'; 
    case 'Rented': return '#10B981';  
    case 'Sold': return '#71717A';   
    default: return '#71717A';
  }
}

function FitBounds({ placed }: { placed: PlacedProperty[] }) {
  const mapCollection = useMap();
  useEffect(() => {
    const mapRef = mapCollection?.current ?? (mapCollection as any)?.getMap?.();
    const map = typeof mapRef?.getMap === 'function' ? mapRef.getMap() : mapRef;
    if (!map?.fitBounds || placed.length === 0) return;
    const bounds = placed.reduce(
      (acc, { lng, lat }) => {
        acc[0] = Math.min(acc[0], lng);
        acc[1] = Math.min(acc[1], lat);
        acc[2] = Math.max(acc[2], lng);
        acc[3] = Math.max(acc[3], lat);
        return acc;
      },
      [Infinity, Infinity, -Infinity, -Infinity]
    );
    if (bounds[0] === Infinity) return;
    
    if (placed.length === 1) {
        map.flyTo({
            center: [placed[0].lng, placed[0].lat],
            zoom: 14,
            duration: 1000
        });
    } else {
        map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], {
            padding: 60,
            maxZoom: 14,
            duration: 1000,
        });
    }
  }, [mapCollection, placed]);
  return null;
}

interface PropertyMapProps {
  properties: Property[];
  isDarkMode?: boolean;
  onSelectProperty?: (propertyId: string) => void;
  selectedPropertyId?: string | null;
  t?: any; // Translation function
}

const PLOTS_SOURCE_ID = 'property-plots';
const PLOTS_LAYER_ID = 'property-plots-circle';

const MAP_STYLE_DARK = 'mapbox://styles/mapbox/dark-v11';
const MAP_STYLE_LIGHT = 'mapbox://styles/mapbox/light-v11';

export default function PropertyMap({ properties, isDarkMode = false, onSelectProperty, selectedPropertyId, t }: PropertyMapProps) {
  const mapStyleUrl = isDarkMode ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;
  const [placed, setPlaced] = useState<PlacedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [tilesLoading, setTilesLoading] = useState(true);
  const [popupProperty, setPopupProperty] = useState<PlacedProperty | null>(null);
  const [viewState, setViewState] = useState(DEFAULT_VIEW);
  const [livePortfolioOpen, setLivePortfolioOpen] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onMapLoad = (evt: any) => {
    const map = evt.target;
    mapRef.current = map;
    if (typeof map.resize === 'function') map.resize();
    map.once('idle', () => setTilesLoading(false));
    
    if (!map.getSource(PLOTS_SOURCE_ID)) {
      map.addSource(PLOTS_SOURCE_ID, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }
    if (!map.getLayer(PLOTS_LAYER_ID)) {
      map.addLayer({
        id: PLOTS_LAYER_ID,
        type: 'circle',
        source: PLOTS_SOURCE_ID,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 14, 14, 18, 28],
          'circle-color': 'rgba(212, 229, 66, 0.35)', // Brand lime with opacity
          'circle-stroke-width': 2,
          'circle-stroke-color': '#d4e542',
        },
      });
    }
    
    if (!map.getLayer('building-3d')) {
      try {
        map.addLayer({
          id: 'building-3d',
          type: 'fill-extrusion',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          minzoom: 15,
          paint: {
            'fill-extrusion-color': isDarkMode ? '#2a2a2a' : '#ddd',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.85,
          },
        });
      } catch (e) {
        console.warn('Map style does not support building 3D layer', e);
      }
    }
  };

  useEffect(() => {
    // For this refactor, we expect lat/lng to be present in properties
    const next: PlacedProperty[] = [];
    properties.forEach((p) => {
        if (p.lat != null && p.lng != null) {
            next.push({ property: p, lat: p.lat, lng: p.lng });
        }
    });
    setPlaced(next);
    setLoading(false);
  }, [properties]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getSource(PLOTS_SOURCE_ID) || placed.length === 0) return;
    const geojson = {
      type: 'FeatureCollection' as const,
      features: placed.map(({ lng, lat }) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [lng, lat] },
        properties: {},
      })),
    };
    map.getSource(PLOTS_SOURCE_ID).setData(geojson);
  }, [placed]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full min-h-[400px] bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-6 text-center"> 
        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
          <MapPin className="text-zinc-500" size={32} />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Mapbox Token Required</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mb-4">
          Please set NEXT_PUBLIC_MAPBOX_TOKEN in your environment variables.
        </p>
      </div>
    );
  }

  const mapStyle = size.width > 0 && size.height > 0
    ? { width: size.width, height: size.height }
    : { width: '100%', height: '100%' };

  return (
    <div ref={containerRef} className="property-map-root relative w-full h-full min-h-[400px] overflow-hidden bg-gray-100 dark:bg-zinc-900">
      {tilesLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-lg bg-white/95 dark:bg-zinc-900/95 border border-gray-200 dark:border-zinc-700 shadow-xl flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-gray-700 dark:text-zinc-300">Loading Map...</span>
        </div>
      )}
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={onMapLoad}
        style={mapStyle}
        mapStyle={mapStyleUrl}
        mapboxAccessToken={MAPBOX_TOKEN}
        maxPitch={85}
      >
        {placed.length > 0 && <FitBounds placed={placed} />}

        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <ScaleControl />
        <GeolocateControl position="top-right" />

        {placed.map(({ property, lng, lat }) => (
          <Marker
            key={property.id}
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupProperty({ property, lng, lat });
              onSelectProperty?.(property.id);
              mapRef.current?.flyTo?.({
                center: [lng, lat],
                zoom: 16,
                pitch: 45,
                duration: 800,
              });
            }}
          >
            <div className="cursor-pointer transition-transform hover:scale-110 flex flex-col items-center">
              <div
                className="w-px shrink-0"
                style={{
                  height: 12,
                  background: 'linear-gradient(to bottom, rgba(212, 229, 66, 0.6), rgba(212, 229, 66, 0.05))',
                  boxShadow: '0 0 8px rgba(212, 229, 66, 0.4)',
                }}
              />
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: markerColor(property),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -1,
                  boxShadow: `0 0 0 4px rgba(212, 229, 66, 0.35), 0 0 20px ${markerColor(property)}, 0 2px 8px rgba(0,0,0,0.4)`,
                }}
              >
                <Building2 size={16} className="text-black" />
              </div>
            </div>
          </Marker>
        ))}

        {popupProperty && (
          <Popup
            longitude={popupProperty.lng}
            latitude={popupProperty.lat}
            onClose={() => setPopupProperty(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
            className="property-map-popup z-20"
          >
            <div className="w-64 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800">
              <div className="aspect-video bg-gray-100 dark:bg-zinc-800 relative">
                <img
                  src={popupProperty.property.mainImage}
                  alt={popupProperty.property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{popupProperty.property.title}</h4>
                <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                  {popupProperty.property.address}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1"><LayoutGrid size={12} /> {popupProperty.property.rooms ?? '—'} R</span>
                  <span className="flex items-center gap-1"><Bath size={12} /> {popupProperty.property.bathrooms ?? '—'} B</span>
                  <span className="flex items-center gap-1"><Car size={12} /> {popupProperty.property.garage ?? '—'} G</span>
                </div>
                {onSelectProperty && (
                  <button
                    type="button"
                    onClick={() => onSelectProperty(popupProperty.property.id)}
                    className="mt-3 w-full py-2 bg-primary text-black font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-colors"
                  >
                    <ExternalLink size={14} />
                    View Details
                  </button>
                )}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Live Portfolio panel toggle */}
      {livePortfolioOpen ? (
        <div className="absolute top-4 left-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-2 border-primary/40 p-4 rounded-xl z-10 shadow-xl shadow-black/10 max-w-[280px]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: '0 0 8px #d4e542' }} />
              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Live Portfolio</span>
            </div>
            <button
              type="button"
              onClick={() => setLivePortfolioOpen(false)}
              className="p-1 rounded-md text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Property Location</h4>
          <p className="text-[10px] text-gray-500 dark:text-zinc-400 mb-3 uppercase tracking-tighter">
            Tracking {placed.length} Assets
          </p>
          
          <div className="pt-3 border-t border-gray-200 dark:border-zinc-700 max-h-[240px] overflow-y-auto space-y-1">
            {placed.map(({ property, lng, lat }) => (
              <button
                key={property.id}
                type="button"
                onClick={() => {
                  mapRef.current?.flyTo?.({ center: [lng, lat], zoom: 16, pitch: 45, duration: 800 });
                  setPopupProperty(null);
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-zinc-900 dark:text-white hover:bg-primary/20 truncate border border-transparent hover:border-primary/40 transition-colors font-medium"
              >
                {property.title}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setLivePortfolioOpen(true)}
          className="absolute top-4 left-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-2 border-primary/40 px-3 py-2 rounded-xl z-10 shadow-xl shadow-black/10 flex items-center gap-2 hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: '0 0 8px #d4e542' }} />
          <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Live Portfolio</span>
          <PanelRightOpen size={18} className="text-gray-500 dark:text-zinc-400" />
        </button>
      )}
    </div>
  );
}
