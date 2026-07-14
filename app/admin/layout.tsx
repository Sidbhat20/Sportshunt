import { AdminLayout } from '@/components/layouts/admin-layout';

export default function AdminSection({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
