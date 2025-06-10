import { useQuery } from "@tanstack/react-query";
import StatsGrid from "@/components/dashboard/stats-grid";
import RecentStudents from "@/components/dashboard/recent-students";
import QuickActions from "@/components/dashboard/quick-actions";
import AttendanceOverview from "@/components/dashboard/attendance-overview";
import { Student, Notice } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: notices = [], isLoading: noticesLoading } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });

  const recentStudents = students
    .sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime())
    .slice(0, 3);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <StatsGrid stats={stats} isLoading={statsLoading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentStudents students={recentStudents} isLoading={studentsLoading} />
        </div>
        <QuickActions notices={notices} isLoading={noticesLoading} />
      </div>

      <AttendanceOverview stats={stats} isLoading={statsLoading} />
    </div>
  );
}
