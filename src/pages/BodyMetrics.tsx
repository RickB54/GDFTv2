
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, PlusCircle, Weight, Ruler, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkout } from "@/contexts/WorkoutContext";
import { format } from "date-fns";
import BodyMetricsHelpPopup from "@/components/ui/BodyMetricsHelpPopup";

const BodyMetrics = () => {
  const navigate = useNavigate();
  const { bodyMeasurements, addBodyMeasurement } = useWorkout();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="page-container pb-24">
      <BodyMetricsHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate("/stats")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Body Metrics</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Measurement
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-gym-card rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Body Measurement</h2>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            // Implementation for adding new measurement would go here
            setShowAddForm(false);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full p-2 rounded bg-gym-dark border border-gray-700"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Weight (lbs)</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded bg-gym-dark border border-gray-700"
                  placeholder="185"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Body Fat %</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded bg-gym-dark border border-gray-700"
                  placeholder="15"
                />
              </div>
            </div>
            
            <h3 className="text-md font-medium mt-4">Measurements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Chest (in)</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded bg-gym-dark border border-gray-700"
                  placeholder="42"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Waist (in)</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded bg-gym-dark border border-gray-700"
                  placeholder="34"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Arms (in)</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded bg-gym-dark border border-gray-700"
                  placeholder="14"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Thighs (in)</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded bg-gym-dark border border-gray-700"
                  placeholder="24"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Measurement
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Measurements history */}
      <div className="space-y-4">
        {bodyMeasurements && bodyMeasurements.length > 0 ? (
          bodyMeasurements.map((measurement) => (
            <div key={measurement.id} className="bg-gym-card rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">{formatDate(measurement.date)}</h3>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {measurement.weight && (
                  <div className="flex items-center">
                    <Weight className="h-4 w-4 mr-2 text-primary" />
                    <div>
                      <span className="text-gray-400 text-xs">Weight</span>
                      <p>{measurement.weight} lbs</p>
                    </div>
                  </div>
                )}
                
                {measurement.chest && (
                  <div className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-primary" />
                    <div>
                      <span className="text-gray-400 text-xs">Chest</span>
                      <p>{measurement.chest}"</p>
                    </div>
                  </div>
                )}
                
                {measurement.waist && (
                  <div className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-primary" />
                    <div>
                      <span className="text-gray-400 text-xs">Waist</span>
                      <p>{measurement.waist}"</p>
                    </div>
                  </div>
                )}
                
                {measurement.biceps && (
                  <div className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-primary" />
                    <div>
                      <span className="text-gray-400 text-xs">Arms</span>
                      <p>{measurement.biceps}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gym-card rounded-lg">
            <Weight className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-medium mb-2">No measurements yet</h3>
            <p className="text-gray-400 mb-4">Start tracking your progress by adding your first body measurement</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center mx-auto"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add First Measurement
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyMetrics;
