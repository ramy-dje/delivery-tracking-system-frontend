import { Sidebar } from '@/components/dashboard/sidebar'

export const metadata = {
  title: 'Dashboard - Mati Delivery',
  description: 'Multi-tenant delivery platform admin dashboard',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}
