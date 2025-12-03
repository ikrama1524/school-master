
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search, UserPlus } from "lucide-react";

export default function Teachers() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["/api/teachers"],
  });

  if (isLoading) {
    return <div className="p-6">Loading teachers...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-gray-600">Manage teaching staff</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher List</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teachers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No teachers found</p>
              </div>
            ) : (
              teachers.map((teacher: any) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {teacher.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{teacher.name}</h3>
                      <p className="text-sm text-gray-500">
                        {teacher.subject || 'No subject'} • {teacher.employeeId}
                      </p>
                    </div>
                  </div>
                  <Badge>{teacher.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
