"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, RefreshCw } from "lucide-react"

interface Activity {
  id: string
  title: string
  description: string
  category: string
  duration: string
  difficulty: "Easy" | "Medium" | "Hard"
}

interface ActivitySuggestionsProps {
  currentMood: number
}

const activityDatabase: Record<number, Activity[]> = {
  1: [
    {
      id: "1",
      title: "Gentle Breathing Exercise",
      description: "Simple 4-7-8 breathing technique to help calm your mind",
      category: "Mindfulness",
      duration: "5 min",
      difficulty: "Easy",
    },
    {
      id: "2",
      title: "Listen to Calming Music",
      description: "Put on some soft, instrumental music and just listen",
      category: "Self-care",
      duration: "10-30 min",
      difficulty: "Easy",
    },
    {
      id: "3",
      title: "Reach Out to Someone",
      description: "Call or text a trusted friend or family member",
      category: "Connection",
      duration: "15-30 min",
      difficulty: "Medium",
    },
  ],
  2: [
    {
      id: "4",
      title: "Take a Warm Bath",
      description: "Run a warm bath with some relaxing scents",
      category: "Self-care",
      duration: "20-30 min",
      difficulty: "Easy",
    },
    {
      id: "5",
      title: "Write in a Journal",
      description: "Express your thoughts and feelings on paper",
      category: "Reflection",
      duration: "15-20 min",
      difficulty: "Easy",
    },
    {
      id: "6",
      title: "Watch Something Comforting",
      description: "Put on a favorite show or movie that makes you feel better",
      category: "Entertainment",
      duration: "30-60 min",
      difficulty: "Easy",
    },
  ],
  3: [
    {
      id: "7",
      title: "Go for a Short Walk",
      description: "Step outside for some fresh air and light movement",
      category: "Exercise",
      duration: "15-30 min",
      difficulty: "Easy",
    },
    {
      id: "8",
      title: "Practice Gratitude",
      description: "Write down 3 things you're grateful for today",
      category: "Mindfulness",
      duration: "10 min",
      difficulty: "Easy",
    },
    {
      id: "9",
      title: "Organize a Small Space",
      description: "Tidy up your desk or a drawer to feel more in control",
      category: "Productivity",
      duration: "20-30 min",
      difficulty: "Medium",
    },
  ],
  4: [
    {
      id: "10",
      title: "Try a New Recipe",
      description: "Cook or bake something you've never made before",
      category: "Creativity",
      duration: "45-60 min",
      difficulty: "Medium",
    },
    {
      id: "11",
      title: "Call a Friend",
      description: "Reach out to someone you haven't talked to in a while",
      category: "Connection",
      duration: "20-45 min",
      difficulty: "Easy",
    },
    {
      id: "12",
      title: "Learn Something New",
      description: "Watch a tutorial or read about a topic that interests you",
      category: "Learning",
      duration: "30-45 min",
      difficulty: "Medium",
    },
  ],
  5: [
    {
      id: "13",
      title: "Plan Something Fun",
      description: "Organize an activity or outing for the near future",
      category: "Planning",
      duration: "20-30 min",
      difficulty: "Medium",
    },
    {
      id: "14",
      title: "Help Someone Else",
      description: "Volunteer or do something kind for another person",
      category: "Service",
      duration: "30-60 min",
      difficulty: "Medium",
    },
    {
      id: "15",
      title: "Start a Creative Project",
      description: "Begin drawing, writing, crafting, or another creative pursuit",
      category: "Creativity",
      duration: "45-90 min",
      difficulty: "Hard",
    },
  ],
}

const difficultyColors = {
  Easy: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Hard: "bg-red-100 text-red-800",
}

export function ActivitySuggestions({ currentMood }: ActivitySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const generateSuggestions = async () => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const moodActivities = activityDatabase[currentMood] || activityDatabase[3]
    const shuffled = [...moodActivities].sort(() => Math.random() - 0.5)
    setSuggestions(shuffled.slice(0, 3))

    setIsLoading(false)
  }

  useEffect(() => {
    generateSuggestions()
  }, [currentMood])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Activity Suggestions
        </CardTitle>
        <CardDescription>Personalized activities based on your current mood</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={generateSuggestions}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="w-full bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Generating..." : "Get New Suggestions"}
          </Button>

          {suggestions.map((activity) => (
            <div key={activity.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{activity.title}</h4>
                <Badge className={difficultyColors[activity.difficulty]}>{activity.difficulty}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{activity.category}</span>
                <span>{activity.duration}</span>
              </div>
            </div>
          ))}

          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Suggestions are personalized based on your mood level
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
