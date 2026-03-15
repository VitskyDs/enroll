import { Outlet } from 'react-router-dom'

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center px-6">
        <p className="text-sm font-medium">Dashboard</p>
        <p className="text-xs text-muted-foreground">Coming soon</p>
      </div>
      {/* Service drawer renders as a nested route */}
      <Outlet />
    </div>
  )
}
