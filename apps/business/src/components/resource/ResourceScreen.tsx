import React from 'react'
import { Plus, Search } from 'lucide-react'

interface ResourceScreenProps<T extends { id: string }> {
  title: string
  items: T[]
  /** Total count before search/filter — used to distinguish true-empty from no-results */
  hasAnyItems?: boolean
  isLoading?: boolean
  error?: string | null
  onAdd: () => void
  renderItem: (item: T) => React.ReactNode
  // Empty state (no items at all)
  emptyIcon: React.ReactNode
  emptyHeading: string
  emptySubtext: string
  emptyCtaLabel: string
  emptySecondaryActions?: React.ReactNode
  // Populated state
  toolbar?: React.ReactNode
  filterTabs?: React.ReactNode
}

export function ResourceScreen<T extends { id: string }>({
  title,
  items,
  hasAnyItems,
  isLoading = false,
  error = null,
  onAdd,
  renderItem,
  emptyIcon,
  emptyHeading,
  emptySubtext,
  emptyCtaLabel,
  emptySecondaryActions,
  toolbar,
  filterTabs,
}: ResourceScreenProps<T>) {
  const hasItems = hasAnyItems ?? items.length > 0
  const isEmpty = !isLoading && !error && !hasItems
  const isNoResults = !isLoading && !error && hasItems && items.length === 0
  const isPopulated = !isLoading && !error && items.length > 0

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto pb-28 lg:pb-6">
      <div className="flex flex-col w-full max-w-4xl mx-auto">

        {/* Page header */}
        <div className="bg-white flex items-center gap-2 overflow-clip pb-4 pt-safe px-4 lg:px-6 w-full">
          <p className="flex-1 text-2xl font-semibold text-zinc-950 tracking-tight leading-tight">
            {title}
          </p>
          <button
            className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center shrink-0"
            onClick={onAdd}
            aria-label={`Add ${title.toLowerCase()}`}
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col px-4 lg:px-6 pt-6 gap-6">

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-zinc-500 text-center">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col gap-12">
              {/* Icon + text + CTA */}
              <div className="flex flex-col gap-4 items-center px-4 py-8">
                <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                  {emptyIcon}
                </div>
                <div className="flex flex-col gap-1 items-center text-center w-full">
                  <p className="text-sm font-medium text-zinc-900 leading-5">{emptyHeading}</p>
                  <p className="text-sm text-zinc-500 leading-5">{emptySubtext}</p>
                </div>
                <button
                  className="w-full h-9 bg-zinc-900 text-white text-sm font-medium rounded-lg"
                  onClick={onAdd}
                >
                  {emptyCtaLabel}
                </button>
              </div>

              {/* Secondary actions slot */}
              {emptySecondaryActions && (
                <div className="flex flex-col gap-2">
                  {emptySecondaryActions}
                </div>
              )}
            </div>
          )}

          {/* No-results state (has items, but none match current search/filter) */}
          {isNoResults && (
            <div className="flex flex-col gap-2">
              {(toolbar || filterTabs) && (
                <>
                  {toolbar}
                  {filterTabs}
                </>
              )}
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-zinc-600" />
                </div>
                <p className="text-base font-medium text-zinc-900 text-center">
                  No matching {title.toLowerCase()} found
                </p>
              </div>
            </div>
          )}

          {/* Populated state */}
          {isPopulated && (
            <div className="flex flex-col gap-6">
              {/* Toolbar + filter tabs */}
              {(toolbar || filterTabs) && (
                <div className="flex flex-col gap-2">
                  {toolbar}
                  {filterTabs}
                </div>
              )}

              {/* Item list with dividers */}
              <div className="flex flex-col">
                {items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {index > 0 && <div className="h-px bg-zinc-100" />}
                    {renderItem(item)}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
