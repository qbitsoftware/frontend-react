import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RoleProtected } from '@/hooks/use-roles'
import { UserRoles } from '@/types/enums'

export const Route = createFileRoute('/admin/blog')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoleProtected requiredRole={UserRoles.ROLE_ROOT_ADMIN} allowedRoles={[UserRoles.ROLE_MEDIA_ADMIN, UserRoles.ROLE_CLUB_ADMIN]} >
      <Outlet />
    </RoleProtected>

  )
}
