import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  loading?: boolean
}

export function StatCard({ title, value, description, icon: Icon, trend = "neutral", loading = false }: StatCardProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {loading ? <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" /> : value}
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <p className="text-xs text-slate-400">{description}</p>
          {trend !== "neutral" && !loading && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                trend === "up"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30",
              )}
            >
              {trend === "up" ? "↗" : "↘"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
