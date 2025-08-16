import { createFileRoute } from "@tanstack/react-router";
import HomePageGrid from "./-components/home-grid";
import ErrorPage from "@/components/error";

export const Route = createFileRoute("/")({
  component: Index,
  errorComponent: () => <ErrorPage />
});


function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      <HomePageGrid />
    </div>
  );
}

