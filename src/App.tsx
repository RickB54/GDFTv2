
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "@/components/layout/NavBar";
import { ExerciseProvider } from "@/contexts/ExerciseContext";
import { WorkoutProvider } from "@/contexts/WorkoutContext";

import Index from "./pages/Index";
import Exercises from "./pages/Exercises";
import CreateExercise from "./pages/CreateExercise";
import CreateWorkout from "./pages/CreateWorkout";
import Workout from "./pages/Workout";
import Stats from "./pages/Stats";
import Calendar from "./pages/Calendar";
import MyCalendar from "./pages/MyCalendar";
import Settings from "./pages/Settings";
import CustomPlans from "./pages/CustomPlans";
import HealthMetrics from "./pages/HealthMetrics";
import BodyMetrics from "./pages/BodyMetrics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ExerciseProvider>
          <WorkoutProvider>
            <div className="bg-gym-darker min-h-screen text-white">
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/exercises" element={<Exercises />} />
                <Route path="/create-exercise" element={<CreateExercise />} />
                <Route path="/create-workout" element={<CreateWorkout />} />
                <Route path="/workout" element={<Workout />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/my-calendar" element={<MyCalendar />} />
                <Route path="/custom-plans" element={<CustomPlans />} />
                <Route path="/health-metrics" element={<HealthMetrics />} />
                <Route path="/body-metrics" element={<BodyMetrics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <NavBar />
            </div>
          </WorkoutProvider>
        </ExerciseProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
