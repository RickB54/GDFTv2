
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "@/components/layout/NavBar";
import { ExerciseProvider } from "@/contexts/ExerciseContext";
import { WorkoutProvider } from "@/contexts/WorkoutContext";
import { SettingsProvider } from './contexts/SettingsContext'; 

import Index from "./pages/Index";
import Exercises from "./pages/Exercises";
import CreateExercise from "./pages/CreateExercise";
import CreateWorkout from "./pages/CreateWorkout";
import Workout from "./pages/Workout";
import Stats from "./pages/Stats";
import Calendar from "./pages/Calendar";
import MyCalendar from "./pages/MyCalendar";
// Make sure SettingsPage is imported if you have it, or Settings if that's the correct component
import SettingsPage from "./pages/Settings"; // Or './pages/SettingsPage' if that's the actual file name
import CustomPlans from "./pages/CustomPlans";
import HealthMetrics from "./pages/HealthMetrics";
import BodyMetricsPage from "./pages/BodyMetricsPage";
import NotFound from "./pages/NotFound";
// Assuming Header and Footer components exist and are imported if used
// import Header from '@/components/layout/Header'; 
// import Footer from '@/components/layout/Footer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsProvider> { /* SettingsProvider should wrap BrowserRouter or its contents */ }
          <BrowserRouter>
            <ExerciseProvider>
              <WorkoutProvider>
                <div className="bg-gym-darker min-h-screen text-white flex flex-col">
                  {/* <Header /> You might have a Header component here */}
                  <main className="flex-grow container mx-auto px-4 py-2 md:py-4">
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
                      <Route path="/body-metrics" element={<BodyMetricsPage />} />
                      <Route path="/settings" element={<SettingsPage />} /> {/* Ensure this component exists */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <NavBar /> { /* NavBar might be part of the main layout or at the bottom */}
                  {/* <Footer /> You might have a Footer component here */}
                </div>
                <Toaster /> { /* Toasters can often be outside the main div but within providers */}
                <Sonner />
              </WorkoutProvider>
            </ExerciseProvider>
          </BrowserRouter>
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
