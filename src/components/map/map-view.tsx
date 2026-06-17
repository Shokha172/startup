"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  latitude?: string;
  longitude?: string;
}

// Helper: Calculate area of a polygon in Hectares using flat Mercator-like projection
function calculatePolygonAreaHectares(latlngs: L.LatLng[]): number {
  if (latlngs.length < 3) return 0;
  let area = 0; 
  const numPoints = latlngs.length;
  const R = 6378137; // Earth radius in meters
  
  for (let i = 0; i < numPoints; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % numPoints];
    
    const lat1 = p1.lat * Math.PI / 180;
    const lat2 = p2.lat * Math.PI / 180;
    const lon1 = p1.lng * Math.PI / 180;
    const lon2 = p2.lng * Math.PI / 180;
    
    const x1 = R * lon1 * Math.cos((lat1 + lat2) / 2);
    const y1 = R * lat1;
    const x2 = R * lon2 * Math.cos((lat1 + lat2) / 2);
    const y2 = R * lat2;
    
    area += (x1 * y2) - (x2 * y1);
  }
  
  area = Math.abs(area) / 2.0;
  return Math.round((area / 10000) * 100) / 100; // Convert to Hectares (1 Ha = 10,000 m2)
}

export default function MapView({
  center = [41.311081, 69.240562], // Tashkent center
  zoom = 11,
  interactive = true,
  latitude,
  longitude,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  // Drawing Refs
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const drawingPointsRef = useRef<L.LatLng[]>([]);
  const drawingMarkersRef = useRef<L.CircleMarker[]>([]);
  const drawingPolylineRef = useRef<L.Polyline | null>(null);
  const drawnPolygonRef = useRef<L.Polygon | null>(null);

  // Toggle drawing mode
  const startDrawing = () => {
    setIsDrawingMode(true);
    clearDrawing();
  };

  // Close loop and complete drawing
  const finishDrawing = () => {
    setIsDrawingMode(false);
    const map = mapInstanceRef.current;
    const points = drawingPointsRef.current;

    // Clear temp drawing shapes
    drawingMarkersRef.current.forEach(m => m.remove());
    drawingMarkersRef.current = [];
    if (drawingPolylineRef.current) {
      drawingPolylineRef.current.remove();
      drawingPolylineRef.current = null;
    }

    if (!map || points.length < 3) {
      alert("Maydon chizish uchun kamida 3 ta nuqtani belgilang!");
      return;
    }

    const area = calculatePolygonAreaHectares(points);

    // Draw the permanent polygon
    drawnPolygonRef.current = L.polygon(points, {
      color: "#06b6d4",
      fillColor: "#06b6d4",
      fillOpacity: 0.35,
      weight: 2.5
    }).addTo(map);

    drawnPolygonRef.current
      .bindPopup(`<b>Sizning chizgan maydoningiz</b><br/>Maydoni: <b>${area} Ha</b><br/>Suv talabi optimal hisoblanmoqda.`)
      .openPopup();

    // Pan viewport to fit the bounding box
    map.fitBounds(drawnPolygonRef.current.getBounds());

    // Dispatch the result to the dashboard form state
    const firstPoint = points[0];
    const fieldDrawnEvent = new CustomEvent("field-drawn", {
      detail: {
        areaHectares: area.toString(),
        lat: firstPoint.lat.toFixed(6),
        lng: firstPoint.lng.toFixed(6)
      }
    });
    window.dispatchEvent(fieldDrawnEvent);
  };

  // Reset drawing states
  const clearDrawing = () => {
    // Clear temp drawing shapes
    drawingMarkersRef.current.forEach(m => m.remove());
    drawingMarkersRef.current = [];
    if (drawingPolylineRef.current) {
      drawingPolylineRef.current.remove();
      drawingPolylineRef.current = null;
    }

    // Clear drawn polygon
    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.remove();
      drawnPolygonRef.current = null;
    }
    drawingPointsRef.current = [];
  };

  // First useEffect: Initialize the Leaflet map container and layers (runs once)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Standard Leaflet marker icon fix
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    // Determine initial center
    let initialCenter: [number, number] = center;
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        initialCenter = [lat, lng];
      }
    }

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom,
      zoomControl: interactive,
      dragging: interactive,
      doubleClickZoom: interactive,
      scrollWheelZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
    });

    mapInstanceRef.current = map;

    // Choose dark mode or light mode tiles based on document class
    const isDark = document.documentElement.classList.contains("dark");
    const tileUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 20,
    }).addTo(map);

    // Add mock polygon agricultural fields
    const cottonFieldCoordinates: [number, number][] = [
      [41.325, 69.245],
      [41.332, 69.252],
      [41.328, 69.260],
      [41.320, 69.255],
    ];

    const wheatFieldCoordinates: [number, number][] = [
      [41.300, 69.210],
      [41.308, 69.218],
      [41.305, 69.228],
      [41.295, 69.222],
    ];

    // Cotton field - Cyan highlight
    const cottonPolygon = L.polygon(cottonFieldCoordinates, {
      color: "#06b6d4",
      fillColor: "#06b6d4",
      fillOpacity: 0.35,
      weight: 2,
    }).addTo(map);
    cottonPolygon.bindPopup("<b>Ekin Turi:</b> G'o'za (Paxta)<br/><b>Maydoni:</b> 12 Hektar<br/><b>Suv holati:</b> Me'yorda");

    // Wheat field - Emerald highlight
    const wheatPolygon = L.polygon(wheatFieldCoordinates, {
      color: "#10b981",
      fillColor: "#10b981",
      fillOpacity: 0.35,
      weight: 2,
    }).addTo(map);
    wheatPolygon.bindPopup("<b>Ekin Turi:</b> Kuzgi Bug'doy<br/><b>Maydoni:</b> 8.5 Hektar<br/><b>Suv holati:</b> Sug'orish Tavsiya Etiladi");

    // Add marker for Farm Headquarters
    const farmHQ = L.marker([41.315, 69.235]).addTo(map);
    farmHQ.bindPopup("<b>AquaMind Farm HQ</b><br/>Markaziy monitoring stansiyasi");

    // Coordinate listener
    if (interactive) {
      map.on("click", (e) => {
        // If drawing mode is active, handle drawing point addition
        if (isDrawingMode) {
          const point = e.latlng;
          drawingPointsRef.current.push(point);

          // Add a circle marker at the vertex
          const marker = L.circleMarker(point, {
            radius: 5,
            color: "#eab308",
            fillColor: "#eab308",
            fillOpacity: 1
          }).addTo(map);
          drawingMarkersRef.current.push(marker);

          // Update connecting line
          if (drawingPolylineRef.current) {
            drawingPolylineRef.current.setLatLngs(drawingPointsRef.current);
          } else {
            drawingPolylineRef.current = L.polyline(drawingPointsRef.current, {
              color: "#eab308",
              weight: 2.5,
              dashArray: "5, 5"
            }).addTo(map);
          }
          return;
        }

        // Standard map click
        const { lat, lng } = e.latlng;
        const mapClickEvent = new CustomEvent("map-click", {
          detail: { lat: lat.toFixed(6), lng: lng.toFixed(6) }
        });
        window.dispatchEvent(mapClickEvent);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      clickMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, zoom, isDrawingMode]); 

  // Second useEffect: Synchronize Leaflet viewport and click marker with parent states
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !latitude || !longitude || isDrawingMode) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    const latlng = L.latLng(lat, lng);
    
    // Pan map to new center if distance is significant
    const currentCenter = map.getCenter();
    const diff = Math.abs(currentCenter.lat - lat) + Math.abs(currentCenter.lng - lng);
    if (diff > 0.0001) {
      map.setView(latlng, map.getZoom());
    }

    // Set or move the red coordinate selector marker
    if (clickMarkerRef.current) {
      clickMarkerRef.current.setLatLng(latlng);
    } else {
      clickMarkerRef.current = L.marker(latlng, {
        icon: L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map);
    }
    clickMarkerRef.current.bindPopup(`<b>Tanlangan joylashuv</b><br/>Koordinatalar: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  }, [latitude, longitude, isDrawingMode]);

  return (
    <div className="relative w-full h-full min-h-[350px]">
      {/* Floating Drawing Panel */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1.5 bg-[#0e1320]/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl max-w-[200px]">
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest text-center">
          Dala Chegaralari
        </span>
        <span className="text-[9px] text-slate-400 text-center leading-normal mb-1.5">
          {isDrawingMode 
            ? "Xaritada ekin maydoningiz burchaklarini bosib belgilang." 
            : "Maydoningiz chegaralarini chizib uning gektar o'lchamini oling."}
        </span>
        <div className="flex flex-col gap-1.5 w-full">
          {!isDrawingMode ? (
            <button
              onClick={startDrawing}
              className="py-1.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-white font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer w-full text-center"
            >
              Chizishni boshlash
            </button>
          ) : (
            <>
              <button
                onClick={finishDrawing}
                className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer w-full text-center"
              >
                Chizishni tugatish
              </button>
              <button
                onClick={clearDrawing}
                className="py-1.5 px-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer w-full text-center border border-red-500/30"
              >
                Bekor qilish
              </button>
            </>
          )}
        </div>
      </div>

      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-10" />
    </div>
  );
}
