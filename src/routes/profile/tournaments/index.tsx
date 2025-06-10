import { Button } from '@/components/ui/button';
import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowRight,
  Award,
  Bell,
  Calendar,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

export const Route = createFileRoute('/profile/tournaments/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500 rounded-full opacity-5 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-500 rounded-full opacity-5 blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-500 rounded-full opacity-5 blur-2xl" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8 border border-blue-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span>Under Development</span>
          </div>

          {/* Main Icon */}
          <div className="relative mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-200">
              <Trophy className="w-12 h-12" />
            </div>

            {/* Floating mini icons */}
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white shadow-md">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-md">
              <Award className="w-4 h-4" />
            </div>
          </div>

          {/* Main Content */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Tournament History
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Coming Soon
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            We're building an amazing tournament history experience where you
            can track your performance, view past competitions, and analyze your
            progress over time.
          </p>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                id: 1,
                icon: Target,
                title: 'Performance Analytics',
                description:
                  'Track your wins, losses, and improvement over time',
              },
              {
                id: 2,
                icon: Zap,
                title: 'Match History',
                description: 'Detailed records of all your tournament matches',
              },
              {
                id: 3,
                icon: Users,
                title: 'Achievement System',
                description: 'Unlock badges and celebrate your milestones',
              },
            ].map((feature) => (
              <div
                key={feature.id}
                className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Floating background elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-500 rounded-full opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 px-8 py-4"
            >
              <Bell className="w-5 h-5 mr-2" />
              Notify Me When Ready
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="group bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 px-8 py-4"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Browse Active Tournaments
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Timeline indicator */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600" />
                <span>In Development</span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Expected Q2 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
