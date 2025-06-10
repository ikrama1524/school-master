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
    .sort((a, b) => {
      const dateA = a.admissionDate ? new Date(a.admissionDate).getTime() : 0;
      const dateB = b.admissionDate ? new Date(b.admissionDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <div className="p-4 md:p-6 space-y-8 animate-fade-in">
      <div className="animate-slide-up">
        <StatsGrid stats={stats} isLoading={statsLoading} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="lg:col-span-2 space-y-6">
          <RecentStudents students={recentStudents} isLoading={studentsLoading} />
        </div>
        <div className="space-y-6">
          <QuickActions notices={notices} isLoading={noticesLoading} />
        </div>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <AttendanceOverview stats={stats} isLoading={statsLoading} />
      </div>
    </div>
  );
}
