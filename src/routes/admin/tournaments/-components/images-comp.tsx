import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDeleteGameday, useDeleteGamedayImage, useGetGamedaysQuery, usePatchGameDay, usePostGameDay } from '@/queries/images';
import { Gameday } from '@/types/gamedays';
import { Calendar, Edit2, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { toast } from "sonner"
import ImageUpload from './image-upload';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


interface Props {
    tournament_id: number
}

export default function ImageComp({ tournament_id }: Props) {
    const { data: gamedaysData } = useGetGamedaysQuery(tournament_id)
    const [activeTab, setActiveTab] = useState("")
    const initialTabSet = useRef(false);

    useEffect(() => {
        if (gamedaysData?.data && gamedaysData.data.length > 0 && !initialTabSet.current) {
            const sortedGamedays = [...gamedaysData.data].sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateA - dateB;
            });
            setActiveTab(sortedGamedays[0].id.toString());
            initialTabSet.current = true;
        }
    }, [gamedaysData]);

    const [editingGameday, setEditingGameday] = useState<Gameday | null>(null);
    const [editName, setEditName] = useState("");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [gamedayToDelete, setGamedayToDelete] = useState<number | null>(null);
    const { t } = useTranslation();

    const postGamedayMutation = usePostGameDay(tournament_id);
    const patchGamedayMutation = usePatchGameDay(tournament_id);
    const removeGameDayMutation = useDeleteGameday(tournament_id);
    const deleteImageMutation = useDeleteGamedayImage(tournament_id, () =>
        Number(activeTab)
    );

    const addGameDay = async () => {
        try {
            const now = new Date();
            const formattedDate = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`;

            const gameday: Gameday = {
                created_at: now.toISOString(),
                id: 1,
                name: formattedDate,
                tournament_id: tournament_id,
                images: [],
            };

            const response = await postGamedayMutation.mutateAsync(gameday);
            if (gamedays.length === 0 && response.data) {
                setActiveTab(response.data.id.toString());
            }
            toast.message(t("admin.tournaments.groups.images.toasts.success_add"));
        } catch (error) {
            toast.error(t("admin.tournaments.groups.images.toasts.error_add"));
        }
    };

    // Delete game day
    const confirmDeleteGameDay = (idToRemove: number) => {
        setGamedayToDelete(idToRemove);
        setDeleteConfirmOpen(true);
    };

    const removeGameDay = async () => {
        if (gamedayToDelete === null) return;

        try {
            await removeGameDayMutation.mutateAsync(gamedayToDelete);
            toast.message(t("admin.tournaments.groups.images.toasts.success_remove"));
        } catch (error) {
            toast.error(t("admin.tournaments.groups.images.toasts.error_remove"));
        } finally {
            setDeleteConfirmOpen(false);
            setGamedayToDelete(null);
        }
    };

    // Edit game day name
    const startEditing = (day: Gameday) => {
        setEditingGameday(day);
        setEditName(day.name);
    };

    const saveTabName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingGameday !== null) {
            const updatedGameday: Gameday = {
                id: editingGameday.id,
                name: editName,
                tournament_id: tournament_id,
                images: editingGameday.images,
            };

            try {
                await patchGamedayMutation.mutateAsync({
                    formData: updatedGameday,
                    gameday_id: editingGameday.id,
                });
                setEditingGameday(null);
                toast.message(t("admin.tournaments.groups.images.toasts.success_edit"));
            } catch (error) {
                void error;
                toast.error(t("admin.tournaments.groups.images.toasts.error_edit"));
            }
        }
    };

    // Delete image
    const deleteImage = (imageId: number) => {
        deleteImageMutation.mutate(imageId, {
            onSuccess: () => {
                toast.message(t("admin.tournaments.groups.images.toasts.success_remove_image"));
            },
            onError: (error) => {
                void error;
                toast.error(t("admin.tournaments.groups.images.toasts.error_remove_image"));
            },
        });
    };

    // Loading state
    if (!gamedaysData || !gamedaysData.data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                        {t("admin.tournaments.groups.images.loading.games")}
                    </p>
                </div>
            </div>
        );
    }

    // Sort gamedays by creation date
    const gamedays = [...gamedaysData.data].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
    });

    return (
        <>
            {" "}
            <Card className="w-full border-none shadow-none bg-transparent ">
                <CardHeader className="px-0 flex-col md:flex-row gap-4 justify-between items-start md:items-center space-y-0">
                    <h5 className=" font-medium">
                        {t("admin.tournaments.groups.images.title")}
                    </h5>
                    <Button onClick={addGameDay} className="flex items-center gap-2">
                        <Plus className="h-4 w-4 mr-1" />
                        {t("admin.tournaments.groups.images.new")}
                    </Button>
                </CardHeader>
            </Card>
            {gamedays.length === 0 ? (
                <Card className="border border-dashed rounded bg-muted/50">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="rounded-full bg-primary/10 p-3 mb-4">
                            <Calendar className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">
                            {t("admin.tournaments.groups.images.no_gamedays")}
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md mb-6">
                            {t("admin.tournaments.groups.images.no_gamedays_description")}
                        </p>
                        <Button onClick={addGameDay} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            {t("admin.tournaments.groups.images.new")}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full space-y-6"
                >
                    <div className="overflow-x-auto pb-2">
                        <TabsList className="flex h-auto p-1 justify-start rounded-lg">
                            {gamedays.map((day) => (
                                <TabsTrigger
                                    key={day.id}
                                    value={day.id.toString()}
                                    className="text-sm px-4 py-2 h-9 data-[state=active]:bg-midnightTable/10 data-[state=active]:shadow-sm data-[state=active]:text-stone-800"
                                >
                                    {day.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {gamedays.map((day) => (
                        <TabsContent
                            key={day.id}
                            value={day.id.toString()}
                            className="rounded-lg"
                        >
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
                                                    <span className="sr-only">
                                                        {t("admin.tournaments.groups.images.edit")}
                                                    </span>
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
                                            <span>{t("admin.tournaments.groups.images.delete")}</span>
                                        </Button>
                                    </div>
                                </CardHeader>

                                <Separator />

                                <CardContent className="pt-6">
                                    <div className=" rounded-lg p-4 mb-8">
                                        <ImageUpload
                                            tournament_id={tournament_id}
                                            gameDay={day.id}
                                        />
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
                                                        title={t("admin.tournaments.groups.images.delete")}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            {t("admin.tournaments.groups.images.delete")}
                                                        </span>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border border-dashed rounded-lg bg-muted/30">
                                            <p className="text-muted-foreground">
                                                {t("admin.tournaments.groups.images.no_images")}
                                            </p>
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
                        <AlertDialogTitle>
                            {t("admin.tournaments.groups.images.dialog.confirmation")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("admin.tournaments.groups.images.dialog.description")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t("admin.tournaments.groups.images.dialog.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={removeGameDay}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t("admin.tournaments.groups.images.dialog.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );

}


