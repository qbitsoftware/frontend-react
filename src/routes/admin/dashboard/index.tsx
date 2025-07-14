import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Target, type LucideIcon, LayoutDashboard, PersonStanding } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import ErrorPage from "@/components/error";
import { formatDateString } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tournament } from "@/types/tournaments";
import { useUsersCount } from "@/queries/users";
import { UseGetTournamentsAdmin } from "@/queries/tournaments";
import { useUser } from "@/providers/userProvider";


export const Route = createFileRoute("/admin/dashboard/")({
  loader: async ({ context: { queryClient } }) => {
    try {
      const tournaments_data = await queryClient.ensureQueryData(UseGetTournamentsAdmin());
      return { tournaments_data, error: null };
    } catch (error) {
      return { tournaments_data: null, error };
    }
  },
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
});

export default function RouteComponent() {
  const { tournaments_data } = Route.useLoaderData();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUser();

  const { count } = useUsersCount()

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t("admin.dashboard.greeting.good_morning");
    } else if (hour < 18) {
      return t("admin.dashboard.greeting.good_day");
    } else {
      return t("admin.dashboard.greeting.good_evening");
    }
  };

  const processChartData = (tournaments: Tournament[]) => {
    const monthMap = new Map();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    months.forEach((month) => {
      monthMap.set(month, 0);
    });

    tournaments.forEach((tournament) => {
      if (tournament.start_date) {
        const date = new Date(tournament.start_date);
        const month = months[date.getMonth()];
        monthMap.set(month, monthMap.get(month) + 1);
      }
    });

    return months.map((month) => ({
      name: month,
      tournaments: monthMap.get(month),
    }));
  };

  const getStats = (tournaments: Tournament[]) => {
    const activeTournaments = tournaments.filter(
      (t) => t.state === "active"
    ).length;

    return {
      totalTournaments: tournaments.length,
      activeTournaments: activeTournaments,
    };
  };

  // If there's no error but also no data or empty data
  if (!tournaments_data || !tournaments_data.data || tournaments_data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] m-8 space-y-2 rounded-lg border-2 border-dashed border-gray-200">
        <LayoutDashboard className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {t("admin.dashboard.missing")}
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          {t("admin.dashboard.missing_subtitle")}
        </p>
        <Link href="/admin/tournaments/new">
          <Button className="mt-2 px-6">{t("admin.tournaments.add_new")}</Button>
        </Link>
      </div>
    );
  }

  const chartData = processChartData(tournaments_data.data);
  const stats = getStats(tournaments_data.data);

  const currentDate = new Date();

  const upcomingTournaments = [...tournaments_data.data]
    .filter((tournament) => new Date(tournament.start_date) > currentDate)
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

  return (
    <div className="space-y-3 sm:space-y-6 h-full p-4 sm:p-8">
      <div className="flex items-center gap-2 sm:gap-3">
        <h3 className="text-stone-800 font-bold text-lg sm:text-2xl">
          {getTimeBasedGreeting()}, {user?.username || 'Admin'}!
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
        <StatsCard
          Icon={Target}
          iconColor="text-green-600"
          bgColor="bg-green-100"
          title={stats.activeTournaments}
          description={t("admin.dashboard.active_tournaments")}
        />
        <StatsCard
          Icon={Trophy}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
          title={stats.totalTournaments}
          description={t("admin.dashboard.total_tournaments")}
        />
        <StatsCard
          Icon={PersonStanding}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
          title={count}
          description={t("admin.dashboard.users_in_db")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <h5 className="font-medium text-sm sm:text-lg">{t("admin.dashboard.upcoming_tournaments")}</h5>
            <CardDescription className="text-xs sm:text-sm">
              {t("admin.dashboard.upcoming_tournaments_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[400px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm px-2 sm:px-4">{t("admin.dashboard.utils.name")}</TableHead>
                  <TableHead className="text-xs sm:text-sm px-2 sm:px-4">{t("admin.dashboard.utils.status")}</TableHead>
                  <TableHead className="text-xs sm:text-sm px-2 sm:px-4">
                    {t("admin.dashboard.utils.start_date")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingTournaments?.slice(0, 5).map((tournament) => (
                  <TableRow
                    className="cursor-pointer"
                    key={tournament.name}
                    onClick={() => {
                      router.navigate({
                        to: "/admin/tournaments/" + tournament.id,
                      });
                    }}
                  >
                    <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{tournament.name}</TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <TournamentStatusBadge status={tournament.state} />
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm px-2 sm:px-4 truncate">
                      {formatDateString(tournament.start_date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <h5 className="font-medium text-sm sm:text-lg">
              {t("admin.dashboard.recently_created_tournaments")}
            </h5>
            <CardDescription className="text-xs sm:text-sm">
              {t("admin.dashboard.recently_created_tournaments_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[400px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm px-2 sm:px-4">{t("admin.dashboard.utils.name")}</TableHead>
                  <TableHead className="text-xs sm:text-sm px-2 sm:px-4">{t("admin.dashboard.utils.status")}</TableHead>
                  <TableHead className="text-xs sm:text-sm px-2 sm:px-4">
                    {t("admin.dashboard.utils.start_date")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments_data.data?.slice(0, 5).map((tournament) => (
                  <TableRow
                    className="cursor-pointer"
                    key={tournament.name}
                    onClick={() => {
                      router.navigate({
                        to: "/admin/tournaments/" + tournament.id,
                      });
                    }}
                  >
                    <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{tournament.name}</TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <TournamentStatusBadge status={tournament.state} />
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm px-2 sm:px-4 truncate">
                      {formatDateString(tournament.start_date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="mb-1 p-3 sm:p-6 sm:mb-2">
          <h5 className="font-medium text-sm sm:text-lg">{t("admin.dashboard.tournament_activity")}</h5>
          <CardDescription className="text-xs sm:text-sm">
            {t("admin.dashboard.tournament_activity_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Bar dataKey="tournaments" fill="#4C97F1" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  Icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  title: number;
  description: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  Icon,
  iconColor,
  bgColor,
  title,
  description,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3 sm:px-6">
        <CardTitle className="text-xs sm:text-base font-medium">{description}</CardTitle>
        <div className={`p-1 sm:p-2 ${bgColor} rounded-full`}>
          <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2 sm:px-6 sm:pb-4">
        <div className="text-lg sm:text-4xl font-bold">{title}</div>
      </CardContent>
    </Card>
  );
};

interface TournamentStatusBadgeProps {
  status: string;
}

const TournamentStatusBadge: React.FC<TournamentStatusBadgeProps> = ({
  status,
}) => {
  return <Badge className="bg-gray-100 text-gray-800 hover:bg-stone-200 text-xs sm:text-sm px-2 py-1">{status}</Badge>;
};
