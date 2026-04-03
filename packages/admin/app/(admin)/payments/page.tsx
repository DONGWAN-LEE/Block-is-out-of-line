'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Payment {
  id: string
  transactionId: string
  playerNickname: string
  productId: string
  store: string
  status: string
  amount: number
  createdAt: string
}

interface PaymentDetail extends Payment {
  playerId: string
  receiptData?: string
  metadata?: Record<string, unknown>
}

interface PaginatedPayments {
  items: Payment[]
  total: number
  page: number
  limit: number
}

const STATUS_OPTIONS = ['all', 'pending', 'completed', 'failed', 'refunded']
const STORE_OPTIONS = ['all', 'google', 'apple', 'onestore']

function statusVariant(status: string): 'secondary' | 'destructive' | 'outline' {
  if (status === 'completed') return 'secondary'
  if (status === 'failed' || status === 'refunded') return 'destructive'
  return 'outline'
}

export default function PaymentsPage() {
  const { data: session } = useSession()
  const [page, setPage] = useState(1)
  const [store, setStore] = useState('all')
  const [status, setStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null)

  useEffect(() => {
    if (session?.backendToken) api.setToken(session.backendToken)
  }, [session?.backendToken])

  const buildQuery = () => {
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (store !== 'all') params.set('store', store)
    if (status !== 'all') params.set('status', status)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    return params.toString()
  }

  const { data, isLoading } = useQuery<PaginatedPayments>({
    queryKey: ['payments', page, store, status, dateFrom, dateTo],
    queryFn: () => api.get<PaginatedPayments>(`/admin/payments?${buildQuery()}`),
    enabled: !!session?.backendToken,
  })

  const { data: detail } = useQuery<PaymentDetail>({
    queryKey: ['payment-detail', detailPayment?.id],
    queryFn: () => api.get<PaymentDetail>(`/admin/payments/${detailPayment!.id}`),
    enabled: !!detailPayment,
  })

  const totalPages = data ? Math.ceil(data.total / 20) : 1

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Store</p>
          <Select value={store} onValueChange={(v) => { if (v !== null) { setStore(v); setPage(1) } }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STORE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s === 'all' ? 'All Stores' : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Status</p>
          <Select value={status} onValueChange={(v) => { if (v !== null) { setStatus(v); setPage(1) } }}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">From</p>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">To</p>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="w-40"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setStore('all')
            setStatus('all')
            setDateFrom('')
            setDateTo('')
            setPage(1)
          }}
        >
          Reset
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data?.items.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => setDetailPayment(p)}
                >
                  <TableCell className="font-mono text-xs">{p.transactionId}</TableCell>
                  <TableCell>{p.playerNickname}</TableCell>
                  <TableCell className="font-mono text-xs">{p.productId}</TableCell>
                  <TableCell>{p.store}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  </TableCell>
                  <TableCell>₩{p.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data ? `${data.total} payments total` : ''}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailPayment} onOpenChange={(open) => !open && setDetailPayment(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Detail</DialogTitle>
          </DialogHeader>
          {detail ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-xs break-all">{detail.transactionId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={statusVariant(detail.status)}>{detail.status}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Player</p>
                  <p>{detail.playerNickname}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Product</p>
                  <p className="font-mono text-xs">{detail.productId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Store</p>
                  <p>{detail.store}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">₩{detail.amount.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Date</p>
                  <p>{new Date(detail.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-20 animate-pulse bg-muted rounded" />
          )}
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  )
}
