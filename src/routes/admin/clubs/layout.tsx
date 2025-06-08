import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RoleProtected } from '@/hooks/use-roles'
import { UserRoles } from '@/types/enums'

export const Route = createFileRoute('/admin/clubs')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoleProtected requiredRole={UserRoles.ROLE_ROOT_ADMIN} >
      <Outlet />
    </RoleProtected>
  )
}
