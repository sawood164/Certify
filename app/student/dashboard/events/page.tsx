"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  Users,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Load events from localStorage
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      const allEvents = JSON.parse(savedEvents);
      const upcomingEvents = allEvents.filter(
        (event: Event) => event.status === "Upcoming"
      );
      setEvents(upcomingEvents);
    }

    // Load user's registered events
    const savedRegistrations = localStorage.getItem("userEventRegistrations");
    if (savedRegistrations) {
      setRegisteredEvents(JSON.parse(savedRegistrations));
    }

    // Load user profile - check both userProfile and currentStudent
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      const savedProfile = localStorage.getItem(`profile_${userEmail}`);
      const currentStudent = localStorage.getItem("currentStudent");

      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else if (currentStudent) {
        setUserProfile(JSON.parse(currentStudent));
      }
    }
  }, []);

  const isEventPassed = (date: string) => {
    return new Date(date) < new Date();
  };

  const isRegistrationClosed = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const handleRegister = (event: Event) => {
    // Get latest user profile data
    const userEmail = localStorage.getItem("userEmail");
    let currentProfile = null;

    if (userEmail) {
      const savedProfile = localStorage.getItem(`profile_${userEmail}`);
      const currentStudent = localStorage.getItem("currentStudent");

      if (savedProfile) {
        currentProfile = JSON.parse(savedProfile);
      } else if (currentStudent) {
        currentProfile = JSON.parse(currentStudent);
      }
    }

    if (!currentProfile || !currentProfile.name || !currentProfile.email) {
      toast({
        title: "Profile Incomplete",
        description:
          "Please complete your profile in the Profile section before registering for events.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Create registration record
    const registration = {
      eventId: event.id,
      userId: currentProfile.id || userEmail,
      userName: currentProfile.name,
      userEmail: currentProfile.email,
      eventTitle: event.title,
      registrationDate: new Date().toISOString(),
      status: "Pending",
      department: currentProfile.department || "",
      registrationNumber: currentProfile.registrationNumber || "",
    };

    // Save to localStorage
    const updatedRegistrations = [...registeredEvents, event.id];
    setRegisteredEvents(updatedRegistrations);
    localStorage.setItem(
      "userEventRegistrations",
      JSON.stringify(updatedRegistrations)
    );

    // Save registration details
    const existingRegistrations = JSON.parse(
      localStorage.getItem("eventRegistrations") || "[]"
    );
    localStorage.setItem(
      "eventRegistrations",
      JSON.stringify([...existingRegistrations, registration])
    );

    // Calculate the payment deadline (15 minutes before event)
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    const paymentDeadline = new Date(eventDateTime.getTime() - 15 * 60000);

    // Show success toast with detailed information
    toast({
      title: "🎉 Registration Successful!",
      description: React.createElement("div", { className: "space-y-2" }, [
        React.createElement("p", { key: "title" }, [
          "You have successfully registered for ",
          React.createElement(
            "span",
            { className: "font-semibold", key: "event-name" },
            event.title
          ),
        ]),
        React.createElement(
          "div",
          {
            className: "mt-2 p-3 bg-secondary/20 rounded-md space-y-1 text-sm",
            key: "instructions",
          },
          [
            React.createElement("p", { key: "header" }, [
              React.createElement(
                "span",
                { className: "font-semibold" },
                "Important Instructions:"
              ),
            ]),
            React.createElement("p", { key: "venue" }, [
              "• Please visit ",
              React.createElement(
                "span",
                { className: "font-semibold" },
                event.venue
              ),
              " for fee payment",
            ]),
            React.createElement(
              "p",
              { key: "fee" },
              `• Registration Fee: ₹${event.registrationFee}`
            ),
            React.createElement(
              "p",
              { key: "deadline" },
              `• Complete payment before: ${paymentDeadline.toLocaleString()}`
            ),
            React.createElement(
              "p",
              { className: "text-yellow-400", key: "warning" },
              "⚠️ Please arrive 15 minutes before the event time"
            ),
          ]
        ),
      ]),
      duration: 10000,
    });
  };

  return (
    <div className="p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 rounded-lg p-8"
      >
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Upcoming Events</h1>
            <p className="text-white/60">
              Discover and register for exciting college events
            </p>
          </div>
        </div>
      </motion.div>

      {events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg text-white/60">No upcoming events</h3>
          <p className="text-sm text-white/40">
            Check back later for new events
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="h-full"
            >
              <Card className="h-full overflow-hidden bg-[#110C1D] border-white/10 hover:border-purple-500/50 transition-all">
                {event.imageUrl && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/600x400?text=Event+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#110C1D] to-transparent" />
                  </div>
                )}
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {event.title}
                    </h3>
                    <p className="text-white/60 line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/80">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Clock className="h-4 w-4 text-purple-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <MapPin className="h-4 w-4 text-purple-400" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <IndianRupee className="h-4 w-4 text-purple-400" />
                      <span>Registration Fee: ₹{event.registrationFee}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Users className="h-4 w-4 text-purple-400" />
                      <span>Organized by: {event.clubName}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    {isEventPassed(event.date) ? (
                      <Badge
                        variant="destructive"
                        className="w-full justify-center"
                      >
                        Event has ended
                      </Badge>
                    ) : isRegistrationClosed(event.registrationEndDate) ? (
                      <Badge
                        variant="destructive"
                        className="w-full justify-center"
                      >
                        Registration closed
                      </Badge>
                    ) : registeredEvents.includes(event.id) ? (
                      <div className="text-center space-y-2">
                        <Badge
                          variant="secondary"
                          className="w-full justify-center bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        >
                          Registered
                        </Badge>
                        <p className="text-white/40 text-xs">
                          Check your email for event details
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleRegister(event)}
                          className="w-full bg-purple-500 hover:bg-purple-600"
                        >
                          Register Now
                        </Button>
                        <p className="text-center text-white/40 text-xs">
                          Registration closes on {event.registrationEndDate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
