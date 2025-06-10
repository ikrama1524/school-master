import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, GraduationCap, DollarSign, BarChart, ChevronRight } from "lucide-react";
import { Notice } from "@shared/schema";
import StudentModal from "@/components/modals/student-modal";
import TeacherModal from "@/components/modals/teacher-modal";

interface QuickActionsProps {
  notices: Notice[];
  isLoading: boolean;
}

export default function QuickActions({ notices, isLoading }: QuickActionsProps) {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  const quickActions = [
    {
      title: "Add Student",
      icon: UserPlus,
      bgColor: "bg-[var(--edu-light-blue)]",
      iconBgColor: "bg-[var(--edu-primary)]",
      hoverColor: "hover:bg-blue-100",
      onClick: () => setIsStudentModalOpen(true),
    },
    {
      title: "Add Teacher",
      icon: GraduationCap,
      bgColor: "bg-[var(--edu-light-green)]",
      iconBgColor: "bg-[var(--edu-secondary)]",
      hoverColor: "hover:bg-green-100",
      onClick: () => setIsTeacherModalOpen(true),
    },
    {
      title: "Collect Fees",
      icon: DollarSign,
      bgColor: "bg-[var(--edu-light-orange)]",
      iconBgColor: "bg-[var(--edu-accent)]",
      hoverColor: "hover:bg-orange-100",
      onClick: () => {}, // Navigate to fees page
    },
    {
      title: "Generate Report",
      icon: BarChart,
      bgColor: "bg-gray-50",
      iconBgColor: "bg-gray-600",
      hoverColor: "hover:bg-gray-100",
      onClick: () => {}, // Navigate to reports page
    },
  ];

  return (
    <>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-[var(--edu-text)]">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className={`w-full flex items-center justify-between p-4 ${action.bgColor} ${action.hoverColor} rounded-lg transition-colors group h-auto`}
                onClick={action.onClick}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${action.iconBgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white h-5 w-5" />
                  </div>
                  <span className="font-medium text-[var(--edu-text)]">{action.title}</span>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors h-4 w-4" />
              </Button>
            );
          })}
        </CardContent>
        
        {/* Notice Board */}
        <div className="border-t border-gray-200 p-6">
          <h4 className="text-md font-semibold text-[var(--edu-text)] mb-4">Recent Notices</h4>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-3 border-l-4 border-gray-200 rounded">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {notices.slice(0, 2).map((notice) => (
                <div
                  key={notice.id}
                  className={`p-3 border-l-4 rounded ${
                    notice.priority === 'high' 
                      ? 'bg-yellow-50 border-yellow-400' 
                      : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <p className={`text-sm font-medium ${
                    notice.priority === 'high' 
                      ? 'text-yellow-800' 
                      : 'text-blue-800'
                  }`}>
                    {notice.title}
                  </p>
                  <p className={`text-xs mt-1 ${
                    notice.priority === 'high' 
                      ? 'text-yellow-600' 
                      : 'text-blue-600'
                  }`}>
                    {new Date(notice.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              ))}
              {notices.length === 0 && (
                <p className="text-gray-500 text-sm">No recent notices</p>
              )}
            </div>
          )}
        </div>
      </Card>

      <StudentModal 
        isOpen={isStudentModalOpen} 
        onClose={() => setIsStudentModalOpen(false)} 
      />
      <TeacherModal 
        isOpen={isTeacherModalOpen} 
        onClose={() => setIsTeacherModalOpen(false)} 
      />
    </>
  );
}
