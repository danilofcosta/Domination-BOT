"use client"

import { NumberField as NumberFieldPrimitive } from "@base-ui/react"
import { cn } from "@/lib/utils"

const NumberField = NumberFieldPrimitive.Root

function NumberFieldGroup({
  className,
  ...props
}: NumberFieldPrimitive.Group.Props) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn(
        "border-input bg-card/80 focus-within:border-ring flex h-9 items-center overflow-hidden rounded-lg border transition-colors focus-within:ring-3 focus-within:ring-ring/40",
        className,
      )}
      {...props}
    />
  )
}

function NumberFieldInput({
  className,
  ...props
}: NumberFieldPrimitive.Input.Props) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      className={cn(
        "text-foreground bg-transparent w-full min-w-0 flex-1 px-2.5 py-1.5 text-sm tabular-nums outline-none",
        className,
      )}
      {...props}
    />
  )
}

function NumberFieldDecrement({
  className,
  ...props
}: NumberFieldPrimitive.Decrement.Props) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      aria-label="Diminuir"
      className={cn(
        "text-muted-foreground hover:bg-muted hover:text-foreground flex w-8 items-center justify-center self-stretch transition-colors disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <svg viewBox="0 0 10 6" className="size-2.5 fill-current">
        <path d="M1 6l4-4 4 4z" />
      </svg>
    </NumberFieldPrimitive.Decrement>
  )
}

function NumberFieldIncrement({
  className,
  ...props
}: NumberFieldPrimitive.Increment.Props) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-increment"
      aria-label="Aumentar"
      className={cn(
        "text-muted-foreground hover:bg-muted hover:text-foreground flex w-8 items-center justify-center self-stretch transition-colors disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <svg viewBox="0 0 10 6" className="size-2.5 fill-current">
        <path d="M1 0l4 4 4-4z" />
      </svg>
    </NumberFieldPrimitive.Increment>
  )
}

export {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldDecrement,
  NumberFieldIncrement,
}
