"use client"

import type React from "react"

import { createFileRoute, useParams } from "@tanstack/react-router"
import { useState } from "react"
import { Calendar, Edit2, Plus, Trash2, Upload } from "lucide-react"
import {
  usePostGameDay,
  useGetGamedaysOptions,
  usePatchGameDay,
  useDeleteGameday,
  useDeleteGamedayImage,
} from "@/queries/images"
import type { Gameday } from "@/types/types"
import { useToast } from "@/hooks/use-toast"
import { useToastNotification } from "@/components/toast-notification"
import ImageUpload from "./-components/image-upload"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const Route = createFileRoute("/admin/tournaments/$tournamentid/pildid/")({
  loader: async ({ context: { queryClient }, params }) => {
    const tournamentId = Number(params.tournamentid)
    let gamedaysData

    try {
      // Always call the hook
      const gamedaysOptions = useGetGamedaysOptions(tournamentId)
      gamedaysData = await queryClient.ensureQueryData(gamedaysOptions)
    } catch (error) {
      console.error("Error fetching game days:", error)
    }
    return { gamedaysData }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { gamedaysData } = Route.useLoaderData()
  const params = useParams({ from: Route.id })
  const tournamentId = Number(params.tournamentid)

  // State management
  const [activeTab, setActiveTab] = useState(() => {
    if (gamedaysData?.data && gamedaysData.data.length > 0) {
      const sortedGamedays = [...gamedaysData.data].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateA - dateB
      })
      return sortedGamedays[0].id.toString()
    }
    return ""
  })
  const [editingGameday, setEditingGameday] = useState<Gameday | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [gamedayToDelete, setGamedayToDelete] = useState<number | null>(null)

  // Mutations
  const postGamedayMutation = usePostGameDay(tournamentId)
  const patchGamedayMutation = usePatchGameDay(tournamentId)
  const removeGameDayMutation = useDeleteGameday(tournamentId)
  const deleteImageMutation = useDeleteGamedayImage(tournamentId, () => Number(activeTab))

  // Toast notifications
  const toast = useToast()
  const { successToast, errorToast } = useToastNotification(toast)

  // Add new game day
  const addGameDay = () => {
    try {
      const now = new Date()
      const formattedDate = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`

      const gameday: Gameday = {
        created_at: now.toISOString(),
        id: 1,
        name: formattedDate,
        tournament_id: tournamentId,
        images: [],
      }

      postGamedayMutation.mutateAsync(gameday)
      successToast("Mängupäev edukalt lisatud")
    } catch (error) {
      console.error("Error adding game day:", error)
      errorToast("Mängupäeva lisamine ebaõnnestus")
    }
  }

  // Delete game day
  const confirmDeleteGameDay = (idToRemove: number) => {
    setGamedayToDelete(idToRemove)
    setDeleteConfirmOpen(true)
  }

  const removeGameDay = () => {
    if (gamedayToDelete === null) return

    try {
      removeGameDayMutation.mutateAsync(gamedayToDelete)
      successToast("Mängupäev edukalt eemaldatud")
    } catch (error) {
      console.error("Error deleting gameday", error)
      errorToast("Mängupäeva eemaldamine ebaõnnestus")
    } finally {
      setDeleteConfirmOpen(false)
      setGamedayToDelete(null)
    }
  }

  // Edit game day name
  const startEditing = (day: Gameday) => {
    setEditingGameday(day)
    setEditName(day.name)
  }

  const saveTabName = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingGameday !== null) {
      const updatedGameday: Gameday = {
        id: editingGameday.id,
        name: editName,
        tournament_id: tournamentId,
        images: editingGameday.images,
      }

      try {
        patchGamedayMutation.mutateAsync({
          formData: updatedGameday,
          gameday_id: editingGameday.id,
        })
        setEditingGameday(null)
        successToast("Mängupäeva nimi muudetud")
      } catch (error) {
        console.error("Failed to update", error)
        errorToast("Mängupäeva nime muutmine ebaõnnestus")
      }
    }
  }

  // Delete image
  const deleteImage = (imageId: number) => {
    deleteImageMutation.mutate(imageId, {
      onSuccess: () => {
        successToast("Pilt edukalt eemaldatud")
      },
      onError: (error) => {
        void error
        errorToast("Pildi eemaldamine ebaõnnestus")
      },
    })
  }

  // Loading state
  if (!gamedaysData || !gamedaysData.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laadin mängupäevi...</p>
        </div>
      </div>
    )
  }

  // Sort gamedays by creation date
  const gamedays = [...gamedaysData.data].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
    return dateA - dateB
  })

  return (
    <div className="container px-10 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <h5 className=" font-semibold tracking-tight">Mängupäevad</h5>
        </div>

        <Button onClick={addGameDay} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Uus mängupäev
        </Button>
      </div>

      {gamedays.length === 0 ? (
        <Card className="border-dashed bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Pole ühtegi mängupäeva</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Loo uus mängupäev, et saaksid hakata pilte lisama ja haldama.
            </p>
            <Button onClick={addGameDay} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Loo esimene mängupäev
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="flex h-auto p-1 justify-start rounded-lg">
              {gamedays.map((day) => (
                <TabsTrigger
                  key={day.id}
                  value={day.id.toString()}
                  className="text-sm px-4 py-2 h-9 data-[state=active]:bg-muted data-[state=active]:shadow-sm data-[state=active]:text-stone-800"
                >
                  {day.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {gamedays.map((day) => (
            <TabsContent key={day.id} value={day.id.toString()} className="rounded-lg">
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    {editingGameday && editingGameday.id === day.id ? (
                      <form onSubmit={saveTabName} className="flex-1 max-w-xs">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          className="h-9"
                          onBlur={saveTabName}
                        />
                      </form>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{day.name}</CardTitle>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => startEditing(day)}
                          title="Muuda"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Muuda</span>
                        </Button>
                      </div>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-1"
                      onClick={() => confirmDeleteGameDay(day.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Kustuta</span>
                    </Button>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-6">
                  <div className="bg-muted/40 rounded-lg p-4 mb-8">
                    <ImageUpload tournament_id={tournamentId} gameDay={day.id} />
                  </div>

                  {day.images && day.images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {day.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="group relative rounded-lg overflow-hidden border border-muted bg-card transition-all hover:shadow-md"
                        >
                          <img
                            src={img.image_url || "/placeholder.svg"}
                            alt={`Pilt ${idx + 1}`}
                            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteImage(img.id)}
                            title="Kustuta pilt"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Kustuta pilt</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed rounded-lg bg-muted/30">
                      <p className="text-muted-foreground">Sellele mängupäevale pole veel pilte lisatud</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kas oled kindel?</AlertDialogTitle>
            <AlertDialogDescription>
              See tegevus kustutab mängupäeva ja kõik sellega seotud pildid. Seda toimingut ei saa tagasi võtta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Loobu</AlertDialogCancel>
            <AlertDialogAction
              onClick={removeGameDay}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Kustuta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

