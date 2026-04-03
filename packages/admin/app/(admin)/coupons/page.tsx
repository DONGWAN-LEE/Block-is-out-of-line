'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

interface Coupon {
  id: string
  code: string
  type: string
  rewardType: string
  rewardAmount: number
  redemptionCount: number
  maxRedemptions: number | null
  expiresAt: string | null
  isActive: boolean
}

interface Redemption {
  id: string
  playerId: string
  playerNickname: string
  redeemedAt: string
}

const couponSchema = z.object({
  code: z.string().min(1, 'Required'),
  type: z.string().min(1, 'Required'),
  rewardType: z.string().min(1, 'Required'),
  rewardAmount: z.number().int().min(0),
  maxRedemptions: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
})
type CouponForm = z.infer<typeof couponSchema>

export default function CouponsPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<{ open: boolean; editing: Coupon | null }>({
    open: false,
    editing: null,
  })
  const [redemptionCoupon, setRedemptionCoupon] = useState<Coupon | null>(null)

  useEffect(() => {
    if (session?.backendToken) api.setToken(session.backendToken)
  }, [session?.backendToken])

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: () => api.get<Coupon[]>('/admin/coupons'),
    enabled: !!session?.backendToken,
  })

  const { data: redemptions = [] } = useQuery<Redemption[]>({
    queryKey: ['coupon-redemptions', redemptionCoupon?.id],
    queryFn: () =>
      api.get<Redemption[]>(`/admin/coupons/${redemptionCoupon!.id}/redemptions`),
    enabled: !!redemptionCoupon,
  })

  const createMutation = useMutation({
    mutationFn: (body: unknown) => api.post('/admin/coupons', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      closeDialog()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      api.patch(`/admin/coupons/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      closeDialog()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponForm>({
    resolver: zodResolver(couponSchema),
    defaultValues: { isActive: true },
  })

  const openCreate = () => {
    reset({ code: '', type: 'standard', rewardType: 'diamond', rewardAmount: 0, isActive: true })
    setDialog({ open: true, editing: null })
  }

  const openEdit = (c: Coupon) => {
    reset({
      code: c.code,
      type: c.type,
      rewardType: c.rewardType,
      rewardAmount: c.rewardAmount,
      maxRedemptions: c.maxRedemptions != null ? String(c.maxRedemptions) : '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : undefined,
      isActive: c.isActive,
    })
    setDialog({ open: true, editing: c })
  }

  const closeDialog = () => setDialog({ open: false, editing: null })

  const onSubmit = (data: CouponForm) => {
    const maxRedemptions =
      data.maxRedemptions && data.maxRedemptions !== ''
        ? parseInt(data.maxRedemptions, 10)
        : undefined
    const payload = { ...data, maxRedemptions }
    if (dialog.editing) {
      updateMutation.mutate({ id: dialog.editing.id, body: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4 mr-1" />
          Create Coupon
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Redemptions</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No coupons
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <button
                      className="font-mono text-sm underline underline-offset-2 hover:text-primary"
                      onClick={() => setRedemptionCoupon(c)}
                    >
                      {c.code}
                    </button>
                  </TableCell>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>
                    {c.rewardType} x{c.rewardAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {c.redemptionCount}
                    {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ''}
                  </TableCell>
                  <TableCell>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>
                    {c.isActive ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon-xs" variant="ghost" onClick={() => openEdit(c)}>
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(c.id)}
                      >
                        <Trash2 className="size-3 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialog.open} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.editing ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <Label>Code</Label>
                <Input {...register('code')} placeholder="SUMMER2025" className="font-mono uppercase" />
                {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Input {...register('type')} placeholder="standard" />
                {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Reward Type</Label>
                <Input {...register('rewardType')} placeholder="diamond" />
                {errors.rewardType && <p className="text-xs text-destructive">{errors.rewardType.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Reward Amount</Label>
                <Input type="number" {...register('rewardAmount', { valueAsNumber: true })} />
                {errors.rewardAmount && <p className="text-xs text-destructive">{errors.rewardAmount.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Max Redemptions</Label>
                <Input type="number" {...register('maxRedemptions')} placeholder="unlimited" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Expires At</Label>
                <Input type="datetime-local" {...register('expiresAt')} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="couponActive" {...register('isActive')} className="size-4" />
              <Label htmlFor="couponActive">Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {dialog.editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Redemptions Dialog */}
      <Dialog open={!!redemptionCoupon} onOpenChange={(open) => !open && setRedemptionCoupon(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Redemptions: {redemptionCoupon?.code}</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto">
            {redemptions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No redemptions yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Redeemed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.playerNickname}</TableCell>
                      <TableCell>{new Date(r.redeemedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  )
}
