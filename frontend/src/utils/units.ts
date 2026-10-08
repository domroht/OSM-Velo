export type DistanceUnit = "metric" | "imperial";

export function formatDistance(meters: number, units: DistanceUnit): string {
  if (units === "metric") return `${(meters / 1000).toFixed(1)} km`;
  return `${(meters / 1609.344).toFixed(1)} mi`;
}