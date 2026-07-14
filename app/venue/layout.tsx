import { VenueLayout } from '@/components/layouts/venue-layout';

export default function VenueSection({ children }: { children: React.ReactNode }) {
  return <VenueLayout>{children}</VenueLayout>;
}
