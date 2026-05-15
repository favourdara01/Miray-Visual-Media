import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapView({ data }) {
  return (
    <MapContainer
      center={[9.082, 8.6753]} // Nigeria center
      zoom={5}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Example marker */}
      <Marker position={[6.5244, 3.3792]}>
        <Popup>Lagos</Popup>
      </Marker>
    </MapContainer>
  );
}