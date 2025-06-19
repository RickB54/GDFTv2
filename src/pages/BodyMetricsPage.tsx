import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { toast } from '@/hooks/use-toast'; // Ensure use-toast is correctly imported
import { ChevronLeft, ChevronRight, Upload, Trash2 } from 'lucide-react'; // Import icons
import { useNavigate } from 'react-router-dom';
import StatsHelpPopup from '@/components/ui/StatsHelpPopup'; // Import StatsHelpPopup
import { useSettings, UnitSystem } from '@/contexts/SettingsContext'; // Add this import

interface MeasurementValue {
  value: string;
  unit: 'cm' | 'in' | 'kg' | 'lbs' | '%'; // Expanded units
}

interface MeasurementsState {
  chest: MeasurementValue;
  waist: MeasurementValue;
  hipsGlutes: MeasurementValue;
  bicepsUnflexed: MeasurementValue;
  bicepsFlexed: MeasurementValue;
  tricepsUnflexed: MeasurementValue;
  tricepsFlexed: MeasurementValue;
  forearms: MeasurementValue;
  calves: MeasurementValue;
  neck: MeasurementValue;
  shoulders: MeasurementValue;
  thighs: MeasurementValue;
  weight: MeasurementValue; // Added weight as an example
  bodyFatPercentage: MeasurementValue; // Added bodyFatPercentage as an example
  [key: string]: MeasurementValue; // Index signature
}

interface ImageObject {
  url: string;
  title: string;
  description: string;
}

const initialMeasurementValue: MeasurementValue = { value: '', unit: 'in' }; // Default to 'in'

const initialMeasurements: MeasurementsState = {
  chest: { ...initialMeasurementValue },
  waist: { ...initialMeasurementValue },
  hipsGlutes: { ...initialMeasurementValue },
  bicepsUnflexed: { ...initialMeasurementValue },
  bicepsFlexed: { ...initialMeasurementValue },
  tricepsUnflexed: { ...initialMeasurementValue },
  tricepsFlexed: { ...initialMeasurementValue },
  forearms: { ...initialMeasurementValue },
  calves: { ...initialMeasurementValue },
  neck: { ...initialMeasurementValue },
  shoulders: { ...initialMeasurementValue },
  thighs: { ...initialMeasurementValue },
  weight: { value: '', unit: 'lbs' }, // Default unit for weight to lbs
  bodyFatPercentage: { value: '', unit: '%' }, // Default unit for body fat
};

// Helper function to get default unit based on global setting and measurement type
const getDefaultUnit = (key: keyof MeasurementsState, globalUnitSystem: UnitSystem): 'cm' | 'in' | 'kg' | 'lbs' | '%' => {
  if (key === 'weight') {
    return globalUnitSystem === 'imperial' ? 'lbs' : 'kg';
  }
  if (key === 'bodyFatPercentage') {
    return '%';
  }
  return globalUnitSystem === 'imperial' ? 'in' : 'cm';
};

