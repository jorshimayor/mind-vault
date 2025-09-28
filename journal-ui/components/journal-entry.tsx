"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { PenTool, Save, Loader2, CheckCircle } from "lucide-react"

interface JournalEntry {
  id: string
  content: string
  mood: number
  date: string
  timestamp: string
  encrypted: boolean
}

interface JournalEntryProps {
  onSaveEntry: (entry: Omit<JournalEntry, "id">) => void
}

export function JournalEntryComponent({ onSaveEntry }: JournalEntryProps) {
  const [currentEntry, setCurrentEntry] = useState("")
  const [currentMood, setCurrentMood] = useState([5])
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wordCount, setWordCount] = useState(0)

  // Auto-save draft to localStorage
  useEffect(() => {
    const draft = localStorage.getItem("mind-vault-draft")
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setCurrentEntry(parsed.content || "")
        setCurrentMood([parsed.mood || 5])
      } catch (error) {
        console.log("Could not restore draft")
      }
    }
  }, [])

  useEffect(() => {
    const words = currentEntry
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    setWordCount(words.length)

    // Auto-save draft
    const draft = {
      content: currentEntry,
      mood: currentMood[0],
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("mind-vault-draft", JSON.stringify(draft))
  }, [currentEntry, currentMood])

  const handleSaveEntry = async () => {
    if (!currentEntry.trim()) return

    setIsSaving(true)

    // Simulate encryption and blockchain storage
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newEntry = {
      content: currentEntry,
      mood: currentMood[0],
      date: new Date().toISOString().split("T")[0],
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      encrypted: true,
    }

    onSaveEntry(newEntry)
    setCurrentEntry("")
    setCurrentMood([5])
    setLastSaved(new Date())
    setIsSaving(false)

    // Clear draft
    localStorage.removeItem("mind-vault-draft")
  }

  const getMoodLabel = (mood: number) => {
    if (mood <= 3) return "Challenging"
    if (mood <= 6) return "Peaceful"
    return "Radiant"
  }

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return "from-red-400/20 to-orange-400/20 border-red-400/30"
    if (mood <= 6) return "from-blue-400/20 to-purple-400/20 border-blue-400/30"
    return "from-green-400/20 to-emerald-400/20 border-green-400/30"
  }

  return (
    <Card className="p-6 bg-cosmic-card/80 backdrop-blur-sm border-cosmic-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-cosmic-accent/20">
              <PenTool className="w-5 h-5 text-cosmic-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-cosmic-foreground">New Entry</h3>
              <p className="text-sm text-cosmic-muted">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-cosmic-muted">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Entry Input */}
        <div>
          <label className="block text-sm font-medium text-cosmic-foreground mb-3">What's on your mind today?</label>
          <Textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="Let your thoughts flow like stardust across the cosmos... This is your private space, protected by zero-knowledge encryption."
            className="min-h-[200px] bg-cosmic-input border-cosmic-border text-cosmic-foreground placeholder:text-cosmic-muted resize-none focus:ring-2 focus:ring-cosmic-accent/50 transition-all duration-200"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2 text-xs text-cosmic-muted">
            <span>{wordCount} words</span>
            <span>{currentEntry.length}/1000 characters</span>
          </div>
        </div>

        {/* Mood Tracking */}
        <div>
          <label className="block text-sm font-medium text-cosmic-foreground mb-3">
            How are you feeling?
            <Badge className={`ml-2 bg-gradient-to-r ${getMoodColor(currentMood[0])} text-white`}>
              {currentMood[0]}/10 - {getMoodLabel(currentMood[0])}
            </Badge>
          </label>
          <div className="px-3">
            <Slider value={currentMood} onValueChange={setCurrentMood} max={10} min={1} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-cosmic-muted mt-2">
              <span>1 - Challenging</span>
              <span>5 - Peaceful</span>
              <span>10 - Radiant</span>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-cosmic-accent/10 rounded-lg border border-cosmic-accent/20">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-cosmic-accent rounded-full mt-2 animate-pulse"></div>
            <div>
              <h4 className="text-sm font-medium text-cosmic-foreground mb-1">Privacy Protected</h4>
              <p className="text-xs text-cosmic-muted leading-relaxed">
                Your entry will be encrypted locally before being stored on the Midnight blockchain. Only you can
                decrypt and read your thoughts.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSaveEntry}
          className="w-full bg-gradient-to-r from-cosmic-accent to-cosmic-gold hover:from-cosmic-accent/90 hover:to-cosmic-gold/90 text-white font-medium py-3 transition-all duration-200"
          disabled={!currentEntry.trim() || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Encrypting & Saving to Vault...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save to Vault
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
