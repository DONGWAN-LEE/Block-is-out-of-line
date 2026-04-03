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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

interface Reward {
  id: string
  rewardCategory: string
  dayNumber: number
  rewardType: string
  rewardAmount: number
  isActive: boolean
}

const rewardSchema = z.object({
  rewardCategory: z.string().min(1, 'Required'),
  dayNumber: z.number().int().min(1),
  rewardType: z.string().min(1, 'Required'),
  rewardAmount: z.number().int().min(0),
  isActive: z.boolean(),
})
type RewardForm = z.infer<typeof rewardSchema>

export default function RewardsPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<{ open: boolean; editing: Reward | null }>({
    open: false,
    editing: null,
  })

  useEffect(() => {
    if (session?.backendToken) api.setToken(session.backendToken)
  }, [session?.backendToken])

  const { data: rewards = [], isLoading } = useQuery<Reward[]>({
    queryKey: ['rewards'],
    queryFn: () => api.get<Reward[]>('/admin/rewards'),
    enabled: !!session?.backendToken,
  })

  const createMutation = useMutation({
    mutationFn: (body: RewardForm) => api.post('/admin/rewards', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] })
      closeDialog()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: RewardForm }) =>
      api.patch(`/admin/rewards/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] })
      closeDialog()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/rewards/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rewards'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/admin/rewards/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rewards'] }),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RewardForm>({
    resolver: zodResolver(rewardSchema),
    defaultValues: { isActive: true },
  })

  const openCreate = () => {
    reset({ rewardCategory: '', dayNumber: 1, rewardType: 'diamond', rewardAmount: 0, isActive: true })
    setDialog({ open: true, editing: null })
  }

  const openEdit = (r: Reward) => {
    reset({
      rewardCategory: r.rewardCategory,
      dayNumber: r.dayNumber,
      rewardType: r.rewardType,
      rewardAmount: r.rewardAmount,
      isActive: r.isActive,
    })
    setDialog({ open: true, editing: r })
  }

  const closeDialog = () => setDialog({ open: false, editing: null })

  const onSubmit = (data: RewardForm) => {
    if (dialog.editing) {
      updateMutation.mutate({ id: dialog.editing.id, body: data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4 mr-1" />
          Create Reward
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rewards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No rewards configured
                </TableCell>
              </TableRow>
            ) : (
              rewards.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.rewardCategory}</TableCell>
                  <TableCell>{r.dayNumber}</TableCell>
                  <TableCell>{r.rewardType}</TableCell>
                  <TableCell>{r.rewardAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleMutation.mutate({ id: r.id, isActive: !r.isActive })}
                      className="focus:outline-none"
                    >
                      {r.isActive ? (
                        <Badge variant="secondary">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon-xs" variant="ghost" onClick={() => openEdit(r)}>
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(r.id)}
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

      <Dialog open={dialog.open} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.editing ? 'Edit Reward' : 'Create Reward'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Category</Label>
                <Input {...register('rewardCategory')} placeholder="daily" />
                {errors.rewardCategory && (
                  <p className="text-xs text-destructive">{errors.rewardCategory.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Day Number</Label>
                <Input type="number" {...register('dayNumber', { valueAsNumber: true })} />
                {errors.dayNumber && (
                  <p className="text-xs text-destructive">{errors.dayNumber.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Reward Type</Label>
                <Input {...register('rewardType')} placeholder="diamond" />
                {errors.rewardType && (
                  <p className="text-xs text-destructive">{errors.rewardType.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Amount</Label>
                <Input type="number" {...register('rewardAmount', { valueAsNumber: true })} />
                {errors.rewardAmount && (
                  <p className="text-xs text-destructive">{errors.rewardAmount.message}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" {...register('isActive')} className="size-4" />
              <Label htmlFor="isActive">Active</Label>
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
    </div>
  )
}
