
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search, Eye, Trash2, UserPlus } from "lucide-react";
import { apiRequest, queryClient } from "../lib/queryClient";

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  if (isLoading) {
    return <div className="p-6">Loading students...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-gray-600">Manage student information and records</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No students found</p>
              </div>
            ) : (
              students.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{student.name}</h3>
                      <p className="text-sm text-gray-500">
                        {student.class} • {student.rollNumber}
                      </p>
                    </div>
                  </div>
                  <Badge>{student.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
