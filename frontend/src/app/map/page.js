'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useSearchParams } from 'next/navigation';

mapboxgl.accessToken = 'pk.eyJ1IjoidHVydGxlY2FwMTMyNCIsImEiOiJjbGVrOWtjbTIwYXE5M29sbXVkMWVhZ2VrIn0.Qs3AOKYORGe4_gK84G9FhQ';

export default function Map() {
  const mapContainerRef = useRef(null);
  const [coordinates, setCoordinates] = useState(null);

  const searchParams = useSearchParams();
  const routeId = searchParams.get('id') || '2'; // fallback to 1 if not present

  useEffect(() => {
    fetch(`http://localhost:4000/hidden/coords/${routeId}`)
      .then((response) => response.json())
      .then((data) => {
        const coords = data.map((coord) => [coord.longitude, coord.latitude]);
        setCoordinates(coords);
      })
      .catch((error) => {
        console.error('Error fetching coordinates:', error);
      });
  }, [routeId]);

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: coordinates[0],
      zoom: 15,
    });

    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        },
      });

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ff7e5f',
          'line-width': 4,
        },
      });

      const bounds = coordinates.reduce(
        (b, coord) => b.extend(coord),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );
      map.fitBounds(bounds, { padding: 40 });
    });

    return () => map.remove();
  }, [coordinates]);

  return <div ref={mapContainerRef} className="w-full h-[500px]" />;
}
