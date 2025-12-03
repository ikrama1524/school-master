import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceOverviewProps {
  stats?: {
    totalStudents: number;
    attendanceRate: number;
    feeCollection: number;
    pendingFees: number;
  };
  isLoading: boolean;
}

export default function AttendanceOverview({ stats, isLoading }: AttendanceOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 rounded-lg">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
              <div className="text-center p-4 rounded-lg">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
            </div>
            <Skeleton className="h-2 w-full mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const presentStudents = Math.floor((stats.attendanceRate / 100) * stats.totalStudents);
  const absentStudents = stats.totalStudents - presentStudents;
  const totalTarget = stats.feeCollection + stats.pendingFees;
  const collectionRate = Math.round((stats.feeCollection / totalTarget) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-[var(--edu-text)]">
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-[var(--edu-light-green)] rounded-lg">
              <p className="text-2xl font-bold text-[var(--edu-secondary)]">
                {presentStudents.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Present</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {absentStudents.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Absent</p>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[var(--edu-secondary)] h-2 rounded-full" 
              style={{ width: `${stats.attendanceRate}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {stats.attendanceRate}% Attendance Rate
          </p>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-[var(--edu-text)]">
            Fee Collection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Target</span>
              <span className="font-semibold">
                {formatCurrency(totalTarget)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Collected</span>
              <span className="font-semibold text-[var(--edu-secondary)]">
                {formatCurrency(stats.feeCollection)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(stats.pendingFees)}
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-3">
              <div 
                className="bg-[var(--edu-secondary)] h-3 rounded-full" 
                style={{ width: `${collectionRate}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-600">
              {collectionRate}% Collection Rate
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
