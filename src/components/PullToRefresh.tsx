import { RefreshCw } from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const PullToRefresh = ({
  onRefresh,
  children,
  className,
  disabled = false,
}: PullToRefreshProps) => {
  const { isRefreshing, pullDistance, progress } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    disabled,
  });

  return (
    <div className={cn("relative", className)}>
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center pointer-events-none z-10 transition-opacity duration-200"
        style={{
          top: -40,
          transform: `translateY(${pullDistance}px)`,
          opacity: progress > 0.1 ? 1 : 0,
        }}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-lg",
            isRefreshing && "bg-primary/20"
          )}
        >
          <RefreshCw
            className={cn(
              "w-5 h-5 text-primary transition-transform duration-200",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: isRefreshing
                ? "rotate(0deg)"
                : `rotate(${progress * 180}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content with pull effect */}
      <div
        style={{
          transform: `translateY(${pullDistance * 0.3}px)`,
          transition: pullDistance === 0 ? "transform 0.3s ease-out" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};
