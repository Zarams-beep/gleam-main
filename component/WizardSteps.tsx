"use client"

type WizardStepsProps = {
  steps: string[];
  current: number; // 1-indexed
};

// Shared step-progress indicator — used by the sign-up wizard and the
// forgot/reset-password pages so multi-step auth flows look consistent.
export default function WizardSteps({ steps, current }: WizardStepsProps) {
  return (
    <div className="flex items-center w-full mb-8" role="list" aria-label="Progress">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <div key={label} className={`flex items-center ${stepNum !== steps.length ? "flex-1" : ""}`}>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors duration-300
                  ${done ? "bg-accent text-white" : active ? "bg-primary text-white" : "bg-neutral-100 text-neutral-300"}`}
              >
                {done ? "✓" : stepNum}
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap hidden sm:block transition-colors duration-300
                  ${active ? "text-primary" : done ? "text-accent" : "text-neutral-300"}`}
              >
                {label}
              </span>
            </div>
            {stepNum !== steps.length && (
              <div className={`flex-1 h-[2px] mx-3 rounded transition-colors duration-300 ${done ? "bg-accent" : "bg-neutral-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
