import { useLogout } from "@/queries/users"
import { Button } from "./button"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { useRouter } from "@tanstack/react-router"
import { useUser } from "@/providers/userProvider"


interface AuthButtonProps {
    className?: string
}

export const AuthButton: React.FC<AuthButtonProps> = ({ className }) => {
    const { t } = useTranslation()
    const router = useRouter()
    const logout = useLogout()
    const { user, setUser } = useUser()

    const handleLogout = async () => {
        try {
            setUser(null)
            router.navigate({
                to: "/",
                replace: true,
            });
            await logout.mutateAsync()
        } catch (error) {
            console.error(error)
        }
    }

    if (user?.role.includes("admin")) {
        return <Button variant="ghost" className="rounded-[6px]" onClick={handleLogout}>{t('navbar.logout')}</Button>
    } else {
        return (
            <Link to="/login">
                <Button variant="ghost" className={cn("rounded-[6px] text-stone-700", className)}>{t('navbar.login')}</Button>
            </Link>
        )
    }
}