import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; description: string }[];
}

const FormProgress = ({ currentStep, totalSteps, steps }: FormProgressProps) => {
  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <div className="w-full">
      <Progress value={progress} className="h-2 mb-6" />
      
      <div className="hidden md:flex justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={index}
              className={`flex flex-col items-center flex-1 ${
                index < steps.length - 1 ? "relative" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  isCompleted
                    ? "gradient-primary text-primary-foreground shadow-soft"
                    : isCurrent
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center ${
                  isCurrent ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: Show current step */}
      <div className="md:hidden text-center">
        <span className="text-sm font-medium text-primary">
          Step {currentStep} of {totalSteps}
        </span>
        <p className="text-lg font-semibold text-foreground mt-1">
          {steps[currentStep - 1]?.title}
        </p>
      </div>
    </div>
  );
};

export default FormProgress;
