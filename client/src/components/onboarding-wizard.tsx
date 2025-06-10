import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  PlayCircle 
} from "lucide-react";
import { Link } from "wouter";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  action: string;
  route?: string;
  completed?: boolean;
}

const workflowSteps: WorkflowStep[] = [
  {
    id: "setup-school",
    title: "School Setup Complete",
    description: "Your school management system is ready to use with sample data",
    icon: CheckCircle,
    action: "Already configured",
    completed: true,
  },
  {
    id: "add-students",
    title: "Add Students",
    description: "Start by adding student records to your system",
    icon: Users,
    action: "Add first students",
    route: "/students",
  },
  {
    id: "add-teachers",
    title: "Add Teachers",
    description: "Add your teaching staff with their qualifications and subjects",
    icon: GraduationCap,
    action: "Add teaching staff",
    route: "/teachers",
  },
  {
    id: "setup-attendance",
    title: "Track Attendance",
    description: "Monitor daily student attendance with automated tracking",
    icon: Calendar,
    action: "View attendance",
    route: "/attendance",
  },
  {
    id: "manage-fees",
    title: "Fee Management",
    description: "Set up fee structures and track payment collections",
    icon: DollarSign,
    action: "Manage fees",
    route: "/fees",
  },
];

export default function OnboardingWizard({ isOpen, onClose }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = workflowSteps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleActionClick = (step: WorkflowStep) => {
    onClose();
  };

  const currentStepData = workflowSteps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PlayCircle className="h-6 w-6 text-[var(--edu-primary)]" />
            <span>School Management Setup Workflow</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step Card */}
          <Card className="border-2 border-[var(--edu-primary)]/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[var(--edu-light-blue)] rounded-full flex items-center justify-center mb-4">
                <Icon className="h-8 w-8 text-[var(--edu-primary)]" />
              </div>
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              {currentStepData.completed && (
                <Badge className="mx-auto bg-[var(--edu-secondary)] text-white">
                  Completed
                </Badge>
              )}
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">{currentStepData.description}</p>
              {currentStepData.route ? (
                <Link href={currentStepData.route}>
                  <Button
                    onClick={() => handleActionClick(currentStepData)}
                    className="bg-[var(--edu-primary)] hover:bg-[var(--edu-primary)]/90 text-white"
                  >
                    {currentStepData.action}
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => handleActionClick(currentStepData)}
                  className="bg-[var(--edu-primary)] hover:bg-[var(--edu-primary)]/90 text-white"
                  disabled={currentStepData.completed}
                >
                  {currentStepData.action}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* All Steps Overview */}
          <div className="space-y-3">
            <h4 className="font-medium text-[var(--edu-text)]">Workflow Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {workflowSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = step.completed || index < currentStep;
                
                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      isActive 
                        ? 'border-[var(--edu-primary)] bg-[var(--edu-light-blue)]' 
                        : isCompleted
                        ? 'border-[var(--edu-secondary)] bg-[var(--edu-light-green)]'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive 
                          ? 'bg-[var(--edu-primary)]' 
                          : isCompleted
                          ? 'bg-[var(--edu-secondary)]'
                          : 'bg-gray-400'
                      }`}>
                        <StepIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-gray-500">{step.action}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={onClose}>
                Skip Workflow
              </Button>
              
              {currentStep < totalSteps - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-[var(--edu-primary)] hover:bg-[var(--edu-primary)]/90 text-white"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={onClose}
                  className="bg-[var(--edu-secondary)] hover:bg-[var(--edu-secondary)]/90 text-white"
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}