import * as React from "react"
import { cn } from "cn"
import { cva, VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "h-9 w-full min-w-0 rounded-xl py-6 border border-transparent bg-input/50 px-3 py-1 text-base transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants:{
      variant: {
        default: "border border-input bg-background focus-visible:ring-ring focus-visible:ring-offset-2",
          filled: "border border-transparent bg-muted focus-visible:bg-background focus-visible:ring-ring",
          error: "border border-red-500 bg-red-50/20 text-red-900 placeholder:text-red-300 focus-visible:ring-red-500",
          ghost: "border-b border-input rounded-none bg-transparent px-0 focus-visible:border-primary focus-visible:ring-0",
        },
      size:{
        default: "h-10 px-3 py-2",
          sm: "h-8 px-2 text-xs",
          lg: "h-12 px-4 text-base",
        },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    }
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>,"size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement,InputProps>(
  ({ className, variant, size, type, ...props }, ref) => {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({variant,size,className}))}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";
export { Input }
