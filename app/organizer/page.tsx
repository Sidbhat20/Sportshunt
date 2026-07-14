import { redirect } from 'next/navigation';
import { APP_ROUTES } from '@/lib/routes';

export default function OrganizerIndex() {
  redirect(APP_ROUTES.organizerDashboard);
}
