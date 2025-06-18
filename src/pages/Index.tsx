
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, ClipboardList, Dumbbell, SlidersHorizontal, HeartPulse, User, Plus, HelpCircle, LucideProps } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WorkoutTypeCard from '@/components/ui/WorkoutTypeCard';
import HomeHelpPopup from '@/components/ui/HomeHelpPopup';

interface HomeCardProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description: string;
  onClick: () => void;
  color: 'blue' | 'purple' | 'green' | 'red' | 'orange';
}

const HomeCard = ({ icon: Icon, title, description, onClick, color }: HomeCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    orange: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <div
      className="bg-gym-card p-4 rounded-lg flex items-center cursor-pointer transition-colors hover:bg-gym-dark-card h-full"
      onClick={onClick}
    >
      <div className={`p-3 rounded-lg mr-4 ${colorClasses[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};


const Index = () => {
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const workoutTypes = [
    { title: "Standard Weights", icon: Dumbbell, color: "blue", type: "Weights" },
    { title: "Slide Board", icon: SlidersHorizontal, color: "green", type: "Slide Board" },
    { title: "Cardio", icon: HeartPulse, color: "red", type: "Cardio" },
    { title: "No Equipment", icon: User, color: "purple", type: "No Equipment" },
  ];

  return (
    <div className="page-container page-transition pb-20">
      <HomeHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">GymDayFitTracker</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>

      <div className="space-y-4 mb-8">
        <HomeCard
          icon={BarChart}
          title="Monitor Progress"
          description="View your stats and body measurements"
          onClick={() => navigate('/stats')}
          color="blue"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HomeCard
            icon={ClipboardList}
            title="Create Plans"
            description="Build and follow custom workout plans"
            onClick={() => navigate('/custom-plans')}
            color="purple"
          />
          <HomeCard
            icon={ClipboardList}
            title="Your Custom Plans"
            description="View your saved workout plans"
            onClick={() => navigate('/custom-plans?showPlans=true')}
            color="green"
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Select Workout Type</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {workoutTypes.map((type) => (
          <WorkoutTypeCard
            key={type.title}
            title={type.title}
            icon={type.icon}
            color={type.color}
            onClick={() => navigate(`/create-workout?type=${type.type}`)}
          />
        ))}
      </div>

      <div className="space-y-4">
        <Button className="w-full bg-green-500 hover:bg-green-600" onClick={() => navigate('/create-workout?type=Custom')}>
          <Plus className="mr-2 h-4 w-4" /> Create A Custom Workout
        </Button>
        <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/workout')}>
          Show Custom Workouts
        </Button>
      </div>
    </div>
  );
};

export default Index;
