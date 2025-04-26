'use client';

import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

const generateChartColors = (count: number): string[] => {
  const colors = [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
  ];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

const styles = {
  container: `
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 1rem;
      background: linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%);
      min-height: 100vh;
    }
  `,
  header: `
    .header {
      text-align: center;
      margin-bottom: 3rem;
      animation: fadeIn 0.8s ease-out;
    }
    .header h1 {
      font-size: 3rem;
      font-weight: 800;
      background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  searchForm: `
    .search-form {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 1.5rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: slideUp 0.6s ease-out;
    }
    .form-grid {
      display: grid;
      gap: 1.5rem;
    }
    @media (min-width: 768px) {
      .form-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1024px) {
      .form-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (min-width: 1280px) {
      .form-grid { grid-template-columns: repeat(4, 1fr); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  formField: `
    .form-field {
      position: relative;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }
    .form-field:hover {
      transform: translateY(-2px);
    }
    .form-field label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.5rem;
      transition: color 0.3s ease;
    }
    .form-field input,
    .form-field select {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 1rem;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      background: white;
    }
    .form-field input:focus,
    .form-field select:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
      transform: scale(1.02);
    }
    .form-field input::placeholder {
      color: #a0aec0;
    }
  `,
  button: `
    .submit-button {
      width: 100%;
      padding: 1.25rem;
      background: linear-gradient(135deg, #4299e1 0%, #2b6cb0 100%);
      color: white;
      border: none;
      border-radius: 1rem;
      font-weight: 700;
      font-size: 1.125rem;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .submit-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .submit-button:active {
      transform: translateY(0);
    }
    .submit-button:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
      transform: none;
    }
    .submit-button::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
      transition: transform 0.6s ease;
    }
    .submit-button:hover::after {
      transform: translateX(100%);
    }
  `,
  results: `
    .results {
      margin-top: 3rem;
      animation: fadeIn 0.8s ease-out;
    }
    .results-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }
    .results-header h2 {
      font-size: 1.875rem;
      font-weight: 700;
      color: #2d3748;
    }
    .results-count {
      background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
      color: #2b6cb0;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  `,
  card: `
    .accident-card {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      margin-bottom: 2rem;
      overflow: hidden;
      transition: all 0.3s ease;
      border: 1px solid rgba(226, 232, 240, 0.8);
      animation: slideUp 0.6s ease-out;
    }
    .accident-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .card-content {
      padding: 2rem;
    }
    .card-grid {
      display: grid;
      gap: 2rem;
    }
    @media (min-width: 768px) {
      .card-grid { grid-template-columns: repeat(2, 1fr); }
    }
    .card-section {
      position: relative;
      padding: 1.5rem;
      background: #f7fafc;
      border-radius: 1rem;
      transition: all 0.3s ease;
    }
    .card-section:hover {
      background: #edf2f7;
    }
    .card-section h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .card-section h3::before {
      content: '';
      display: block;
      width: 4px;
      height: 1.25rem;
      background: linear-gradient(135deg, #4299e1 0%, #2b6cb0 100%);
      border-radius: 2px;
    }
    .card-section p {
      color: #4a5568;
      line-height: 1.6;
    }
    .secondary-text {
      color: #718096;
      font-size: 0.95rem;
    }
    .card-section ul {
      list-style: none;
      padding: 0;
    }
    .card-section ul li {
      position: relative;
      padding-left: 1.5rem;
      margin-bottom: 0.5rem;
      color: #718096;
    }
    .card-section ul li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #4299e1;
      font-weight: bold;
    }
  `,
  error: `
    .error {
      background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
      border-left: 4px solid #f56565;
      padding: 1.5rem;
      border-radius: 1rem;
      margin-bottom: 2rem;
      animation: shake 0.5s ease-in-out;
    }
    .error-content {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    .error-icon {
      flex-shrink: 0;
      color: #e53e3e;
    }
    .error-message {
      color: #c53030;
      font-weight: 500;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `,
  empty: `
    .empty-state {
      text-align: center;
      padding: 4rem 0;
      animation: fadeIn 0.8s ease-out;
    }
    .empty-icon {
      color: #a0aec0;
      margin-bottom: 1.5rem;
      animation: pulse 2s infinite;
    }
    .empty-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.75rem;
    }
    .empty-description {
      color: #718096;
      font-size: 1rem;
      max-width: 24rem;
      margin: 0 auto;
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }
  `,
  charts: `
    .charts-container {
      margin-top: 2rem;
      animation: fadeIn 0.8s ease-out;
    }
    .charts-grid {
      display: grid;
      gap: 2rem;
      margin-top: 2rem;
    }
    @media (min-width: 1024px) {
      .charts-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .chart-card {
      background: white;
      border-radius: 1.5rem;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    .chart-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .chart-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 1.5rem;
      text-align: center;
    }
  `,
  viewToggle: `
    .view-toggle {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 2rem;
    }
    .toggle-button {
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-weight: 600;
      transition: all 0.3s ease;
      background: white;
      border: 2px solid #e2e8f0;
      color: #64748b;
    }
    .toggle-button.active {
      background: linear-gradient(135deg, #4299e1 0%, #2b6cb0 100%);
      color: white;
      border-color: transparent;
    }
    .toggle-button:hover:not(.active) {
      border-color: #4299e1;
      color: #4299e1;
    }
  `
};

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
  const [vehicleTypeData, setVehicleTypeData] = useState<ChartData | null>(null);
  const [timeDistributionData, setTimeDistributionData] = useState<ChartData | null>(null);
  const [driverAnalysisData, setDriverAnalysisData] = useState<ChartData | null>(null);
  const [damageLocationData, setDamageLocationData] = useState<ChartData | null>(null);
  const [activeView, setActiveView] = useState<'charts' | 'details'>('charts');

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

  useEffect(() => {
    if (accidents.length > 0) {
      // Process vehicle type distribution
      const vehicleTypes = accidents.reduce((acc: { [key: string]: number }, curr) => {
        const type = curr.vehicle?.type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      setVehicleTypeData({
        labels: Object.keys(vehicleTypes),
        datasets: [{
          label: 'Vehicle Types',
          data: Object.values(vehicleTypes),
          backgroundColor: generateChartColors(Object.keys(vehicleTypes).length),
          borderColor: generateChartColors(Object.keys(vehicleTypes).length).map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }]
      });

      // Process time distribution (by hour)
      const timeDistribution = accidents.reduce((acc: { [key: string]: number }, curr) => {
        const hour = curr.time.split(':')[0] || '00';
        const timeRange = `${hour}:00 - ${hour}:59`;
        acc[timeRange] = (acc[timeRange] || 0) + 1;
        return acc;
      }, {});

      setTimeDistributionData({
        labels: Object.keys(timeDistribution),
        datasets: [{
          label: 'Accidents by Time',
          data: Object.values(timeDistribution),
          backgroundColor: Array(Object.keys(timeDistribution).length).fill('rgba(54, 162, 235, 0.8)'),
          borderColor: Array(Object.keys(timeDistribution).length).fill('rgba(54, 162, 235, 1)'),
          borderWidth: 1
        }]
      });

      // Process driver analysis
      const driverStats = accidents.reduce((acc: { [key: string]: number }, curr) => {
        const status = curr.driver?.license_status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setDriverAnalysisData({
        labels: Object.keys(driverStats),
        datasets: [{
          label: 'Driver License Status',
          data: Object.values(driverStats),
          backgroundColor: generateChartColors(Object.keys(driverStats).length),
          borderColor: generateChartColors(Object.keys(driverStats).length).map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }]
      });

      // Process damage locations
      const damageStats = accidents.reduce((acc: { [key: string]: number }, curr) => {
        (curr.damage_locations || []).forEach(location => {
          acc[location] = (acc[location] || 0) + 1;
        });
        return acc;
      }, {});

      setDamageLocationData({
        labels: Object.keys(damageStats),
        datasets: [{
          label: 'Damage Locations',
          data: Object.values(damageStats),
          backgroundColor: generateChartColors(Object.keys(damageStats).length),
          borderColor: generateChartColors(Object.keys(damageStats).length).map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }]
      });
    }
  }, [accidents]);

  return (
    <>
      <style jsx>{`
        ${styles.container}
        ${styles.header}
        ${styles.searchForm}
        ${styles.formField}
        ${styles.button}
        ${styles.results}
        ${styles.card}
        ${styles.error}
        ${styles.empty}
        ${styles.charts}
        ${styles.viewToggle}
      `}</style>

      <main className="container">
        <div className="header">
          <h1>NYC Vehicle Collision Tracker</h1>
        </div>
        
        <div className="search-form">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>Vehicle Make</label>
                <input
                  type="text"
                  placeholder="e.g., FORD, BMW, NISS"
                  value={filters.vehicle_make}
                  onChange={(e) => handleFilterChange('vehicle_make', e.target.value.toUpperCase())}
                />
              </div>
              
              <div className="form-field">
                <label>Vehicle Model</label>
                <input
                  type="text"
                  placeholder="e.g., X5, 325i, ACCORD"
                  value={filters.vehicle_model}
                  onChange={(e) => handleFilterChange('vehicle_model', e.target.value.toUpperCase())}
                />
              </div>
              
              <div className="form-field">
                <label>Vehicle Type</label>
                <input
                  type="text"
                  placeholder="e.g., Sedan, SUV"
                  value={filters.vehicle_type}
                  onChange={(e) => handleFilterChange('vehicle_type', e.target.value)}
                />
              </div>
              
              <div className="form-field">
                <label>Vehicle Year</label>
                <input
                  type="text"
                  placeholder="e.g., 2020"
                  value={filters.vehicle_year}
                  onChange={(e) => handleFilterChange('vehicle_year', e.target.value)}
                />
              </div>
              
              <div className="form-field">
                <label>Driver Sex</label>
                <select
                  value={filters.driver_sex}
                  onChange={(e) => handleFilterChange('driver_sex', e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              
              <div className="form-field">
                <label>License Status</label>
                <input
                  type="text"
                  placeholder="e.g., VALID, SUSPENDED"
                  value={filters.driver_license_status}
                  onChange={(e) => handleFilterChange('driver_license_status', e.target.value)}
                />
              </div>
              
              <div className="form-field">
                <label>State Registration</label>
                <input
                  type="text"
                  placeholder="e.g., NY, NJ"
                  value={filters.state_registration}
                  onChange={(e) => handleFilterChange('state_registration', e.target.value)}
                />
              </div>
              
              <div className="form-field">
                <label>Travel Direction</label>
                <input
                  type="text"
                  placeholder="e.g., NORTH, SOUTH"
                  value={filters.travel_direction}
                  onChange={(e) => handleFilterChange('travel_direction', e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Date From</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </div>
              
              <div className="form-field">
                <label>Date To</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Searching...' : 'Search Accidents'}
            </button>
          </form>
        </div>

        {error && (
          <div className="error">
            <div className="error-content">
              <svg className="error-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="error-message">{error}</p>
            </div>
          </div>
        )}

        {accidents.length > 0 && (
          <>
            <div className="results">
              <div className="results-header">
                <h2>Accident Results</h2>
                <span className="results-count">{accidents.length} found</span>
              </div>

              <div className="view-toggle">
                <button
                  className={`toggle-button ${activeView === 'charts' ? 'active' : ''}`}
                  onClick={() => setActiveView('charts')}
                >
                  Analytics View
                </button>
                <button
                  className={`toggle-button ${activeView === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveView('details')}
                >
                  Detailed View
                </button>
              </div>

              {activeView === 'charts' && (
                <div className="charts-container">
                  <div className="charts-grid">
                    {vehicleTypeData && (
                      <div className="chart-card">
                        <h3 className="chart-title">Vehicle Type Distribution</h3>
                        <Pie data={vehicleTypeData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                      </div>
                    )}
                    
                    {timeDistributionData && (
                      <div className="chart-card">
                        <h3 className="chart-title">Accidents by Time of Day</h3>
                        <Bar 
                          data={timeDistributionData} 
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              title: { display: false }
                            },
                            scales: {
                              y: { beginAtZero: true, title: { display: true, text: 'Number of Accidents' } }
                            }
                          }} 
                        />
                      </div>
                    )}
                    
                    {driverAnalysisData && (
                      <div className="chart-card">
                        <h3 className="chart-title">Driver License Status Distribution</h3>
                        <Pie data={driverAnalysisData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                      </div>
                    )}
                    
                    {damageLocationData && (
                      <div className="chart-card">
                        <h3 className="chart-title">Common Damage Locations</h3>
                        <Bar 
                          data={damageLocationData}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              title: { display: false }
                            },
                            scales: {
                              y: { beginAtZero: true, title: { display: true, text: 'Frequency' } }
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeView === 'details' && (
                <div className="grid grid-cols-1 gap-6">
                  {accidents.map((accident, index) => (
                    <div key={index} className="accident-card">
                      <div className="card-content">
                        <div className="card-grid">
                          <div className="card-section">
                            <h3>Date & Time</h3>
                            <p>{accident.date} at {accident.time}</p>
                          </div>
                          
                          <div className="card-section">
                            <h3>Vehicle Details</h3>
                            <p className="secondary-text">
                              {accident.vehicle?.year} {accident.vehicle?.make} {accident.vehicle?.model}
                            </p>
                            <p className="secondary-text">
                              Type: {accident.vehicle?.type} | State: {accident.vehicle?.state} | 
                              Occupants: {accident.vehicle?.occupants}
                            </p>
                          </div>
                          
                          <div className="card-section">
                            <h3>Driver Information</h3>
                            <p className="secondary-text">
                              {accident.driver?.sex} | {accident.driver?.license_status}
                            </p>
                            <p className="secondary-text">
                              License State: {accident.driver?.license_jurisdiction}
                            </p>
                          </div>
                        </div>

                        <div className="card-grid">
                          <div className="card-section">
                            <h3>Crash Details</h3>
                            <p className="secondary-text">
                              {accident.crash?.pre_crash} | {accident.crash?.travel_direction}
                            </p>
                            <p className="secondary-text">
                              Impact: {accident.crash?.point_of_impact}
                            </p>
                          </div>

                          <div className="card-section">
                            <h3>Damage Locations</h3>
                            <ul className="list-disc list-inside secondary-text">
                              {(accident.damage_locations || []).map((location, i) => (
                                <li key={i}>{location}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="card-section">
                            <h3>Contributing Factors</h3>
                            <ul className="list-disc list-inside secondary-text">
                              {(accident.contributing_factors || []).map((factor, i) => (
                                <li key={i}>{factor}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {accident.public_property_damage && (
                          <div className="card-section">
                            <h3>Public Property Damage</h3>
                            <p>{accident.public_property_damage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!loading && accidents.length === 0 && !error && (
          <div className="empty-state">
            <svg className="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="empty-title">No accidents found</h3>
            <p className="empty-description">Use the filters above to search for accidents.</p>
          </div>
        )}
      </main>
    </>
  );
} 