const BodyMetricsPage = () => {
  const navigate = useNavigate();
  const { unitSystem } = useSettings(); // Use settings context

  // Adjust initialMeasurements to respect global settings
  const [measurements, setMeasurements] = useState<MeasurementsState>(() => {
    const initial: MeasurementsState = {
        chest: { value: '', unit: getDefaultUnit('chest', unitSystem) },
        waist: { value: '', unit: getDefaultUnit('waist', unitSystem) },
        hipsGlutes: { value: '', unit: getDefaultUnit('hipsGlutes', unitSystem) },
        bicepsUnflexed: { value: '', unit: getDefaultUnit('bicepsUnflexed', unitSystem) },
        bicepsFlexed: { value: '', unit: getDefaultUnit('bicepsFlexed', unitSystem) },
        tricepsUnflexed: { value: '', unit: getDefaultUnit('tricepsUnflexed', unitSystem) },
        tricepsFlexed: { value: '', unit: getDefaultUnit('tricepsFlexed', unitSystem) },
        forearms: { value: '', unit: getDefaultUnit('forearms', unitSystem) },
        calves: { value: '', unit: getDefaultUnit('calves', unitSystem) },
        neck: { value: '', unit: getDefaultUnit('neck', unitSystem) },
        shoulders: { value: '', unit: getDefaultUnit('shoulders', unitSystem) },
        thighs: { value: '', unit: getDefaultUnit('thighs', unitSystem) },
        weight: { value: '', unit: getDefaultUnit('weight', unitSystem) },
        bodyFatPercentage: { value: '', unit: getDefaultUnit('bodyFatPercentage', unitSystem) },
    };
    return initial;
  });

  const [userImages, setUserImages] = useState<ImageObject[]>([]);
  const [diagramImages, setDiagramImages] = useState<ImageObject[]>([]);
  const [currentUserImageIndex, setCurrentUserImageIndex] = useState<number>(0);
  const [currentDiagramImageIndex, setCurrentDiagramImageIndex] = useState<number>(0);
  const [isHelpPopupOpen, setIsHelpPopupOpen] = useState(false); // State for help popup

  useEffect(() => {
    const savedData = localStorage.getItem('bodyMetricsData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Merge saved measurements with initialMeasurements based on current unitSystem
      const mergedMeasurements = { ...measurements }; // Start with current state which respects unitSystem
      for (const key in parsedData.measurements) {
        if (parsedData.measurements.hasOwnProperty(key) && key in mergedMeasurements) {
            // If units differ, ideally convert. For now, we'll take the saved value and unit.
            // A more robust solution would convert values if the global unit system changed since last save.
            mergedMeasurements[key as keyof MeasurementsState] = parsedData.measurements[key];
        }
      }
      setMeasurements(mergedMeasurements);
      setUserImages(parsedData.userImages || []);
      setDiagramImages(parsedData.diagramImages || []);
      setCurrentUserImageIndex(parsedData.userImages && parsedData.userImages.length > 0 ? 0 : 0); 
      setCurrentDiagramImageIndex(parsedData.diagramImages && parsedData.diagramImages.length > 0 ? 0 : 0);
    } else {
      // If no saved data, re-initialize measurements based on current unit system
      // This handles the case where the user changes the global setting before first use
      const initial: MeasurementsState = {
        chest: { value: '', unit: getDefaultUnit('chest', unitSystem) },
        waist: { value: '', unit: getDefaultUnit('waist', unitSystem) },
        hipsGlutes: { value: '', unit: getDefaultUnit('hipsGlutes', unitSystem) },
        bicepsUnflexed: { value: '', unit: getDefaultUnit('bicepsUnflexed', unitSystem) },
        bicepsFlexed: { value: '', unit: getDefaultUnit('bicepsFlexed', unitSystem) },
        tricepsUnflexed: { value: '', unit: getDefaultUnit('tricepsUnflexed', unitSystem) },
        tricepsFlexed: { value: '', unit: getDefaultUnit('tricepsFlexed', unitSystem) },
        forearms: { value: '', unit: getDefaultUnit('forearms', unitSystem) },
        calves: { value: '', unit: getDefaultUnit('calves', unitSystem) },
        neck: { value: '', unit: getDefaultUnit('neck', unitSystem) },
        shoulders: { value: '', unit: getDefaultUnit('shoulders', unitSystem) },
        thighs: { value: '', unit: getDefaultUnit('thighs', unitSystem) },
        weight: { value: '', unit: getDefaultUnit('weight', unitSystem) },
        bodyFatPercentage: { value: '', unit: getDefaultUnit('bodyFatPercentage', unitSystem) },
      };
      setMeasurements(initial);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem]); // Add unitSystem as a dependency to re-initialize or merge when it changes

  const saveMeasurements = () => {
    const dataToSave = {
      measurements,
      userImages,
      diagramImages,
    };
    localStorage.setItem('bodyMetricsData', JSON.stringify(dataToSave));
    toast({ title: 'Success', description: 'Measurements and images saved!' });
  };

  const handleMeasurementChange = (key: keyof MeasurementsState, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  const handleUnitChange = (key: keyof MeasurementsState, unit: 'cm' | 'in' | 'kg' | 'lbs' | '%') => {
    setMeasurements(prev => ({
        ...prev,
        [key]: { ...prev[key], unit: unit }, // No need to cast if MeasurementValue.unit is broad enough
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, imageType: 'user' | 'diagram') => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newImageObjects: ImageObject[] = filesArray.map(file => ({
        url: URL.createObjectURL(file),
        title: '',
        description: '',
      }));

      if (imageType === 'user') {
        setUserImages(prevImages => [...prevImages, ...newImageObjects]);
        if (userImages.length === 0 && newImageObjects.length > 0) {
          setCurrentUserImageIndex(0);
        }
      } else {
        setDiagramImages(prevImages => [...prevImages, ...newImageObjects]);
        if (diagramImages.length === 0 && newImageObjects.length > 0) {
          setCurrentDiagramImageIndex(0);
        }
      }
      event.target.value = ''; // Reset file input
    }
  };

  const handleDeleteImage = (imageType: 'user' | 'diagram', index: number) => {
    let newImages: ImageObject[];
    if (imageType === 'user') {
      newImages = userImages.filter((_, i) => i !== index);
      setUserImages(newImages);
      setCurrentUserImageIndex(prevIdx => Math.max(0, Math.min(prevIdx, newImages.length - 1)));
    } else {
      newImages = diagramImages.filter((_, i) => i !== index);
      setDiagramImages(newImages);
      setCurrentDiagramImageIndex(prevIdx => Math.max(0, Math.min(prevIdx, newImages.length - 1)));
    }
  };

  const handleImageDetailChange = (
    imageType: 'user' | 'diagram',
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    if (imageType === 'user') {
      setUserImages(prevImages =>
        prevImages.map((img, i) => (i === index ? { ...img, [field]: value } : img))
      );
    } else {
      setDiagramImages(prevImages =>
        prevImages.map((img, i) => (i === index ? { ...img, [field]: value } : img))
      );
    }
  };
  
  const navigateCarousel = (imageType: 'user' | 'diagram', direction: 'prev' | 'next') => {
    if (imageType === 'user') {
      setCurrentUserImageIndex(prevIndex => {
        const newIndex = direction === 'prev' ? prevIndex - 1 : prevIndex + 1;
        if (newIndex < 0) return userImages.length - 1;
        if (newIndex >= userImages.length) return 0;
        return newIndex;
      });
    } else {
      setCurrentDiagramImageIndex(prevIndex => {
        const newIndex = direction === 'prev' ? prevIndex - 1 : prevIndex + 1;
        if (newIndex < 0) return diagramImages.length - 1;
        if (newIndex >= diagramImages.length) return 0;
        return newIndex;
      });
    }
  };

  const renderImageCarousel = (
    imageType: 'user' | 'diagram',
    images: ImageObject[],
    currentIndex: number,
    // setCurrentIndex: React.Dispatch<React.SetStateAction<number>>, // Not needed if using navigateCarousel
    placeholderText: string
  ) => {
    if (!images || images.length === 0) {
      return <p className="text-center text-gray-400 py-10">{placeholderText}</p>;
    }

    const currentImage = images[currentIndex];
    if (!currentImage) {
        // This can happen if currentIndex is out of bounds after deletion, though handleDeleteImage tries to prevent this.
        return <p className="text-center text-gray-400 py-10">Error displaying image.</p>;
    }

    return (
      <div className="relative w-full flex flex-col items-center">
        <img 
            src={currentImage.url} 
            alt={`${imageType} ${currentIndex + 1} - ${currentImage.title || 'Untitled'}`} 
            className="w-full h-auto object-contain rounded-md max-h-60 md:max-h-80 mb-2 shadow-lg" 
        />
        <Input
          type="text"
          placeholder="Enter title"
          value={currentImage.title}
          onChange={(e) => handleImageDetailChange(imageType, currentIndex, 'title', e.target.value)}
          className="mt-2 w-full max-w-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-md"
        />
        <Textarea
          placeholder="Enter short description"
          value={currentImage.description}
          onChange={(e) => handleImageDetailChange(imageType, currentIndex, 'description', e.target.value)}
          className="mt-2 w-full max-w-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-md h-24"
        />
        {images.length > 1 && (
          <div className="absolute top-1/3 left-0 right-0 flex justify-between items-center px-1 transform -translate-y-1/2">
            <Button onClick={() => navigateCarousel(imageType, 'prev')} variant="outline" size="icon" className="bg-black bg-opacity-50 text-white hover:bg-opacity-75 rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button onClick={() => navigateCarousel(imageType, 'next')} variant="outline" size="icon" className="bg-black bg-opacity-50 text-white hover:bg-opacity-75 rounded-full">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
        <Button
          onClick={() => handleDeleteImage(imageType, currentIndex)}
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        {images.length > 1 && (
          <p className="text-center text-sm text-gray-400 mt-2">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>
    );
  };

  const measurementCategories: { title: string; keys: (keyof MeasurementsState)[] }[] = [
    { title: 'Key Measurements', keys: ['chest', 'waist', 'hipsGlutes', 'weight'] },
    { title: 'Arm Measurements', keys: ['bicepsUnflexed', 'bicepsFlexed', 'tricepsUnflexed', 'tricepsFlexed', 'forearms'] },
    { title: 'Leg Measurements', keys: ['thighs', 'calves'] },
    { title: 'Other Measurements', keys: ['neck', 'shoulders', 'bodyFatPercentage'] }, 
  ];

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen pb-20">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-900 py-2 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-center text-white flex-grow">Body Metrics</h1>
        <StatsHelpPopup 
            title="Body Metrics Help"
            description="Track your body measurements and visual progress. Upload photos for personal reference and muscle diagrams to visualize changes. All data is stored locally in your browser."
            isOpen={false} // This needs to be managed by a state variable if it's a modal
            onClose={() => {}} // This needs a function to close the modal
        />
      </div>

      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-center text-white">Your Picture</h3>
        {renderImageCarousel('user', userImages, currentUserImageIndex, 'No picture uploaded yet.')}
        <label htmlFor="user-image-upload" className="block w-full mt-4">
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
            <span><Upload className="mr-2 h-4 w-4 inline" /> Upload Picture(s)</span>
          </Button>
        </label>
        <Input
          id="user-image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e, 'user')}
          className="hidden" // Hide the default input, use the button
        />
        <p className="text-xs text-gray-500 mt-2 text-center">Images are stored locally in your browser.</p>
      </div>

      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-center text-white">Measurements</h3>
        {measurementCategories.map(category => (
          <div key={category.title} className="mb-4">
            <h4 className="text-lg font-medium mb-2 text-gray-300 border-b border-gray-700 pb-1">{category.title}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {category.keys.map((key) => {
                const keyString = String(key);
                // Define currentUnit here, using the measurement state or the default from global settings
                const currentUnit = measurements[key]?.unit || getDefaultUnit(key, unitSystem);
                return (
                  <div key={keyString}>
                    <Label htmlFor={keyString} className="block text-sm font-medium text-gray-400 capitalize mb-1">
                      {keyString.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id={keyString}
                        type="number" 
                        placeholder={`Enter ${keyString.toLowerCase()}`}
                        value={measurements[key]?.value || ''} 
                        onChange={(e) => handleMeasurementChange(key, e.target.value)}
                        className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-500 rounded-md focus:ring-blue-500 focus:border-blue-500 mr-2"
                      />
                      <select 
                          value={currentUnit} // Now currentUnit is defined
                          onChange={(e) => handleUnitChange(key, e.target.value as 'cm' | 'in' | 'kg' | 'lbs' | '%')}
                          className="bg-gray-700 border-gray-600 text-white rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        {keyString === 'weight' ? (
                          unitSystem === 'imperial' ? (
                            <>
                              <option value="lbs">lbs</option>
                              <option value="kg">kg</option>
                            </>
                          ) : (
                            <>
                              <option value="kg">kg</option>
                              <option value="lbs">lbs</option>
                            </>
                          )
                        ) : keyString === 'bodyFatPercentage' ? (
                          <option value="%">%</option>
                        ) : (
                          unitSystem === 'imperial' ? (
                            <>
                              <option value="in">in</option>
                              <option value="cm">cm</option>
                            </>
                          ) : (
                            <>
                              <option value="cm">cm</option>
                              <option value="in">in</option>
                            </>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-center text-white">Muscle Diagram</h3>
        {renderImageCarousel('diagram', diagramImages, currentDiagramImageIndex, 'Muscle Diagram Placeholder')}
        <label htmlFor="diagram-image-upload" className="block w-full mt-4">
          <Button asChild className="w-full bg-green-600 hover:bg-green-700">
            <span><Upload className="mr-2 h-4 w-4 inline" /> Upload Diagram(s)</span>
          </Button>
        </label>
        <Input
          id="diagram-image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e, 'diagram')}
          className="hidden" // Hide the default input, use the button
        />
      </div>

      <Button onClick={saveMeasurements} className="w-full mt-6 mb-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-md sticky bottom-4 z-10">
        Save All Measurements
      </Button>
    </div>
  );
};

export default BodyMetricsPage;