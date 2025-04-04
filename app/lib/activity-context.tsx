"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (type: string, description: string) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Load activities from localStorage on mount
    const savedActivities = localStorage.getItem("activities");
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    }
  }, []);

  const addActivity = (type: string, description: string) => {
    const newActivity = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date().toISOString(),
    };

    const updatedActivities = [newActivity, ...activities].slice(0, 100); // Keep only last 100 activities
    setActivities(updatedActivities);
    localStorage.setItem("activities", JSON.stringify(updatedActivities));
  };

  return (
    <ActivityContext.Provider value={{ activities, addActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}
