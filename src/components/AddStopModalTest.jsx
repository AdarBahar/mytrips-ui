import React, { useState } from 'react';
import AddStopModal from './AddStopModal';

const AddStopModalTest = () => {
  const [showModal, setShowModal] = useState(false);
  const [stops, setStops] = useState([]);

  const handleStopAdded = (newStop) => {
    console.log('New stop added:', newStop);
    setStops(prev => [...prev, newStop]);
    setShowModal(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Add Stop Modal Test</h1>
      
      <div className="mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Open Add Location Modal
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Current Stops ({stops.length}):</h2>
        {stops.length === 0 ? (
          <p className="text-gray-500">No stops added yet</p>
        ) : (
          <ul className="space-y-2">
            {stops.map((stop, index) => (
              <li key={index} className="p-2 bg-gray-100 rounded">
                <strong>{stop.name}</strong> - {stop.address}
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddStopModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        tripId="test-trip-id"
        dayId="test-day-id"
        onStopAdded={handleStopAdded}
        existingStops={[]}
        userLocation={null}
      />
    </div>
  );
};

export default AddStopModalTest;
