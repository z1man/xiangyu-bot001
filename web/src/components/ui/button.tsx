import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Lively modern primary
        default:
          'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-sm shadow-indigo-600/20 hover:from-indigo-500 hover:to-fuchsia-500 active:scale-[0.99]',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.99]',
        outline:
          'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 active:scale-[0.99]',
        destructive:
          'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-red-600/20 hover:from-red-500 hover:to-rose-500 active:scale-[0.99]',
        ghost: 'text-slate-700 hover:bg-slate-100 active:scale-[0.99]',
        link: 'text-indigo-700 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3 rounded-lg',
        lg: 'h-11 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';
