import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[4px] border border-transparent bg-clip-padding text-xs font-medium tracking-wide whitespace-nowrap transition-all outline-none select-none focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2 disabled:pointer-events-none disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:border-none aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-[#024AD8] text-white border-none hover:bg-[#003198] active:bg-[#00226B]",
        outline:
          "border border-[#D1D1D1] bg-white text-[#1C1C1C] hover:bg-[#F7F7F7] hover:border-[#B0B0B0]",
        secondary:
          "border border-[#D1D1D1] bg-white text-[#1C1C1C] hover:bg-[#F7F7F7] hover:border-[#B0B0B0]",
        ghost:
          "bg-transparent text-[#024AD8] border-none hover:bg-[#EFF4FF]",
        destructive:
          "bg-[#D32F2F] text-white border-none hover:bg-[#B71C1C]",
        "destructive-secondary":
          "bg-transparent text-[#D32F2F] border border-[#FFCDD2] hover:bg-[#FFF2F2]",
        link: "text-[#024AD8] underline underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-6 has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
        xs: "h-7 gap-1 px-3 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 px-4 has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
        lg: "h-11 gap-1.5 px-8 has-data-[icon=inline-end]:pe-5 has-data-[icon=inline-start]:ps-5",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
