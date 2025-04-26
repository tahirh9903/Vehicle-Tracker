'use client';

import { useState } from 'react';

interface VehicleDetails {
  type: string;
  make: string;
  model: string;
  year: string;
  state: string;
  occupants: string;
}

interface DriverDetails {
  sex: string;
  license_status: string;
  license_jurisdiction: string;
}

interface CrashDetails {
  pre_crash: string;
  point_of_impact: string;
  travel_direction: string;
}

interface Accident {
  date: string;
  time: string;
  vehicle: VehicleDetails;
  driver: DriverDetails;
  crash: CrashDetails;
  damage_locations: string[];
  public_property_damage: string;
  contributing_factors: string[];
}

export default function Home() {
  const [filters, setFilters] = useState({
    vehicle_type: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    driver_sex: '',
    driver_license_status: '',
    state_registration: '',
    travel_direction: '',
    date_from: '',
    date_to: ''
  });
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAccidents([]);
    
    // Remove empty filters
    const nonEmptyFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    
    try {
      const response = await fetch('http://localhost:8000/api/accidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nonEmptyFilters),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch accident data');
      }

      const data = await response.json();
      if (!data.accidents || !Array.isArray(data.accidents)) {
        throw new Error('Invalid data format received from server');
      }
      
      setAccidents(data.accidents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching accident data. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">NYC Car Accident Tracker</h1>
        
        <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <input
                type="text"
                placeholder="e.g., Sedan, SUV"
                value={filters.vehicle_type}
                onChange={(e) => handleFilterChange('vehicle_type', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Make</label>
              <input
                type="text"
                placeholder="e.g., FORD, BMW, NISS"
                value={filters.vehicle_make}
                onChange={(e) => handleFilterChange('vehicle_make', e.target.value.toUpperCase())}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
              <input
                type="text"
                placeholder="e.g., X5, 325i, ACCORD (partial matches ok)"
                value={filters.vehicle_model}
                onChange={(e) => handleFilterChange('vehicle_model', e.target.value.toUpperCase())}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Year</label>
              <input
                type="text"
                placeholder="e.g., 2020"
                value={filters.vehicle_year}
                onChange={(e) => handleFilterChange('vehicle_year', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Sex</label>
              <select
                value={filters.driver_sex}
                onChange={(e) => handleFilterChange('driver_sex', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Status</label>
              <input
                type="text"
                placeholder="e.g., VALID, SUSPENDED"
                value={filters.driver_license_status}
                onChange={(e) => handleFilterChange('driver_license_status', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State Registration</label>
              <input
                type="text"
                placeholder="e.g., NY, NJ"
                value={filters.state_registration}
                onChange={(e) => handleFilterChange('state_registration', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel Direction</label>
              <input
                type="text"
                placeholder="e.g., NORTH, SOUTH"
                value={filters.travel_direction}
                onChange={(e) => handleFilterChange('travel_direction', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Searching...' : 'Search Accidents'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {accidents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Accident Results ({accidents.length} found)
            </h2>
            {accidents.map((accident, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">Date & Time:</p>
                    <p className="text-gray-800">{accident.date} at {accident.time}</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-gray-600">Vehicle Details:</p>
                    <p className="text-gray-800">
                      {accident.vehicle?.year || 'Unknown'} {accident.vehicle?.make || 'Unknown'} {accident.vehicle?.model || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Type: {accident.vehicle?.type || 'Unknown'} | State: {accident.vehicle?.state || 'Unknown'} | 
                      Occupants: {accident.vehicle?.occupants || 'Unknown'}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-600">Driver Information:</p>
                    <p className="text-gray-800">
                      {accident.driver?.sex || 'Unknown'} | {accident.driver?.license_status || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      License State: {accident.driver?.license_jurisdiction || 'Unknown'}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-600">Crash Details:</p>
                    <p className="text-gray-800">
                      {accident.crash?.pre_crash || 'Unknown'} | {accident.crash?.travel_direction || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Impact: {accident.crash?.point_of_impact || 'Unknown'}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-600">Damage Locations:</p>
                    <ul className="list-disc list-inside text-gray-800">
                      {(accident.damage_locations || []).map((location, i) => (
                        <li key={i} className="text-sm">{location || 'Unknown'}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-600">Contributing Factors:</p>
                    <ul className="list-disc list-inside text-gray-800">
                      {(accident.contributing_factors || []).map((factor, i) => (
                        <li key={i} className="text-sm">{factor || 'Unknown'}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="col-span-2">
                    <p className="font-semibold text-gray-600">Public Property Damage:</p>
                    <p className="text-gray-800">{accident.public_property_damage || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && accidents.length === 0 && !error && (
          <div className="text-center text-gray-600">
            Use the filters above to search for accidents.
          </div>
        )}
      </div>
    </main>
  );
} 