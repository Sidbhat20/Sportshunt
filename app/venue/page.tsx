import { redirect } from 'next/navigation';
import { APP_ROUTES } from '@/lib/routes';

export default function VenueIndex() {
  redirect(APP_ROUTES.venueDashboard);
}
