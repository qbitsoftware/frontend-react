import { createFileRoute } from "@tanstack/react-router";
import HomePageGrid from "./-components/home-grid";
import { UseGetUsers } from "@/queries/users";
import { UseGetBlogsOption } from "@/queries/blogs";
import ErrorPage from "@/components/error";
import { UseGetHomePageTournaments } from "@/queries/tournaments";

export const Route = createFileRoute("/")({
  component: Index,
  loader: async ({ context: { queryClient } }) => {
    // const tournamentsPromise = queryClient.ensureQueryData(UseGetTournamentsPublic());
    const tournamentsPromise = queryClient.ensureQueryData(UseGetHomePageTournaments());
    const usersPromise = queryClient.ensureQueryData(UseGetUsers());
    const blogsPromise = queryClient.ensureQueryData(UseGetBlogsOption());

    const [tournaments, users, articles_data] = await Promise.allSettled([
      tournamentsPromise,
      usersPromise,
      blogsPromise,
    ]);

    const resolvedTournaments = tournaments.status === "fulfilled" ? tournaments.value : { data: [], message: "Error", error: true };
    const resolvedUsers = users.status === "fulfilled" ? users.value : { data: [], message: "Error", error: true };
    const resolvedArticles = articles_data.status === "fulfilled" ? articles_data.value : { data: { blogs: [], total_pages: 0 }, message: "Error", error: true };

    const dataStatus = {
      tournamentsEmpty: !resolvedTournaments?.data?.length,
      usersEmpty: !resolvedUsers?.data?.length,
      articlesEmpty: !resolvedArticles?.data?.blogs?.length
    };

    return { tournaments: resolvedTournaments, users: resolvedUsers, articles_data: resolvedArticles, dataStatus };
  },
  errorComponent: () => <ErrorPage />
});


function Index() {
  const { tournaments, users, articles_data, dataStatus } = Route.useLoaderData();

  return (
    <div className="flex flex-col min-h-screen">
      <HomePageGrid
        tournaments={tournaments?.data}
        users={users?.data}
        articles={articles_data?.data?.blogs}
        dataStatus={dataStatus}
      />
    </div>
  );
}

