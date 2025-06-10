import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, ArrowRight, Users, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Student, Teacher } from "@shared/schema";

interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  dueDate?: Date;
  estimatedTime: string;
  category: "setup" | "daily" | "weekly" | "monthly";
}

export default function WorkflowAssistant() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: teachers = [] } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  useEffect(() => {
    // Generate intelligent workflow recommendations based on current data
    const generatedTasks: WorkflowTask[] = [];

    // Setup tasks for new systems
    if (students.length < 10) {
      generatedTasks.push({
        id: "bulk-student-import",
        title: "Import Student Records",
        description: "Import remaining student records to complete enrollment",
        priority: "high",
        status: "pending",
        estimatedTime: "30 minutes",
        category: "setup",
      });
    }

    if (teachers.length < 5) {
      generatedTasks.push({
        id: "teacher-onboarding",
        title: "Complete Teacher Onboarding",
        description: "Add remaining teaching staff with qualifications",
        priority: "high",
        status: "pending",
        estimatedTime: "45 minutes",
        category: "setup",
      });
    }

    // Daily operational tasks
    generatedTasks.push({
      id: "daily-attendance",
      title: "Record Daily Attendance",
      description: "Mark attendance for all active students",
      priority: "high",
      status: "pending",
      dueDate: new Date(),
      estimatedTime: "15 minutes",
      category: "daily",
    });

    // Weekly tasks
    const today = new Date();
    if (today.getDay() === 1) { // Monday
      generatedTasks.push({
        id: "weekly-reports",
        title: "Generate Weekly Reports",
        description: "Create attendance and performance reports",
        priority: "medium",
        status: "pending",
        estimatedTime: "20 minutes",
        category: "weekly",
      });
    }

    // Monthly tasks
    if (today.getDate() <= 7) { // First week of month
      generatedTasks.push({
        id: "fee-collection",
        title: "Monthly Fee Collection",
        description: "Process and track monthly fee payments",
        priority: "high",
        status: "pending",
        estimatedTime: "1 hour",
        category: "monthly",
      });
    }

    setTasks(generatedTasks);
  }, [students.length, teachers.length]);

  const handleTaskAction = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === "pending" ? "in-progress" : "completed" }
        : task
    ));
  };

  const filteredTasks = selectedCategory === "all" 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in-progress": return <Clock className="h-5 w-5 text-blue-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[var(--edu-text)]">
            Workflow Assistant
          </CardTitle>
          <div className="text-sm text-gray-500">
            {completedTasks}/{totalTasks} completed
          </div>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {["all", "setup", "daily", "weekly", "monthly"].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-gray-500">All tasks completed! Great work!</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--edu-text)]">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority} priority
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Est. {task.estimatedTime}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-red-600">
                            Due today
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={task.status === "completed" ? "ghost" : "default"}
                    onClick={() => handleTaskAction(task.id)}
                    disabled={task.status === "completed"}
                    className="ml-4"
                  >
                    {task.status === "completed" ? (
                      "Completed"
                    ) : task.status === "in-progress" ? (
                      "Mark Complete"
                    ) : (
                      <>
                        Start Task
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Stats */}
        <div className="border-t pt-4 mt-4">
          <h5 className="font-medium text-[var(--edu-text)] mb-3">System Overview</h5>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-[var(--edu-primary)]" />
              <div>
                <p className="text-sm font-medium">{students.length} Students</p>
                <p className="text-xs text-gray-500">Enrolled</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-[var(--edu-secondary)]" />
              <div>
                <p className="text-sm font-medium">{teachers.length} Teachers</p>
                <p className="text-xs text-gray-500">Active Staff</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}