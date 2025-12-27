
import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  variant?: 'default' | 'destructive' | 'warning'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, variant = 'default', ...props }, ref) => {
    const getVariantStyle = () => {
      switch (variant) {
        case 'destructive':
          return 'bg-destructive'
        case 'warning':
          return 'bg-amber-500'
        default:
          return 'bg-primary'
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 transition-all",
            getVariantStyle()
          )}
          style={{
            transform: `translateX(-${100 - (value || 0)}%)`,
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
