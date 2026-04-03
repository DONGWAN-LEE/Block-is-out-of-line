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
import { Plus, Pencil } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

interface Product {
  id: string
  productId: string
  name: string
  rewardType: string
  rewardAmount: number
  priceKrw: number
  isActive: boolean
}

const productSchema = z.object({
  productId: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  rewardType: z.string().min(1, 'Required'),
  rewardAmount: z.number().int().min(0),
  priceKrw: z.number().int().min(0),
  isActive: z.boolean(),
})
type ProductForm = z.infer<typeof productSchema>

export default function ProductsPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<{ open: boolean; editing: Product | null }>({
    open: false,
    editing: null,
  })

  useEffect(() => {
    if (session?.backendToken) api.setToken(session.backendToken)
  }, [session?.backendToken])

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/admin/products'),
    enabled: !!session?.backendToken,
  })

  const createMutation = useMutation({
    mutationFn: (body: ProductForm) => api.post('/admin/products', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      closeDialog()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ProductForm }) =>
      api.patch(`/admin/products/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      closeDialog()
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/admin/products/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true },
  })

  const openCreate = () => {
    reset({ productId: '', name: '', rewardType: 'diamond', rewardAmount: 0, priceKrw: 0, isActive: true })
    setDialog({ open: true, editing: null })
  }

  const openEdit = (p: Product) => {
    reset({
      productId: p.productId,
      name: p.name,
      rewardType: p.rewardType,
      rewardAmount: p.rewardAmount,
      priceKrw: p.priceKrw,
      isActive: p.isActive,
    })
    setDialog({ open: true, editing: p })
  }

  const closeDialog = () => setDialog({ open: false, editing: null })

  const onSubmit = (data: ProductForm) => {
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
          Create Product
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Price (KRW)</TableHead>
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
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No products
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.productId}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>
                    {p.rewardType} x{p.rewardAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>₩{p.priceKrw.toLocaleString()}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleMutation.mutate({ id: p.id, isActive: !p.isActive })}
                    >
                      {p.isActive ? (
                        <Badge variant="secondary">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Button size="icon-xs" variant="ghost" onClick={() => openEdit(p)}>
                      <Pencil className="size-3" />
                    </Button>
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
            <DialogTitle>{dialog.editing ? 'Edit Product' : 'Create Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <Label>Product ID (store SKU)</Label>
                <Input {...register('productId')} placeholder="com.game.diamond100" className="font-mono" />
                {errors.productId && <p className="text-xs text-destructive">{errors.productId.message}</p>}
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Name</Label>
                <Input {...register('name')} placeholder="100 Diamonds" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
              <div className="space-y-1 col-span-2">
                <Label>Price (KRW)</Label>
                <Input type="number" {...register('priceKrw', { valueAsNumber: true })} />
                {errors.priceKrw && <p className="text-xs text-destructive">{errors.priceKrw.message}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="productActive" {...register('isActive')} className="size-4" />
              <Label htmlFor="productActive">Active</Label>
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
