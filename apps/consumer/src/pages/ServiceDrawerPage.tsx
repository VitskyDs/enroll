import { useParams } from 'react-router-dom'

export default function ServiceDrawerPage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-6 border-t text-center">
      <p className="text-sm font-medium">Service drawer</p>
      <p className="text-xs text-muted-foreground">Service ID: {id}</p>
    </div>
  )
}
