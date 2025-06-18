import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StatsHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpPages = [
    {
        title: "How to Use the Stats Page",
        content: "This guide explains how to view and analyze your workout statistics. Use the arrows to navigate."
    },
    {
        title: "1. Summary Cards",
        content: "The cards at the top give you a quick overview of your key metrics:\n\n- Total Workouts: The total number of workouts you've completed.\n- Total Time: The combined duration of all your workouts.\n- Total Sets: The total number of sets across all workouts.\n- Total Reps: The total number of repetitions completed."
    },
    {
        title: "2. Workout History",
        content: "This section lists all your completed workouts, sorted by date. You can filter them using the date range picker.\n\n- Expand/Collapse: Click on a workout to see detailed stats for each exercise."
    },
    {
        title: "3. Workout Actions",
        content: "Each workout in the history has several actions available:\n\n- Re-run Workout (Play icon): Instantly start the same workout again.\n- View Graph (Bar chart icon): See a visual breakdown of the workout.\n- Edit Notes (Pencil icon): Add or modify notes for the workout.\n- Delete (Trash icon): Permanently remove the workout from your history."
    },
    {
        title: "4. History Management",
        content: "Use the buttons above the history list to manage your view:\n\n- Clean Up: Collapse all workouts older than one week.\n- Expand/Collapse All: Quickly show or hide details for all workouts in the current view."
    }
];

const StatsHelpPopup = ({ isOpen, onClose }: StatsHelpPopupProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const page = helpPages[currentPage];

  const handleNext = () => {
    if (currentPage < helpPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleClose = () => {
    setCurrentPage(0);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{page.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 min-h-[200px]">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                {page.content}
            </p>
        </div>
        <DialogFooter className="flex justify-between w-full">
          <Button variant="outline" onClick={handlePrev} disabled={currentPage === 0}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground flex items-center">
            {currentPage + 1} / {helpPages.length}
          </div>
          {currentPage < helpPages.length - 1 ? (
              <Button variant="outline" onClick={handleNext}>
                  <ArrowRight className="h-4 w-4" />
              </Button>
          ) : (
              <Button onClick={handleClose}>
                  Close
              </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatsHelpPopup;
