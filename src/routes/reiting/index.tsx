import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Reiting } from './-components/reiting';
import ErrorPage from '@/components/error';

export const Route = createFileRoute('/reiting/')({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
});
;

function RouteComponent() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full mx-auto lg:px-4 max-w-[98%]">
      <Reiting />
    </div>
  );
}
