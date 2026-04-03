'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Home,
  Users,
  Gift,
  Ticket,
  Package,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/rewards', label: 'Rewards', icon: Gift },
  { href: '/coupons', label: 'Coupons', icon: Ticket },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/payments', label: 'Payments', icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-slate-900 text-slate-100 shrink-0">
      <div className="px-4 py-5 border-b border-slate-700">
        <h1 className="text-sm font-semibold text-slate-200 leading-tight">
          Block is Out of Line
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex flex-col gap-1 p-2 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}

        <div className="my-2">
          <Separator className="bg-slate-700" />
        </div>

        <Button
          variant="ghost"
          className="justify-start gap-3 px-3 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        >
          <LogOut className="size-4 shrink-0" />
          Logout
        </Button>
      </nav>
    </aside>
  )
}
