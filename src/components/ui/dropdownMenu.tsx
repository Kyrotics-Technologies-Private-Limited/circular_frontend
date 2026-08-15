import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement | null>
  align?: "start" | "end"
  className?: string
  children: React.ReactNode
}

export function DropdownMenu({
  open,
  onClose,
  triggerRef,
  align = "end",
  className,
  children,
}: DropdownMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [pos, setPos] = React.useState({ top: 0, left: 0 })

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const menu = menuRef.current
    const menuWidth = menu?.offsetWidth ?? 0
    const menuHeight = menu?.offsetHeight ?? 0
    const gap = 8
    let top = rect.bottom + gap
    let left = align === "end" ? rect.right - menuWidth : rect.left
    if (top + menuHeight > window.innerHeight - gap) {
      top = Math.max(gap, rect.top - menuHeight - gap)
    }
    if (left < gap) left = gap
    if (left + menuWidth > window.innerWidth - gap) {
      left = window.innerWidth - menuWidth - gap
    }
    setPos({ top, left })
  }, [open, align, triggerRef])

  React.useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return
      if (triggerRef.current?.contains(e.target as Node)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose, triggerRef])

  if (!open) return null

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      className={cn(
        "fixed z-50 min-w-[10rem] rounded-xl shadow-lg bg-popover border border-border p-1.5 animate-scale-in",
        className
      )}
      style={{ top: pos.top, left: pos.left }}
    >
      {children}
    </div>,
    document.body
  )
}
