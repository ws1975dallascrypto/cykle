interface MapEmbedProps {
  originLat?: number;
  originLng?: number;
  destLat: number;
  destLng: number;
  label?: string;
}

/**
 * Renders a Google Maps directions iframe.
 * Uses the public embed URL which works without an API key for display purposes.
 * For production, replace with Google Maps JS SDK + your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 */
export function MapEmbed({ originLat, originLng, destLat, destLng, label }: MapEmbedProps) {
  const origin =
    originLat && originLng
      ? `${originLat},${originLng}`
      : 'My+Location';

  const destination = `${destLat},${destLng}`;
  const mapsUrl = `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? 'YOUR_KEY'}&origin=${origin}&destination=${destination}&mode=driving&language=en`;

  // Fallback: static map image via open-streetmap tile when no API key
  const fallbackUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${destLng - 0.01}%2C${destLat - 0.01}%2C${destLng + 0.01}%2C${destLat + 0.01}&layer=mapnik&marker=${destLat}%2C${destLng}`;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-800">
      <iframe
        src={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? mapsUrl : fallbackUrl}
        width="100%"
        height="220"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full"
        title={label ?? 'Destination map'}
      />
      {label && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent px-4 py-3">
          <p className="text-sm font-semibold text-white truncate">{label}</p>
        </div>
      )}
    </div>
  );
}
