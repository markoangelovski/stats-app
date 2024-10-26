'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Mock data for demonstration
const mockStats = [
  { id: 1, name: "Body Weight", description: "Daily body weight measurement", label: "kg" },
  { id: 2, name: "Supplement Intake", description: "Number of supplement tablets taken daily", label: "tablets" },
]

export default function SettingsPage() {
  const [username, setUsername] = useState('')
  const [statName, setStatName] = useState('')
  const [statDescription, setStatDescription] = useState('')
  const [statLabel, setStatLabel] = useState('')
  const [stats, setStats] = useState(mockStats)
  const [editingStatId, setEditingStatId] = useState<number | null>(null)

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)
  const handleStatNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setStatName(e.target.value)
  const handleStatDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setStatDescription(e.target.value)
  const handleStatLabelChange = (e:  React.ChangeEvent<HTMLInputElement>) => setStatLabel(e.target.value)

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement username update logic
    console.log('Update username:', username)
  }

  const handleNewStatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement new stat creation logic
    console.log('New stat:', { name: statName, description: statDescription, label: statLabel })
    setStatName('')
    setStatDescription('')
    setStatLabel('')
  }

  const handleEditStat = (stat: typeof mockStats[0]) => {
    setEditingStatId(stat.id)
    setStatName(stat.name)
    setStatDescription(stat.description)
    setStatLabel(stat.label)
  }

  const handleUpdateStat = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement stat update logic
    console.log('Update stat:', { id: editingStatId, name: statName, description: statDescription, label: statLabel })
    setEditingStatId(null)
    setStatName('')
    setStatDescription('')
    setStatLabel('')
  }

  const handleDeleteStat = (statId: number) => {
    // TODO: Implement stat deletion logic
    console.log('Delete stat:', statId)
    setStats(stats.filter(stat => stat.id !== statId))
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Stat</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNewStatSubmit} className="space-y-4">
            <div>
              <Label htmlFor="stat-name">Stat Name</Label>
              <Input id="stat-name" value={statName} onChange={handleStatNameChange} placeholder="Example: Body weight" />
            </div>
            <div>
              <Label htmlFor="stat-description">Stat Description</Label>
              <Textarea id="stat-description" value={statDescription} onChange={handleStatDescriptionChange} placeholder="Example: T-shirt and sweatpants" />
            </div>
            <div>
              <Label htmlFor="stat-label">Stat Label</Label>
              <Input id="stat-label" value={statLabel} onChange={handleStatLabelChange} placeholder="Example: kg" />
            </div>
            <Button type="submit">Create Stat</Button>
          </form>
        </CardContent>
      </Card>

      {stats.map(stat => (
        <Card key={stat.id}>
          <CardHeader>
            <CardTitle>{stat.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {editingStatId === stat.id ? (
              <form onSubmit={handleUpdateStat} className="space-y-4">
                <div>
                  <Label htmlFor={`edit-stat-name-${stat.id}`}>Stat Name</Label>
                  <Input id={`edit-stat-name-${stat.id}`} value={statName} onChange={handleStatNameChange} />
                </div>
                <div>
                  <Label htmlFor={`edit-stat-description-${stat.id}`}>Stat Description</Label>
                  <Textarea id={`edit-stat-description-${stat.id}`} value={statDescription} onChange={handleStatDescriptionChange} />
                </div>
                <div>
                  <Label htmlFor={`edit-stat-label-${stat.id}`}>Stat Label</Label>
                  <Input id={`edit-stat-label-${stat.id}`} value={statLabel} onChange={handleStatLabelChange} />
                </div>
                <Button type="submit">Update Stat</Button>
              </form>
            ) : (
              <div>
                <p>{stat.description}</p>
                <p>Label: {stat.label}</p>
                <div className="flex space-x-2 mt-4">
                  <Button onClick={() => handleEditStat(stat)}>Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Warning, this will delete the stat and all related statistics. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteStat(stat.id)} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Update Username</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">New Username</Label>
              <Input id="username" value={username} onChange={handleUsernameChange} />
            </div>
            <Button type="submit">Update Username</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}