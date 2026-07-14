import { OrganizerLayout } from '@/components/layouts/organizer-layout';

export default function OrganizerSection({ children }: { children: React.ReactNode }) {
  return <OrganizerLayout>{children}</OrganizerLayout>;
}
