import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const modules = [
    {
      title: 'Admin Management',
      description: 'Manage admin users and permissions',
      href: '/dashboard/admin',
      count: 3,
    },
    {
      title: 'Company Management',
      description: 'Manage delivery companies',
      href: '/dashboard/company',
      count: 12,
    },
    {
      title: 'Branch Management',
      description: 'Manage company branches',
      href: '/dashboard/branch',
      count: 45,
    },
    {
      title: 'Manager Management',
      description: 'Manage company owners',
      href: '/dashboard/manager',
      count: 18,
    },
    {
      title: 'Freelancer Management',
      description: 'Manage independent contractors',
      href: '/dashboard/freelancer',
      count: 156,
    },
    {
      title: 'Deliverer Management',
      description: 'Manage delivery staff',
      href: '/dashboard/deliverer',
      count: 342,
    },
    {
      title: 'Client Management',
      description: 'Manage delivery customers',
      href: '/dashboard/client',
      count: 1203,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to Mati Delivery admin dashboard. Manage all aspects of your delivery platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.href} className="bg-card hover:bg-muted transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-accent">{module.count}</p>
                <p className="text-xs text-muted-foreground">Total records</p>
              </div>
              <Link href={module.href}>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Manage
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
