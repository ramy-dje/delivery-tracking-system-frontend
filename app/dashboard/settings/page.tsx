import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Configure dashboard settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Application Settings</CardTitle>
            <CardDescription>Configure core application parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              General Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Notification Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Payment Configuration
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">System Administration</CardTitle>
            <CardDescription>Manage system-level configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Backup & Restore
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Database Management
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Activity Logs
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Security</CardTitle>
            <CardDescription>Manage security and access control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Active Sessions
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">API Integration</CardTitle>
            <CardDescription>Configure API keys and integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              API Keys
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Webhook Configuration
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Third-party Integrations
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-card">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Application:</strong> Mati Delivery Admin Dashboard
          </p>
          <p>
            <strong>Version:</strong> 1.0.0
          </p>
          <p>
            <strong>Built with:</strong> Next.js 16, React 19, TypeScript, TailwindCSS
          </p>
          <p>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
