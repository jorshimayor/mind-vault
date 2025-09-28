"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Moon, Star, Settings, Share2, Award, Calendar, BarChart3, Edit2, Save, X } from "lucide-react"
import { JournalEntryComponent } from "@/components/journal-entry"
import { MoodChart } from "@/components/mood-chart"
import { ThemeToggle } from "@/components/theme-toggle"
import { Textarea } from "@/components/ui/textarea"

interface JournalEntry {
  id: string
  content: string
  mood: number
  date: string
  timestamp: string
  encrypted: boolean
}

export default function MindVault() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("mind-vault-entries")
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries))
      } catch (error) {
        console.log("Could not load saved entries")
      }
    } else {
      // Add sample entries for demo
      const sampleEntries: JournalEntry[] = [
        {
          id: "sample-1",
          content:
            "Today was a peaceful day. I spent time in nature and felt connected to the universe. The stars seemed brighter tonight.",
          mood: 7,
          date: "2025-09-27",
          timestamp: "14:30",
          encrypted: true,
        },
        {
          id: "sample-2",
          content: "Feeling a bit overwhelmed with work today. Need to remember to take breaks and breathe.",
          mood: 4,
          date: "2025-09-26",
          timestamp: "09:15",
          encrypted: true,
        },
        {
          id: "sample-3",
          content: "Had an amazing conversation with a friend. Feeling grateful for the connections in my life.",
          mood: 8,
          date: "2025-09-25",
          timestamp: "19:45",
          encrypted: true,
        },
        {
          id: "sample-4",
          content: "Meditation session went well this morning. Starting the day with intention and clarity.",
          mood: 6,
          date: "2025-09-24",
          timestamp: "07:00",
          encrypted: true,
        },
        {
          id: "sample-5",
          content: "Challenging day but I'm learning to be more patient with myself. Growth takes time.",
          mood: 5,
          date: "2025-09-23",
          timestamp: "21:30",
          encrypted: true,
        },
      ]
      setEntries(sampleEntries)
    }
  }, [])

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem("mind-vault-entries", JSON.stringify(entries))
    }
  }, [entries])

  const handleSaveEntry = (entryData: Omit<JournalEntry, "id">) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    setEntries((prev) => [newEntry, ...prev])
  }

  const handleEditEntry = (entryId: string, currentContent: string) => {
    setEditingEntry(entryId)
    setEditContent(currentContent)
  }

  const handleSaveEdit = (entryId: string) => {
    setEntries((prev) => prev.map((entry) => (entry.id === entryId ? { ...entry, content: editContent } : entry)))
    setEditingEntry(null)
    setEditContent("")
  }

  const handleCancelEdit = () => {
    setEditingEntry(null)
    setEditContent("")
  }

  const badges = [
    { id: 1, name: "First Light", description: "First journal entry", earned: entries.length > 0 },
    { id: 2, name: "Stellar Week", description: "7-day streak", earned: false },
    { id: 3, name: "Cosmic Month", description: "30-day streak", earned: false },
    { id: 4, name: "Mood Tracker", description: "Track 10 different moods", earned: entries.length >= 5 },
    {
      id: 5,
      name: "Deep Thinker",
      description: "Write 1000+ words",
      earned: entries.some((e) => e.content.length > 200),
    },
    { id: 6, name: "Consistent", description: "5 entries logged", earned: entries.length >= 5 },
  ]

  const getAverageMood = () => {
    if (entries.length === 0) return 0
    const sum = entries.reduce((acc, entry) => acc + entry.mood, 0)
    return Math.round((sum / entries.length) * 10) / 10
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background dark:from-cosmic-deep dark:via-cosmic-mid dark:to-cosmic-light">
      <div className="fixed inset-0 overflow-hidden pointer-events-none dark:block hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cosmic-accent rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-cosmic-gold rounded-full animate-pulse opacity-40 delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cosmic-accent rounded-full animate-pulse opacity-50 delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-cosmic-gold rounded-full animate-pulse opacity-30 delay-3000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4 relative">
            <div className="absolute right-0">
              <ThemeToggle />
            </div>
            <div className="relative">
              <Moon className="w-8 h-8 text-primary dark:text-cosmic-accent" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary dark:bg-cosmic-gold rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-muted-foreground dark:from-cosmic-accent dark:to-cosmic-gold bg-clip-text text-transparent">
              Mind Vault
            </h1>
          </div>
          <p className="text-muted-foreground dark:text-cosmic-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Your private sanctuary for thoughts and reflections, protected by zero-knowledge privacy
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary dark:text-cosmic-accent">{entries.length}</div>
              <div className="text-sm text-muted-foreground dark:text-cosmic-muted">Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary dark:text-cosmic-gold">{getAverageMood()}/10</div>
              <div className="text-sm text-muted-foreground dark:text-cosmic-muted">Avg Mood</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary dark:text-cosmic-accent">
                {badges.filter((b) => b.earned).length}
              </div>
              <div className="text-sm text-muted-foreground dark:text-cosmic-muted">Badges</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-card/50 dark:bg-cosmic-card/50 backdrop-blur-sm">
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              <span className="hidden sm:inline">Journal</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Journal Tab */}
          <TabsContent value="journal" className="space-y-6">
            <JournalEntryComponent onSaveEntry={handleSaveEntry} />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {entries.length === 0 ? (
              <Card className="p-12 text-center bg-card/50 dark:bg-cosmic-card/50 backdrop-blur-sm border-border dark:border-cosmic-border">
                <Star className="w-12 h-12 text-muted-foreground dark:text-cosmic-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground dark:text-cosmic-foreground mb-2">
                  No entries yet
                </h3>
                <p className="text-muted-foreground dark:text-cosmic-muted">
                  Start your journey by writing your first entry
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {entries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="p-6 bg-card/80 dark:bg-cosmic-card/80 backdrop-blur-sm border-border dark:border-cosmic-border hover:bg-card/90 dark:hover:bg-cosmic-card/90 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="bg-primary/20 dark:bg-cosmic-accent/20 text-primary dark:text-cosmic-accent border-primary/30 dark:border-cosmic-accent/30"
                        >
                          Mood: {entry.mood}/10
                        </Badge>
                        <span className="text-sm text-muted-foreground dark:text-cosmic-muted">
                          {entry.date} at {entry.timestamp}
                        </span>
                        {entry.encrypted && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            Encrypted
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground dark:text-cosmic-muted hover:text-primary dark:hover:text-cosmic-accent"
                          onClick={() => handleEditEntry(entry.id, entry.content)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground dark:text-cosmic-muted hover:text-primary dark:hover:text-cosmic-accent"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {editingEntry === entry.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[100px] bg-input dark:bg-cosmic-input border-border dark:border-cosmic-border"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(entry.id)}
                            className="bg-primary dark:bg-cosmic-accent text-primary-foreground dark:text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-foreground dark:text-cosmic-foreground leading-relaxed">{entry.content}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <MoodChart entries={entries} />
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <Card
                  key={badge.id}
                  className={`p-6 text-center transition-all duration-300 hover:scale-105 ${
                    badge.earned
                      ? "bg-gradient-to-br from-primary/20 to-accent/20 dark:from-cosmic-gold/20 dark:to-cosmic-accent/20 border-primary/50 dark:border-cosmic-gold/50"
                      : "bg-card/50 dark:bg-cosmic-card/50 border-border dark:border-cosmic-border opacity-60"
                  }`}
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      badge.earned
                        ? "bg-gradient-to-br from-primary to-accent dark:from-cosmic-gold dark:to-cosmic-accent"
                        : "bg-muted/30 dark:bg-cosmic-muted/30"
                    }`}
                  >
                    <Award
                      className={`w-8 h-8 ${badge.earned ? "text-white" : "text-muted-foreground dark:text-cosmic-muted"}`}
                    />
                  </div>
                  <h3 className="font-semibold text-foreground dark:text-cosmic-foreground mb-2">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground dark:text-cosmic-muted">{badge.description}</p>
                  {badge.earned && (
                    <Badge className="mt-3 bg-primary/20 dark:bg-cosmic-gold/20 text-primary dark:text-cosmic-gold border-primary/30 dark:border-cosmic-gold/30">
                      Earned
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6 bg-card/80 dark:bg-cosmic-card/80 backdrop-blur-sm border-border dark:border-cosmic-border">
              <h3 className="text-lg font-semibold text-foreground dark:text-cosmic-foreground mb-4">
                Privacy & Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-input dark:bg-cosmic-input rounded-lg border border-border dark:border-cosmic-border">
                  <div>
                    <h4 className="font-medium text-foreground dark:text-cosmic-foreground">
                      Zero-Knowledge Encryption
                    </h4>
                    <p className="text-sm text-muted-foreground dark:text-cosmic-muted">
                      Your entries are encrypted locally
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-input dark:bg-cosmic-input rounded-lg border border-border dark:border-cosmic-border">
                  <div>
                    <h4 className="font-medium text-foreground dark:text-cosmic-foreground">Midnight Blockchain</h4>
                    <p className="text-sm text-muted-foreground dark:text-cosmic-muted">Connected to testnet</p>
                  </div>
                  <Badge className="bg-primary/20 dark:bg-cosmic-accent/20 text-primary dark:text-cosmic-accent border-primary/30 dark:border-cosmic-accent/30">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-input dark:bg-cosmic-input rounded-lg border border-border dark:border-cosmic-border">
                  <div>
                    <h4 className="font-medium text-foreground dark:text-cosmic-foreground">Local Storage</h4>
                    <p className="text-sm text-muted-foreground dark:text-cosmic-muted">
                      {entries.length} entries stored locally
                    </p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {(JSON.stringify(entries).length / 1024).toFixed(1)}KB
                  </Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
