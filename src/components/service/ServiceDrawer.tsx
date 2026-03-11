import { Drawer, DrawerContent } from '@/components/ui/drawer'

interface ServiceDrawerShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Fixed header — pass <DrawerHeader> from drawer-header.tsx */
  header: React.ReactNode
  /** Scrollable body content */
  children: React.ReactNode
}

export function ServiceDrawerShell({ open, onOpenChange, header, children }: ServiceDrawerShellProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        aria-describedby={undefined}
        className="max-w-[420px] mx-auto h-[90dvh] flex flex-col overflow-hidden"
      >
        {/* Fixed header */}
        <div className="shrink-0 px-6">{header}</div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 mt-6">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
