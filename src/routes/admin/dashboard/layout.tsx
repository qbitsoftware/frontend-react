import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RoleProtected } from '@/hooks/use-roles'
import { UserRoles } from '@/types/enums'

export const Route = createFileRoute('/admin/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <RoleProtected requiredRole={UserRoles.ROLE_ROOT_ADMIN} allowedRoles={[UserRoles.ROLE_ORG_ADMIN, UserRoles.ROLE_SOLO_ADMIN, UserRoles.ROLE_CLUB_ADMIN]} redirectTo='/admin/blog'>
            <Outlet />
        </RoleProtected>
    )
}
