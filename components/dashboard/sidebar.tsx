'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Shield,
  Building2,
  MapPin,
  Users,
  Briefcase,
  Truck,
  Package,
  Eye,
  Car,
  Route,
  History,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Admin',
    icon: Shield,
    href: '/dashboard/admin',
  },
  {
    label: 'Company',
    icon: Building2,
    href: '/dashboard/company',
  },
  {
    label: 'Branch',
    icon: MapPin,
    href: '/dashboard/branch',
  },
  {
    label: 'Manager',
    icon: Briefcase,
    href: '/dashboard/manager',
  },
  {
    label: 'Supervisor',
    icon: Eye,
    href: '/dashboard/supervisor',
  },
  {
    label: 'Freelancer',
    icon: Users,
    href: '/dashboard/freelancer',
  },
  {
    label: 'Deliverer',
    icon: Truck,
    href: '/dashboard/deliverer',
  },
  {
    label: 'Transporter',
    icon: Car,
    href: '/dashboard/transporter',
  },
  {
    label: 'Vehicle',
    icon: Car,
    href: '/dashboard/vehicle',
  },
  {
    label: 'Route',
    icon: Route,
    href: '/dashboard/route',
  },
  {
    label: 'Package',
    icon: Package,
    href: '/dashboard/package',
  },
  {
    label: 'Package History',
    icon: History,
    href: '/dashboard/package-history',
  },
  {
    label: 'Client',
    icon: Users,
    href: '/dashboard/client',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-border p-6">
          <h1 className="text-xl font-bold text-primary">Mati Delivery</h1>
          <p className="mt-1 text-xs text-muted-foreground">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-2">
            {routes.map((route) => {
              const Icon = route.icon
              const isActive = pathname === route.href || pathname.startsWith(route.href + '/')
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {route.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Admin User</p>
            <p>admin@matidelivery.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
