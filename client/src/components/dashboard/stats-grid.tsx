import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsGridProps {
  stats?: {
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number;
    feeCollection: number;
    pendingFees: number;
  };
  isLoading: boolean;
}

export default function StatsGrid({ stats, isLoading }: StatsGridProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statsData = [
    {
      title: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      growth: "+12% from last month",
      icon: Users,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers.toString(),
      growth: "+3 new hires",
      icon: GraduationCap,
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary",
      gradient: "from-cyan-500 to-cyan-600",
    },
    {
      title: "Fee Collection",
      value: formatCurrency(stats.feeCollection),
      growth: "87% collected",
      icon: DollarSign,
      bgColor: "bg-accent/10",
      iconColor: "text-accent",
      gradient: "from-amber-500 to-amber-600",
    },
    {
      title: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      growth: "+2.1% today",
      icon: Calendar,
      bgColor: "bg-green-500/10",
      iconColor: "text-green-600",
      gradient: "from-green-500 to-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-[var(--edu-text)]">{stat.value}</p>
                  <p className="text-xs text-[var(--edu-secondary)] mt-1 flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {stat.growth}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-xl ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
