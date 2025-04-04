"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  Clock,
  IndianRupee,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActivity } from "@/lib/activity-context";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  clubName: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  imageUrl?: string;
  registrationFee: number;
  registrationEndDate: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    clubName: "",
    imageUrl: "",
    registrationFee: 0,
    registrationEndDate: "",
    status: "Upcoming" as "Upcoming" | "Completed" | "Cancelled",
  });
  const { toast } = useToast();
  const { addActivity } = useActivity();
  const [clubs, setClubs] = useState<
    { id: number; clubName: string; status: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Load clubs data from localStorage
    const savedClubs = localStorage.getItem("clubs");
    if (savedClubs) {
      setClubs(JSON.parse(savedClubs));
    }

    // Load events data from localStorage
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format the registration fee as a number
    const registrationFee = Number(formData.registrationFee);

    const newEvent: Event = {
      id: editingEvent?.id || Date.now().toString(),
      ...formData,
      registrationFee,
      status: formData.status || "Upcoming",
    };

    let updatedEvents;
    if (editingEvent) {
      updatedEvents = events.map((event) =>
        event.id === editingEvent.id ? newEvent : event
      );
    } else {
      updatedEvents = [...events, newEvent];
    }

    setEvents(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));
    setIsDialogOpen(false);

    // Reset form data
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      clubName: "",
      imageUrl: "",
      registrationFee: 0,
      registrationEndDate: "",
      status: "Upcoming",
    });
    setEditingEvent(null);

    // Record the activity
    addActivity(
      editingEvent ? "Event Updated" : "Event Added",
      `Event "${newEvent.title}" has been ${editingEvent ? "updated" : "added"}`
    );

    toast({
      title: editingEvent ? "Event Updated" : "Event Added",
      description: editingEvent
        ? "The event has been updated successfully"
        : "A new event has been added successfully",
    });
  };

  const handleDelete = (id: string) => {
    const eventToDelete = events.find((event) => event.id === id);
    const updatedEvents = events.filter((event) => event.id !== id);
    setEvents(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));

    // Record the activity
    if (eventToDelete) {
      addActivity(
        "Event Deleted",
        `Event "${eventToDelete.title}" has been deleted`
      );
    }

    toast({
      title: "Event Deleted",
      description: "The event has been deleted successfully",
    });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date || "",
      time: event.time || "",
      venue: event.venue,
      clubName: event.clubName,
      imageUrl: event.imageUrl || "",
      registrationFee: event.registrationFee || 0,
      registrationEndDate: event.registrationEndDate || "",
      status: event.status,
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = (
    id: string,
    status: "Upcoming" | "Completed" | "Cancelled"
  ) => {
    const updatedEvents = events.map((event) =>
      event.id === id ? { ...event, status } : event
    );
    setEvents(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));

    const eventUpdated = events.find((event) => event.id === id);

    // Record the activity
    if (eventUpdated) {
      addActivity(
        "Event Status Updated",
        `Status of "${eventUpdated.title}" changed to ${status}`
      );
    }

    toast({
      title: "Status Updated",
      description: `Event status changed to ${status}`,
    });
  };

  // Filter events based on search term
  const filteredEvents = events.filter((event) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.venue.toLowerCase().includes(searchLower) ||
      event.clubName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg p-8"
      >
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Events</h1>
            <p className="text-white/60">Create and manage college events</p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-1/3">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#110C1D] border-white/10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="border-b border-white/10 pb-4">
              <DialogTitle>
                {editingEvent ? "Edit Event" : "Add New Event"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh] overflow-y-auto px-1">
              <div className="py-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) =>
                        setFormData({ ...formData, venue: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clubName">Club Name</Label>
                    <Select
                      value={formData.clubName}
                      onValueChange={(value) =>
                        setFormData({ ...formData, clubName: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a club" />
                      </SelectTrigger>
                      <SelectContent>
                        {clubs
                          .filter((club) => club.status === "Active")
                          .map((club) => (
                            <SelectItem key={club.id} value={club.clubName}>
                              {club.clubName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                      <Input
                        id="imageUrl"
                        placeholder="https://example.com/image.jpg"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, imageUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationFee">
                        Registration Fee (₹)
                      </Label>
                      <Input
                        id="registrationFee"
                        type="number"
                        min="0"
                        value={formData.registrationFee}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registrationFee: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationEndDate">
                        Registration End Date
                      </Label>
                      <Input
                        id="registrationEndDate"
                        type="date"
                        value={formData.registrationEndDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registrationEndDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  {editingEvent && (
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(
                          value: "Upcoming" | "Completed" | "Cancelled"
                        ) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Upcoming">Upcoming</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button type="submit" className="w-full">
                    {editingEvent ? "Update Event" : "Add Event"}
                  </Button>
                </form>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {filteredEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg text-white/60">No events found</h3>
          <p className="text-sm text-white/40">
            Try a different search term or add a new event
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="h-full overflow-hidden bg-[#110C1D] border-white/10">
                {event.imageUrl && (
                  <div className="w-full h-40 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/600x400?text=Event+Image";
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <Badge
                      variant={
                        event.status === "Upcoming"
                          ? "default"
                          : event.status === "Completed"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {event.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {event.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <span>Registration Fee: ₹{event.registrationFee}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-white/5 pt-4">
                  <div className="text-xs text-white/60">
                    By: {event.clubName}
                  </div>
                  <div className="flex items-center gap-2">
                    {event.status === "Upcoming" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(event.id, "Completed")
                          }
                          className="h-8 px-2 text-green-400 hover:text-green-300 hover:bg-white/5"
                        >
                          Mark Complete
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(event.id, "Cancelled")
                          }
                          className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-white/5"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(event)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
