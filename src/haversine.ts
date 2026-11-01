export const EARTH_RADIUS_METERS = 6371000;

export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Great-circle distance in meters using the Haversine formula.
 * Matches the reference formula exactly:
 *   h = sin^2(dPhi/2) + cos(phiA) * cos(phiB) * sin^2(dLambda/2)
 *   d = 2 * R * asin(sqrt(h))
 *
 * The `value * Math.PI / 180` order is intentional. Using a precomputed
 * `Math.PI / 180` factor changes the last bit of some distances.
 */
export function haversineMeters(a: Coordinates, b: Coordinates): number {
  const phiA = (a.lat * Math.PI) / 180;
  const phiB = (b.lat * Math.PI) / 180;
  const dPhi = ((b.lat - a.lat) * Math.PI) / 180;
  const dLambda = ((b.lon - a.lon) * Math.PI) / 180;

  const h =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phiA) * Math.cos(phiB) * Math.sin(dLambda / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}
