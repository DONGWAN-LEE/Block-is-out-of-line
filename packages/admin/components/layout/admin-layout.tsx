import { Sidebar } from './sidebar'
import { Header } from './header'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 p-6 bg-muted/20">{children}</main>
      </div>
    </div>
  )
}
