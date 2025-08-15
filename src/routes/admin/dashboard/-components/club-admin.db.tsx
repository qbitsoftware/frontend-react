import { UserLogin } from '@/types/users';
import { Users, FileText, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminDashBoardBlogs from './latest-blogs';
import AdminDashBoardQuickActions from './quick-actions';
import AdminDashBoardFeedback from './feedback';

interface Props {
    user: UserLogin | null
}

export default function ClubAdminDashboard({ user }: Props) {
    const { t } = useTranslation();

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) {
            return t("admin.dashboard.greeting.good_morning");
        } else if (hour < 18) {
            return t("admin.dashboard.greeting.good_day");
        } else {
            return t("admin.dashboard.greeting.good_evening");
        }
    };

    const quickActions = [
        {
            title: t("admin.dashboard.quick_actions.manage_clubs"),
            description: t("admin.dashboard.quick_actions.manage_clubs_desc"),
            icon: Users,
            href: "/admin/clubs",
            color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
        },
        {
            title: t("admin.dashboard.quick_actions.new_blog"),
            description: t("admin.dashboard.quick_actions.new_blog_desc"),
            icon: FileText,
            href: "/admin/blog/new",
            color: "bg-green-50 hover:bg-green-100 border-green-200"
        },
        {
            title: t("admin.dashboard.quick_actions.manage_feedback"),
            description: t("admin.dashboard.quick_actions.manage_feedback_desc"),
            icon: MessageSquare,
            href: "/admin/feedback",
            color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
        },
        {
            title: t("admin.dashboard.quick_actions.view_blogs"),
            description: "View and manage all your blog posts",
            icon: FileText,
            href: "/admin/blog",
            color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Header */}
                <div className="rounded-lg  p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {getTimeBasedGreeting()}, {user?.username || 'Club Admin'}!
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                {t("admin.dashboard.welcome_subtitle")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <AdminDashBoardQuickActions quickActions={quickActions} />

                {/* My Clubs & Latest Blogs Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* My Clubs Card */}
                    {/* <AdminDashBoardClubWrapper /> */}

                    {/* Latest Blogs */}
                    <AdminDashBoardBlogs />
                </div>

                {/* Feedback Welcome Card */}
                <AdminDashBoardFeedback />

            </div>
        </div>
    );
}