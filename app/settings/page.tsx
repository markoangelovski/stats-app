"use client";

import { useTransition, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StatSchema } from "@/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { getStats, newStat, deleteStat, updateStat } from "@/actions";
import { Skeleton } from "@/components/ui/skeleton";

type Stat = {
  name: string;
  description: string | null;
  label?: string | null;
  id?: string;
  dateCreated?: Date;
  dateModified?: Date | null;
  user_id?: string;
  measurementLabel?: string | null;
};

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState<Stat[]>([]);
  const [editingStatId, setEditingStatId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isStatsPending, setIsStatsPending] = useState(true);

  const newStatForm = useForm<z.infer<typeof StatSchema>>({
    resolver: zodResolver(StatSchema),
    defaultValues: {
      name: "",
      description: "",
      label: ""
    }
  });

  const updateStatForm = useForm<z.infer<typeof StatSchema>>({
    resolver: zodResolver(StatSchema),
    defaultValues: {
      name: "",
      description: "",
      label: ""
    }
  });

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUsername(e.target.value);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement username update logic
    console.log("Update username:", username);
  };

  const handleNewStatSubmit = async (values: z.infer<typeof StatSchema>) => {
    startTransition(async () => {
      const result = await newStat(values);
      if (typeof result === "object" && result.message) {
        setError(result.message);
      } else {
        setError("");
        fetchStats();
      }
    });
    newStatForm.reset();
  };

  const handleEditStat = async (stat: Stat) => {
    setEditingStatId(stat.id || "");
    updateStatForm.reset({
      name: stat.name,
      description: stat.description || "",
      label: stat.measurementLabel || ""
    });
  };

  const handleUpdateStat = async (data: z.infer<typeof StatSchema>) => {
    startTransition(async () => {
      const result = await updateStat(data, editingStatId!);
      if (typeof result === "object" && result.message) {
        setError(result.message);
      } else {
        setError("");
        fetchStats();
      }
    });
    setEditingStatId(null);
    updateStatForm.reset();
  };

  const handleDeleteStat = async (statId: string) => {
    try {
      const result = await deleteStat(statId);
      if (typeof result === "object" && result.message) {
        setError(result.message);
        return;
      }
      setStats((prevStats) => prevStats.filter((stat) => stat.id !== statId));
      setError("");
    } catch (error) {
      setError("Failed to delete stat");
    }
  };

  const handleCancelEdit = () => {
    setEditingStatId(null);
    updateStatForm.reset();
  };

  const fetchStats = async () => {
    setIsStatsPending(true);
    try {
      const result = await getStats();
      if (typeof result === "object" && result.message) {
        setError(result.message);
      } else {
        setStats(result.stats || []);
        setError("");
      }
    } catch (error) {
      setError("Failed to fetch stats");
    } finally {
      setIsStatsPending(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      {error && <p className="text-red-500">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Create a new Stat</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...newStatForm}>
            <form
              onSubmit={newStatForm.handleSubmit(handleNewStatSubmit)}
              className="space-y-4"
            >
              <FormField
                control={newStatForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="stat-name">Stat Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="stat-name"
                        placeholder="Example: Body weight"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newStatForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="stat-description">
                      Stat Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        id="stat-description"
                        placeholder="Example: T-shirt and sweatpants"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newStatForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="stat-label">Stat Label</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="stat-label"
                        placeholder="Example: kg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                {isPending ? "Creating..." : "Create Stat"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isStatsPending ? (
        <>
          <Skeleton className="rounded-xl h-48 w-full mb-4" />
          <Skeleton className="rounded-xl h-48 w-full" />
        </>
      ) : (
        stats.map((stat) => (
          <Card key={stat.id}>
            <CardHeader>
              <CardTitle>{stat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {editingStatId === stat.id ? (
                <Form {...updateStatForm}>
                  <form
                    onSubmit={updateStatForm.handleSubmit(handleUpdateStat)}
                    className="space-y-4"
                  >
                    <FormField
                      control={updateStatForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor={`edit-stat-name-${stat.id}`}>
                            Stat Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id={`edit-stat-name-${stat.id}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateStatForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            htmlFor={`edit-stat-description-${stat.id}`}
                          >
                            Stat Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              id={`edit-stat-description-${stat.id}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateStatForm.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor={`edit-stat-label-${stat.id}`}>
                            Stat Label
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id={`edit-stat-label-${stat.id}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-2">
                      <Button type="submit">Update Stat</Button>
                      <Button variant="secondary" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div>
                  <p>{stat.description}</p>
                  <p>Label: {stat.measurementLabel}</p>
                  <div className="flex space-x-2 mt-4">
                    <Button onClick={() => handleEditStat(stat)}>Edit</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Warning, this will delete the stat and all related
                            statistics. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteStat(stat.id || "")}
                            className="bg-red-600 hover:bg-red-700"
                          >
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
        ))
      )}

      <Card>
        <CardHeader>
          <CardTitle>Update Username</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">New Username</Label>
              <Input
                id="username"
                value={username}
                onChange={handleUsernameChange}
              />
            </div>
            <Button type="submit">Update Username</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
