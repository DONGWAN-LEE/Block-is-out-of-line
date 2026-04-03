'use client'

import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/players': 'Players',
  '/rewards': 'Rewards',
  '/coupons': 'Coupons',
  '/products': 'Products',
  '/payments': 'Payments',
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  for (const [prefix, title] of Object.entries(pageTitles)) {
    if (prefix !== '/' && pathname.startsWith(prefix)) return title
  }
  return 'Admin'
}

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const title = getPageTitle(pathname)

  const adminName =
    (session?.admin as Record<string, unknown> | undefined)?.name as
      | string
      | undefined
  const adminImage =
    (session?.admin as Record<string, unknown> | undefined)?.picture as
      | string
      | undefined
  const initials = adminName
    ? adminName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'A'

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6 shrink-0">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {adminImage && <AvatarImage src={adminImage} alt={adminName ?? 'Admin'} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {adminName && (
            <span className="text-sm font-medium hidden sm:block">{adminName}</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          title="Logout"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
