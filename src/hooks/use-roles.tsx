import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/providers/userProvider';
import type { UserRoles } from '@/types/enums';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

interface UseRoleAccessOptions {
  requiredRole?: UserRoles;
  redirectTo?: string;
  allowedRoles?: UserRoles[];
}

export const useRoleAccess = ({
  requiredRole,
  redirectTo = '/admin/dashboard',
  allowedRoles = [],
}: UseRoleAccessOptions = {}) => {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user?.user?.role) {
      return;
    }

    const userRole = user.user.role as UserRoles;

    const hasRequiredRole = !requiredRole || userRole === requiredRole;
    const hasAllowedRole = allowedRoles.length === 0 || allowedRoles.includes(userRole);

    if (!hasRequiredRole && !hasAllowedRole) {
      router.navigate({ to: redirectTo });
      return;
    }
  }, [user?.user?.role, requiredRole, allowedRoles, redirectTo, router]);

  return {
    user: user?.user,
    hasAccess:
      user?.user?.role &&
      (!requiredRole ||
        user.user.role === requiredRole ||
        (allowedRoles.length > 0 &&
          allowedRoles.includes(user.user.role as UserRoles))),
    isLoading: !user?.user?.role,
  };
};

interface RoleProtectedProps {
  children: React.ReactNode;
  requiredRole?: UserRoles;
  allowedRoles?: UserRoles[];
  redirectTo?: string;
}

export const RoleProtected: React.FC<RoleProtectedProps> = ({
  children,
  requiredRole,
  allowedRoles,
  redirectTo,
}) => {
  const { hasAccess, isLoading } = useRoleAccess({
    requiredRole,
    allowedRoles,
    redirectTo,
  });

  if (isLoading) {
    return (
      <div className="w-full p-4">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
};
