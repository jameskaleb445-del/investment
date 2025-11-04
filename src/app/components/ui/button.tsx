import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/app/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1f] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#8b5cf6] text-white hover:bg-[#7c3aed]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-[#8b5cf6] bg-transparent text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white dark:border-[#8b5cf6] light:border-[#8b5cf6]",
        secondary:
          "theme-bg-tertiary text-[#8b5cf6] hover:bg-[#35353d] dark:hover:bg-[#35353d] light:hover:bg-gray-100",
        ghost: "hover:theme-bg-tertiary text-[#8b5cf6] dark:hover:bg-[#2d2d35] light:hover:bg-gray-100",
        link: "text-[#8b5cf6] underline-offset-4 hover:underline hover:text-[#7c3aed]",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
