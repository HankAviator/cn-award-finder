import type { Airport } from "@/data/airports";

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function getDistanceKm(
  originAirport: Airport,
  destinationAirport: Airport,
): number {
  const lat1 = toRadians(originAirport.latitude);
  const lat2 = toRadians(destinationAirport.latitude);
  const deltaLat = toRadians(destinationAirport.latitude - originAirport.latitude);
  const deltaLon = toRadians(destinationAirport.longitude - originAirport.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}
