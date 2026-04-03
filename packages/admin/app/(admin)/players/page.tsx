'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

interface Player {
  id: string
  nickname: string
  level: number
  isBanned: boolean
  lastLoginAt: string | null
  createdAt: string
}

interface PaginatedPlayers {
  items: Player[]
  total: number
  page: number
  limit: number
}

const banSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  expiresAt: z.string().optional(),
})
type BanForm = z.infer<typeof banSchema>

export default function PlayersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [banTarget, setBanTarget] = useState<Player | null>(null)
  const [unbanTarget, setUnbanTarget] = useState<Player | null>(null)

  useEffect(() => {
    if (session?.backendToken) {
      api.setToken(session.backendToken)
    }
  }, [session?.backendToken])

  const { data, isLoading } = useQuery<PaginatedPlayers>({
    queryKey: ['players', page, search],
    queryFn: () =>
      api.get<PaginatedPlayers>(
        `/admin/players?page=${page}&limit=20&search=${encodeURIComponent(search)}`
      ),
    enabled: !!session?.backendToken,
  })

  const banMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: BanForm }) =>
      api.post(`/admin/players/${id}/ban`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      setBanTarget(null)
    },
  })

  const unbanMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/players/${id}/unban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      setUnbanTarget(null)
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BanForm>({ resolver: zodResolver(banSchema) })

  const columns: ColumnDef<Player>[] = [
    {
      accessorKey: 'nickname',
      header: 'Nickname',
    },
    {
      accessorKey: 'level',
      header: 'Level',
    },
    {
      accessorKey: 'isBanned',
      header: 'Status',
      cell: ({ getValue }) =>
        getValue() ? (
          <Badge variant="destructive">Banned</Badge>
        ) : (
          <Badge variant="secondary">Active</Badge>
        ),
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ getValue }) => {
        const v = getValue() as string | null
        return v ? new Date(v).toLocaleDateString() : '-'
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const player = row.original
        return (
          <div className="flex gap-2">
            {player.isBanned ? (
              <Button
                size="xs"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setUnbanTarget(player)
                }}
              >
                Unban
              </Button>
            ) : (
              <Button
                size="xs"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  setBanTarget(player)
                  reset()
                }}
              >
                Ban
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalPages = data ? Math.ceil(data.total / 20) : 1

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by nickname..."
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No players found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/players/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data ? `${data.total} players total` : ''}
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

      {/* Ban Dialog */}
      <Dialog open={!!banTarget} onOpenChange={(open) => !open && setBanTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Player: {banTarget?.nickname}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((data) => {
              if (banTarget) banMutation.mutate({ id: banTarget.id, body: data })
            })}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" {...register('reason')} rows={3} />
              {errors.reason && (
                <p className="text-sm text-destructive">{errors.reason.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="expiresAt">Expires At (optional)</Label>
              <Input id="expiresAt" type="datetime-local" {...register('expiresAt')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBanTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={banMutation.isPending}>
                Ban Player
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unban Confirm Dialog */}
      <Dialog open={!!unbanTarget} onOpenChange={(open) => !open && setUnbanTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban Player: {unbanTarget?.nickname}?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnbanTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => unbanTarget && unbanMutation.mutate(unbanTarget.id)}
              disabled={unbanMutation.isPending}
            >
              Confirm Unban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
