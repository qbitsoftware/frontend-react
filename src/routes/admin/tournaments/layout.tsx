import { RoleProtected } from '@/hooks/use-roles'
import { UserRoles } from '@/types/enums'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/tournaments')({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <RoleProtected requiredRole={UserRoles.ROLE_ROOT_ADMIN} allowedRoles={[UserRoles.ROLE_ORG_ADMIN, UserRoles.ROLE_SOLO_ADMIN]} redirectTo='/admin/blog'>
      <Outlet />
    </RoleProtected>
  )
}
