import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
      color: {
        info: "",
        success: "",
        warning: "",
        error: "",
        violet: "",
        neutral: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
    compoundVariants: [
      {
        variant: "outline",
        color: "info",
        className:
          "bg-blue-50 text-blue-700 border-blue-200 [a&]:hover:bg-blue-200 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-400",
      },
      {
        variant: "outline",
        color: "success",
        className:
          "bg-green-50 text-green-700 border-green-200 [a&]:hover:bg-green-200 focus-visible:ring-green-200 dark:focus-visible:ring-green-400",
      },

      {
        variant: "outline",
        color: "warning",
        className:
          "bg-yellow-50 text-yellow-700 border-yellow-200 [a&]:hover:bg-yellow-200 focus-visible:ring-yellow-200 dark:focus-visible:ring-yellow-400",
      },
      {
        variant: "outline",
        color: "error",
        className:
          "bg-red-50 text-red-700 border-red-200 [a&]:hover:bg-red-200 focus-visible:ring-red-200 dark:focus-visible:ring-red-400",
      },
      {
        variant: "outline",
        color: "violet",
        className:
          "bg-violet-50 text-violet-700 border-violet-200 [a&]:hover:bg-violet-200 focus-visible:ring-violet-200 dark:focus-visible:ring-violet-400",
      },
      {
        variant: "outline",
        color: "neutral",
        className:
          "bg-neutral-50 text-neutral-700 border-neutral-200 [a&]:hover:bg-neutral-200 focus-visible:ring-neutral-200 dark:focus-visible:ring-neutral-400",
      },
    ],
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  color,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, color }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
