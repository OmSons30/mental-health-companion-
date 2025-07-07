"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Calendar } from "lucide-react"

interface MoodEntry {
  id: string
  date: string
  mood: number
  journal: string
  timestamp: number
}

interface MoodHistoryProps {
  entries: MoodEntry[]
}

const moodLabels = {
  1: "Very Low",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
}

const moodColors = {
  1: "bg-red-100 text-red-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-green-100 text-green-800",
  5: "bg-emerald-100 text-emerald-800",
}

const moodEmojis = {
  1: "😔",
  2: "😕",
  3: "😐",
  4: "😊",
  5: "😄",
}

export function MoodHistory({ entries }: MoodHistoryProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            Mood History
          </CardTitle>
          <CardDescription>Your mood tracking journey will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No mood entries yet.</p>
            <p className="text-sm">Start by checking in above!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-500" />
          Mood History
        </CardTitle>
        <CardDescription>Your recent mood check-ins ({entries.length} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {entries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="p-3 border rounded-lg bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{moodEmojis[entry.mood as keyof typeof moodEmojis]}</span>
                    <Badge className={moodColors[entry.mood as keyof typeof moodColors]}>
                      {moodLabels[entry.mood as keyof typeof moodLabels]}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">{entry.date}</span>
                </div>
                {entry.journal && (
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded text-left">
                    {entry.journal.length > 100 ? `${entry.journal.substring(0, 100)}...` : entry.journal}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        {entries.length > 10 && (
          <div className="text-xs text-gray-500 text-center mt-4 pt-4 border-t">Showing 10 most recent entries</div>
        )}
      </CardContent>
    </Card>
  )
}
