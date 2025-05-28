
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"
import { TournamentBlockData } from "@/types/test"

interface BlockConfigPanelProps {
  block: TournamentBlockData
  onUpdateConfig: (id: string, config: any) => void
  onUpdateTitle: (id: string, title: string) => void
  onClose: () => void
}

export default function BlockConfigPanel({ block, onUpdateConfig, onUpdateTitle, onClose }: BlockConfigPanelProps) {
  const [title, setTitle] = useState(block.title)
  const [config, setConfig] = useState(block.config || {})

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onUpdateConfig(block.id, newConfig)
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    onUpdateTitle(block.id, newTitle)
  }

  const renderConfigFields = () => {
    switch (block.type) {
      case "group":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupCount">Number of Groups</Label>
              <Input
                id="groupCount"
                type="number"
                min="1"
                max="16"
                value={config.groupCount || 4}
                onChange={(e) => handleConfigChange("groupCount", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="teamsPerGroup">Teams per Group</Label>
              <Input
                id="teamsPerGroup"
                type="number"
                min="2"
                max="8"
                value={config.teamsPerGroup || 4}
                onChange={(e) => handleConfigChange("teamsPerGroup", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="advanceCount">Teams Advancing</Label>
              <Input
                id="advanceCount"
                type="number"
                min="1"
                max={config.teamsPerGroup || 4}
                value={config.advanceCount || 2}
                onChange={(e) => handleConfigChange("advanceCount", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="roundRobin"
                checked={config.roundRobin || false}
                onCheckedChange={(checked) => handleConfigChange("roundRobin", checked)}
              />
              <Label htmlFor="roundRobin">Round Robin within groups</Label>
            </div>
          </div>
        )

      case "single-elimination":
      case "double-elimination":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamCount">Number of Teams</Label>
              <Input
                id="teamCount"
                type="number"
                min="4"
                max="128"
                value={config.teamCount || 16}
                onChange={(e) => handleConfigChange("teamCount", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="seeded"
                checked={config.seeded || true}
                onCheckedChange={(checked) => handleConfigChange("seeded", checked)}
              />
              <Label htmlFor="seeded">Seeded bracket</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="thirdPlace"
                checked={config.thirdPlace || false}
                onCheckedChange={(checked) => handleConfigChange("thirdPlace", checked)}
              />
              <Label htmlFor="thirdPlace">Third place match</Label>
            </div>
            {block.type === "double-elimination" && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="grandFinalReset"
                  checked={config.grandFinalReset || true}
                  onCheckedChange={(checked) => handleConfigChange("grandFinalReset", checked)}
                />
                <Label htmlFor="grandFinalReset">Grand final bracket reset</Label>
              </div>
            )}
          </div>
        )

      case "swiss":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamCount">Number of Teams</Label>
              <Input
                id="teamCount"
                type="number"
                min="4"
                max="64"
                value={config.teamCount || 16}
                onChange={(e) => handleConfigChange("teamCount", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="rounds">Number of Rounds</Label>
              <Input
                id="rounds"
                type="number"
                min="3"
                max="10"
                value={config.rounds || 5}
                onChange={(e) => handleConfigChange("rounds", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="acceleratedPairing"
                checked={config.acceleratedPairing || false}
                onCheckedChange={(checked) => handleConfigChange("acceleratedPairing", checked)}
              />
              <Label htmlFor="acceleratedPairing">Accelerated pairing</Label>
            </div>
          </div>
        )

      case "round-robin":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamCount">Number of Teams</Label>
              <Input
                id="teamCount"
                type="number"
                min="3"
                max="20"
                value={config.teamCount || 8}
                onChange={(e) => handleConfigChange("teamCount", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="doubleRoundRobin"
                checked={config.doubleRoundRobin || false}
                onCheckedChange={(checked) => handleConfigChange("doubleRoundRobin", checked)}
              />
              <Label htmlFor="doubleRoundRobin">Double round robin</Label>
            </div>
          </div>
        )

      case "ladder":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamCount">Number of Teams</Label>
              <Input
                id="teamCount"
                type="number"
                min="5"
                max="100"
                value={config.teamCount || 20}
                onChange={(e) => handleConfigChange("teamCount", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="challengeWindow">Challenge Window (days)</Label>
              <Input
                id="challengeWindow"
                type="number"
                min="1"
                max="30"
                value={config.challengeWindow || 7}
                onChange={(e) => handleConfigChange("challengeWindow", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="maxChallengeRange">Max Challenge Range</Label>
              <Input
                id="maxChallengeRange"
                type="number"
                min="1"
                max="10"
                value={config.maxChallengeRange || 3}
                onChange={(e) => handleConfigChange("maxChallengeRange", Number.parseInt(e.target.value))}
              />
            </div>
          </div>
        )

      default:
        return <div className="text-sm text-muted-foreground">No configuration options available</div>
    }
  }

  return (
    <div className="w-80 bg-background border-l p-4 overflow-y-auto">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Configure Block</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="blockTitle">Block Title</Label>
            <Input
              id="blockTitle"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter block title"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Settings</h4>
            {renderConfigFields()}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Block Info</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Type: {block.type}</div>
              <div>ID: {block.id}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
