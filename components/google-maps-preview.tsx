import { cn } from '@/lib/utils';
import { getGoogleMapsEmbedUrl, getGoogleMapsUrl } from '@/lib/google-maps';

export function GoogleMapsPreview({
  venue,
  mapLocation,
  title = 'Venue map preview',
  showExternalLink = false,
  heightClassName = 'h-64',
}: {
  venue: string;
  mapLocation?: string;
  title?: string;
  showExternalLink?: boolean;
  heightClassName?: string;
}) {
  const embedUrl = getGoogleMapsEmbedUrl(venue, mapLocation);
  const mapsUrl = getGoogleMapsUrl(venue, mapLocation);

  if (!embedUrl) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-canvas p-4 text-sm text-muted">
        Add a venue or Google Maps search text to preview the location here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-line bg-canvas">
        <iframe
          title={title}
          src={embedUrl}
          className={cn('w-full border-0', heightClassName)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      {showExternalLink ? (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          Open in Google Maps <span aria-hidden>↗</span>
        </a>
      ) : null}
    </div>
  );
}
