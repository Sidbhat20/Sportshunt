export function resolveGoogleMapsQuery(venue: string, mapLocation?: string) {
  const query = (mapLocation || venue).trim();
  return query;
}

export function getGoogleMapsUrl(venue: string, mapLocation?: string) {
  const query = resolveGoogleMapsQuery(venue, mapLocation);
  if (!query) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getGoogleMapsEmbedUrl(venue: string, mapLocation?: string) {
  const query = resolveGoogleMapsQuery(venue, mapLocation);
  if (!query) return '';
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}
