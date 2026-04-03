'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

interface PlayerDetail {
  id: string
  nickname: string
  level: number
  isBanned: boolean
  createdAt: string
  lastLoginAt: string | null
  socialAccounts: { provider: string; providerId: string }[]
  balances: {
    diamond: number
    gold: number
  }
  recentAttendance: { date: string; rewarded: boolean }[]
  recentPurchases: { productId: string; amount: number; createdAt: string }[]
}

const currencySchema = z.object({
  currencyType: z.enum(['diamond', 'gold']),
  amount: z.number().int(),
  reason: z.string().min(1, 'Reason is required'),
})
type CurrencyForm = z.infer<typeof currencySchema>

export default function PlayerDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [currencyDialog, setCurrencyDialog] = useState(false)

  useEffect(() => {
    if (session?.backendToken) {
      api.setToken(session.backendToken)
    }
  }, [session?.backendToken])

  const { data: player, isLoading } = useQuery<PlayerDetail>({
    queryKey: ['player', params.id],
    queryFn: () => api.get<PlayerDetail>(`/admin/players/${params.id}`),
    enabled: !!session?.backendToken && !!params.id,
  })

  const currencyMutation = useMutation({
    mutationFn: (body: CurrencyForm) =>
      api.post(`/admin/players/${params.id}/currency`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', params.id] })
      setCurrencyDialog(false)
      reset()
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurrencyForm>({
    resolver: zodResolver(currencySchema),
    defaultValues: { currencyType: 'diamond', amount: 0 },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-20 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!player) {
    return <p className="text-muted-foreground">Player not found.</p>
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Player Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nickname</p>
                  <p className="font-medium">{player.nickname}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-medium">{player.level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {player.isBanned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {new Date(player.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {player.lastLoginAt
                      ? new Date(player.lastLoginAt).toLocaleString()
                      : '-'}
                  </p>
                </div>
              </div>

              {player.socialAccounts.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Linked Accounts</p>
                  <div className="flex flex-wrap gap-2">
                    {player.socialAccounts.map((acc) => (
                      <Badge key={acc.providerId} variant="outline">
                        {acc.provider}: {acc.providerId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Currency Balances</CardTitle>
              <Button size="sm" onClick={() => setCurrencyDialog(true)}>
                Adjust
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                  <p className="text-sm text-muted-foreground">Diamond</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {player.balances.diamond.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4">
                  <p className="text-sm text-muted-foreground">Gold</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {player.balances.gold.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                {player.recentAttendance.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No attendance records</p>
                ) : (
                  <div className="space-y-2">
                    {player.recentAttendance.map((a) => (
                      <div
                        key={a.date}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{new Date(a.date).toLocaleDateString()}</span>
                        <Badge variant={a.rewarded ? 'secondary' : 'outline'}>
                          {a.rewarded ? 'Rewarded' : 'No reward'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                {player.recentPurchases.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No purchase records</p>
                ) : (
                  <div className="space-y-2">
                    {player.recentPurchases.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{p.productId}</span>
                        <span className="font-medium">
                          ₩{p.amount.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Currency Adjust Dialog */}
      <Dialog open={currencyDialog} onOpenChange={setCurrencyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Currency</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => currencyMutation.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="currencyType">Currency Type</Label>
              <select
                id="currencyType"
                {...register('currencyType')}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="diamond">Diamond</option>
                <option value="gold">Gold</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount">Amount (use negative to deduct)</Label>
              <Input id="amount" type="number" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" {...register('reason')} />
              {errors.reason && (
                <p className="text-sm text-destructive">{errors.reason.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCurrencyDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={currencyMutation.isPending}>
                Apply
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
