"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, BookOpen, Calendar, TrendingUp, LogIn, UserPlus, LogOut } from "lucide-react"
import { MoodHistory } from "@/components/mood-history"
import { ActivitySuggestions } from "@/components/activity-suggestions"
import { AuthModal } from "@/components/auth-modal"
import { apiService } from "@/lib/api"

interface MoodEntry {
  id: string
  date: string
  mood: number
  journal: string
  timestamp: number
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

export default function MentalHealthApp() {
  const [currentMood, setCurrentMood] = useState([3])
  const [journalEntry, setJournalEntry] = useState("")
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const user = await apiService.getCurrentUser()
          setIsAuthenticated(true)
          console.log("Authenticated user:", user)
        }
      } catch (error) {
        console.log("Not authenticated")
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  // Load mood entries from localStorage on component mount (fallback)
  useEffect(() => {
    const savedEntries = localStorage.getItem("moodEntries")
    if (savedEntries) {
      const entries = JSON.parse(savedEntries)
      setMoodEntries(entries)

      // Check if user has already checked in today
      const today = new Date().toDateString()
      const todayEntry = entries.find((entry: MoodEntry) => new Date(entry.timestamp).toDateString() === today)
      setHasCheckedInToday(!!todayEntry)
    }
  }, [])

  const handleMoodSubmit = async () => {
    setIsLoading(true)
    setError("")

    try {
      if (isAuthenticated) {
        // TODO: Save to backend API when mood tracking is implemented
        console.log("Saving mood to backend...")
      }

      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        mood: currentMood[0],
        journal: journalEntry,
        timestamp: Date.now(),
      }

      const updatedEntries = [newEntry, ...moodEntries]
      setMoodEntries(updatedEntries)
      localStorage.setItem("moodEntries", JSON.stringify(updatedEntries))

      setHasCheckedInToday(true)
      setJournalEntry("")
      setCurrentMood([3])
    } catch (error) {
      setError("Failed to save mood entry. Please try again.")
      console.error("Error saving mood:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = () => {
    setShowAuthModal(true)
  }

  const handleSignup = () => {
    setShowAuthModal(true)
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setShowAuthModal(false)
  }

  const todaysMood = moodEntries.find((entry) => new Date(entry.timestamp).toDateString() === new Date().toDateString())

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-gray-800">MindfulMoments</h1>
          </div>
          <p className="text-gray-600 text-lg">Your daily companion for mental wellness</p>
          
          {/* Authentication Status */}
          <div className="mt-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">
                  ✅ Connected to Backend
                </Badge>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <Button onClick={handleLogin} variant="outline" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button onClick={handleSignup} variant="outline" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Daily Check-in */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Daily Mood Check-in
              </CardTitle>
              <CardDescription>
                {hasCheckedInToday
                  ? "You've already checked in today! How are you feeling now?"
                  : "Take a moment to reflect on how you're feeling today"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {hasCheckedInToday && todaysMood && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-2">Today's mood:</p>
                  <Badge className={moodColors[todaysMood.mood as keyof typeof moodColors]}>
                    {moodLabels[todaysMood.mood as keyof typeof moodLabels]}
                  </Badge>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How are you feeling? ({moodLabels[currentMood[0] as keyof typeof moodLabels]})
                  </label>
                  <div className="px-3">
                    <Slider
                      value={currentMood}
                      onValueChange={setCurrentMood}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Very Low</span>
                      <span>Low</span>
                      <span>Okay</span>
                      <span>Good</span>
                      <span>Great</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's on your mind? (Optional)
                  </label>
                  <Textarea
                    placeholder="Share your thoughts, feelings, or what happened today..."
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <Button 
                  onClick={handleMoodSubmit} 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  size="lg"
                  disabled={isLoading}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Check-in"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Suggestions */}
          <ActivitySuggestions currentMood={currentMood[0]} />

          {/* Mood History */}
          <MoodHistory entries={moodEntries} />
        </div>

        {/* Quick Stats */}
        {moodEntries.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Your Wellness Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{moodEntries.length}</div>
                  <div className="text-sm text-gray-600">Check-ins</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length) * 10) /
                      10}
                  </div>
                  <div className="text-sm text-gray-600">Avg Mood</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {moodEntries.filter((entry) => entry.journal.length > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Journal Entries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.max(...moodEntries.map((entry) => entry.mood))}
                  </div>
                  <div className="text-sm text-gray-600">Best Day</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Authentication Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  )
}
