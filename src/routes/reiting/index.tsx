import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Reiting } from './-components/reiting';
import { UseGetUsers } from '@/queries/users';
import ErrorPage from '@/components/error';

export const Route = createFileRoute('/reiting/')({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient } }) => {
    const users = await queryClient.ensureQueryData(UseGetUsers())
    return { users }
  }
});
;

function RouteComponent() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const { users } = Route.useLoaderData();
  return (
    <div className="w-full mx-auto lg:px-4 max-w-[98%]">
      {/* <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: 0 }}
        className=""
      > */}
      <Reiting users={users.data} />
      {/* </motion.div> */}
    </div>
  );
}
