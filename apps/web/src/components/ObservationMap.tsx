import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Observation = {
    id: string;
    location: string;
    commonName: string | null;
    scientificName: string | null;
    group: string | null;
    description: string | null;
    status: 'pending' | 'processed' | 'failed';
    imageUrl: string;
    username: string;
    createdAt: string;
};

const parseLocation = (locationString: string): { lat: number; lng: number } => {
    const geoJson = JSON.parse(locationString);
    const [lng, lat] = geoJson.coordinates;
    return { lat, lng };
};

const getTitle = (observation: Observation): string => {
    const name = observation.commonName || observation.scientificName;

    if (observation.status === "failed") {
        return "Error técnico al procesar la observación";
    }

    if (observation.status === "pending") {
        return name ? `En revisión: ${name}` : "En revisión";
    }

    if (observation.status === "processed" && !name) {
        return "Procesado: no se pudo identificar";
    }

    return name || "Observación sin nombre";
};

const ObservationMap = () => {
    const [observations, setObservations] = useState<Observation[]>([]);

    useEffect(() => {
        const fetchObservations = async () => {
            try {
                const response = await fetch("http://localhost:3000/observations");
                if (!response.ok) {
                    throw new Error("Failed to load observations");
                }
                const data: Observation[] = await response.json();
                setObservations(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchObservations();
    }, []);

    return (
        <MapContainer center={[-34.6037, -58.3816]} zoom={13} style={{ height: "500px", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {observations.map((observation) => {
                const { lat, lng } = parseLocation(observation.location);
                return (
                    <Marker key={observation.id} position={[lat, lng]}>
                        <Popup>
                            <div>
                                <h3>{getTitle(observation)}</h3>
                                <p>{observation.username}</p>
                                <img src={observation.imageUrl} alt={observation.commonName || observation.scientificName || "Observation"} />
                                <p>{new Date(observation.createdAt).toLocaleDateString()}</p>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default ObservationMap;


