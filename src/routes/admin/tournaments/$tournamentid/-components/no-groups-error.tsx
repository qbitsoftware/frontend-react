import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams, useRouter } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function NoGroupsError() {
    const router = useRouter()
    const params = useParams({ from: "/admin/tournaments/$tournamentid" })
    const { t } = useTranslation()
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-sm border-border/50 shadow-sm">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-lg font-medium text-muted-foreground">
                        {t('admin.tournaments.groups.no_groups')}
                    </CardTitle>
                    <CardDescription className="text-sm">
                        {t('admin.tournaments.groups.no_groups_description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <Button
                        onClick={() => { router.navigate({ to: "/admin/tournaments/$tournamentid/grupid/uus", params: { tournamentid: params.tournamentid }, search: { selectedGroup: undefined } }) }}
                        className="w-full"
                        size="sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('admin.tournaments.groups.no_groups_create')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}