import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Only allow admin email to access
  if (!session || session.user?.email !== 'niyateshaukkalyan@gmail.com') {
    redirect('/');
  }

  return <>{children}</>;
}