import { Card, CardContent, CardHeader } from '@/components/ui/card';
import VenueComp from '../lauad/-components/table';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { UseGetFreeVenues } from '@/queries/venues';
import { UseGetTournamentTablesQuery } from '@/queries/tables';


export default function TournamentTableModal() {
    const { tournamentid } = useParams({ strict: false });
    const { t } = useTranslation();
    const { data: tournamentTables, isLoading } = UseGetFreeVenues(
        Number(tournamentid),
        true
    );
    const { data: tournamentGroups } = UseGetTournamentTablesQuery(
        Number(tournamentid)
    );

    if (isLoading) {
        return (
            <div className="p-4">
                {t("news.loading", { defaultValue: "Loading..." })}
            </div>
        );
    }

    if (!tournamentTables?.data || tournamentTables.data.length === 0) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500">
                    {t("admin.tournaments.tables.no_tables")}
                </p>
            </div>
        );
    }

    return (
        <Card className="w-full border-none shadow-none bg-transparent">
            <CardHeader className="px-0 flex-row justify-between items-center space-y-0">
                <h5 className="font-medium">{t("admin.tournaments.tables.title")}</h5>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tournamentTables.data.map((table, key) => (
                        <VenueComp key={key} table={table} tables_data={tournamentGroups?.data} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
