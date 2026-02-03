import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icon in Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

const MapAutoCenter = ({ position }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);
  return null;
};

export const MapPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    // Attempt auto-location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(newPos);
        },
        (error) => {
          console.log("Geolocation error:", error);
        },
      );
    }
  }, []);

  useEffect(() => {
    if (position) {
      onLocationSelect(position);
    }
  }, [position, onLocationSelect]);

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
      <MapContainer
        center={[48.8566, 2.3522]} // Default center before geo
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapAutoCenter position={position} />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>

      {!position && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/5 z-[400]">
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
            Localisation en cours ou cliquez...
          </div>
        </div>
      )}
    </div>
  );
};
