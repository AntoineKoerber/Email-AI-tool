import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LoadingChartProps {
  title?: string
  description?: string
  height?: string
}

export function LoadingChart({ title = "Loading...", description, height = "h-[400px]" }: LoadingChartProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700/50">
        <CardTitle className="text-white font-semibold">{title}</CardTitle>
        {description && <p className="text-slate-400 text-sm">{description}</p>}
      </CardHeader>
      <CardContent className="p-6">
        <div className={`${height} flex items-center justify-center`}>
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
            <p className="text-sm text-slate-400">Loading chart data...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
