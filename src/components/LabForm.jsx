import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

const LabForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in edit mode (coming from print page)
  const editData = location.state;
  const isEditMode = editData?.editMode;

  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    patientId: ''
  });
  
  const [selectedTests, setSelectedTests] = useState([]);
  const [testResults, setTestResults] = useState({});

  // Pre-fill data if in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setPatientInfo(editData.patientInfo || {
        name: '',
        age: '',
        gender: '',
        patientId: ''
      });
      
      if (editData.selectedTests) {
        // Extract test IDs and results from the selectedTests array
        const testIds = editData.selectedTests.map(item => item.test.id);
        const results = {};
        
        editData.selectedTests.forEach(item => {
          results[item.test.id] = item.results;
        });
        
        setSelectedTests(testIds);
        setTestResults(results);
      }
    }
  }, [isEditMode, editData]);

  // Test options with their parameters
  const testOptions = [
    {
      id: 'widal_test',
      name: 'WIDAL TEST',
      parameters: [
        { name: 'S. Typhi - TO', normalRange: 'Less Than 1:80', unit: 'Ratio', isInput: true },
        { name: 'S. Typhi - TH', normalRange: 'Less Than 1:80', unit: 'Ratio', isInput: true },
        { name: 'S. Para Typhi - AH', normalRange: 'Less Than 1:80', unit: 'Ratio', isInput: false, fixedValue: '1:80' },
        { name: 'S. Para Typhi - BH', normalRange: 'Less Than 1:80', unit: 'Ratio', isInput: false, fixedValue: '1:80' }
      ]
    },
    {
      id: 'blood_grouping',
      name: 'Blood Grouping',
      parameters: [
        { name: 'Blood Grouping (ABO)', normalRange: 'A, B, AB, O', unit: 'Type' },
        { name: 'Rh- Factor (Anti-D)', normalRange: 'Positive/Negative', unit: 'Type' }
      ]
    },
    {
      id: 'crp_test',
      name: 'CRP',
      parameters: [
        { name: 'CRP (C-Reactive Protein)', normalRange: 'Less than 6 mg/dl', unit: 'mg/dl' }
      ]
    }
  ];

  const handlePatientInfoChange = (e) => {
    setPatientInfo({
      ...patientInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleTestSelection = (testId) => {
    if (selectedTests.includes(testId)) {
      setSelectedTests(selectedTests.filter(id => id !== testId));
      // Remove test results for deselected test
      const newResults = { ...testResults };
      delete newResults[testId];
      setTestResults(newResults);
    } else {
      setSelectedTests([...selectedTests, testId]);
    }
  };

  const handleResultChange = (testId, paramName, value) => {
    // For WIDAL test TO and TH, ensure we store the exact numeric value
    if (testId === 'widal_test' && (paramName === 'S. Typhi - TO' || paramName === 'S. Typhi - TH')) {
      // Store the exact value as entered, no modifications
      console.log(`WIDAL Input Debug - ${paramName}: Original="${value}"`);
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          ...prev[testId],
          [paramName]: value
        }
      }));
    } else {
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          ...prev[testId],
          [paramName]: value
        }
      }));
    }
  };

  const generatePatientId = () => {
    const id = 'PAT' + Date.now().toString().slice(-6);
    setPatientInfo({
      ...patientInfo,
      patientId: id
    });
  };

  const handleGenerateReport = () => {
    const reportData = {
      patientInfo,
      selectedTests: selectedTests.map(testId => {
        const test = testOptions.find(test => test.id === testId);
        let results = { ...testResults[testId] || {} };
        
        // Debug log for WIDAL test
        if (testId === 'widal_test') {
          console.log('WIDAL Debug - Original values:', {
            TO: results['S. Typhi - TO'],
            TH: results['S. Typhi - TH'],
            TO_type: typeof results['S. Typhi - TO'],
            TH_type: typeof results['S. Typhi - TH']
          });
        }
        
        // For WIDAL test, format TO and TH values and add fixed AH and BH
        if (testId === 'widal_test') {
          // Format TO and TH values with 1: prefix (avoid double 1:)
          if (results['S. Typhi - TO']) {
            const toValue = String(results['S. Typhi - TO']).trim();
            results['S. Typhi - TO'] = toValue.startsWith('1:') ? toValue : `1:${toValue}`;
          }
          if (results['S. Typhi - TH']) {
            const thValue = String(results['S. Typhi - TH']).trim();
            results['S. Typhi - TH'] = thValue.startsWith('1:') ? thValue : `1:${thValue}`;
          }
          // Add fixed values for AH and BH
          results['S. Para Typhi - AH'] = '1:80';
          results['S. Para Typhi - BH'] = '1:80';
          
          // Debug log for WIDAL test
          console.log('WIDAL Debug - Final formatted values:', {
            TO: results['S. Typhi - TO'],
            TH: results['S. Typhi - TH']
          });
        }
        
        return {
          test: test,
          results: results
        };
      }),
      isMultipleTests: selectedTests.length > 1
    };

    navigate('/print-report', { state: reportData });
  };

  // Check if patient info is complete
  const isPatientInfoComplete = patientInfo.name && patientInfo.age && patientInfo.gender;
  
  // Check if at least one test is selected
  const hasSelectedTests = selectedTests.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-5 transform rotate-12"></div>
            <div className="absolute top-4 left-4 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
            <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-white bg-opacity-10 rounded-full"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Hospital Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-white bg-opacity-20 rounded-full p-4 w-24 h-24 flex items-center justify-center">
                <img src="/hospital.png" alt="Hospital Icon" />
              </div>
            </div>

            <h1 className="text-5xl font-bold text-center text-white mb-3 drop-shadow-lg playfair-font">
              Upazila Health Complex
            </h1>
            <h2 className="text-center text-blue-100 text-3xl mb-4 font-medium playfair-font">
              Laboratory Services
            </h2>
            <div className="flex items-center justify-center mb-4">
              <div className="h-px bg-blue-300 flex-1 max-w-xs"></div>
              <div className="px-4">
                <div className="text-white text-2xl">📍</div>
              </div>
              <div className="h-px bg-blue-300 flex-1 max-w-xs"></div>
            </div>
            <p className='text-center text-blue-100 text-2xl mb-4'>
              Banaripara, Barishal
            </p>
            
            {isEditMode && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-medium text-lg shadow-lg">
                  <span>✏️</span>
                  <span>Edit Mode Active</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Patient Information */}
        <div className="bg-white rounded-lg p-8 mb-8 shadow-lg">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-xl">Patient Name *</span>
              </label>
              <input
                type="text"
                name="name"
                value={patientInfo.name}
                onChange={handlePatientInfoChange}
                placeholder="Enter patient name"
                className="input input-bordered w-full text-xl h-14"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-xl">Age *</span>
              </label>
              <input
                type="number"
                name="age"
                value={patientInfo.age}
                onChange={handlePatientInfoChange}
                placeholder="Enter age"
                className="input input-bordered w-full text-xl h-14"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-xl">Gender *</span>
              </label>
              <select
                name="gender"
                value={patientInfo.gender}
                onChange={handlePatientInfoChange}
                className="select select-bordered w-full text-xl h-14"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-xl">Patient ID (Optional)</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="patientId"
                  value={patientInfo.patientId}
                  onChange={handlePatientInfoChange}
                  placeholder="Enter or generate patient ID"
                  className="input input-bordered w-full text-xl h-14"
                />
                <button
                  type="button"
                  onClick={generatePatientId}
                  className="btn btn-outline btn-primary text-xl h-14 px-6"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Selection with Radio Buttons */}
        {isPatientInfoComplete && (
          <div className="bg-white rounded-lg p-8 mb-8 shadow-lg">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">Select Tests</h2>
            
            <div className="space-y-4">
              {testOptions.map(test => (
                <div key={test.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left side - Test selection only */}
                    <div className="order-1">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={test.id}
                          checked={selectedTests.includes(test.id)}
                          onChange={() => handleTestSelection(test.id)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <label htmlFor={test.id} className="text-xl font-medium cursor-pointer">
                          {test.name}
                        </label>
                      </div>
                    </div>
                    
                    {/* Right side - Input fields in single row (when test is selected) */}
                    <div className="order-2">
                      {selectedTests.includes(test.id) && (
                        <div>
                          <h4 className="text-lg font-medium text-gray-700 mb-4">Enter Results:</h4>
                          
                          {/* Blood Grouping Special Layout - Single Row */}
                          {test.id === 'blood_grouping' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* ABO Blood Group - Dropdown Input */}
                              <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Blood Grouping (ABO):</label>
                                <select
                                  value={testResults[test.id]?.['Blood Grouping (ABO)'] || ''}
                                  onChange={(e) => handleResultChange(test.id, 'Blood Grouping (ABO)', e.target.value)}
                                  className="select select-bordered w-full h-10 text-sm"
                                >
                                  <option value="">Select</option>
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                  <option value="AB">AB</option>
                                  <option value="O">O</option>
                                </select>
                              </div>
                              
                              {/* Rh Factor - Radio Buttons */}
                              <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Rh Factor:</label>
                                <div className="flex gap-3 mt-1">
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`rh-factor-${test.id}`}
                                      value="Positive"
                                      checked={testResults[test.id]?.['Rh- Factor (Anti-D)'] === 'Positive'}
                                      onChange={(e) => handleResultChange(test.id, 'Rh- Factor (Anti-D)', e.target.value)}
                                      className="radio radio-primary radio-sm mr-2"
                                    />
                                    <span className="text-sm">Positive</span>
                                  </label>
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`rh-factor-${test.id}`}
                                      value="Negative"
                                      checked={testResults[test.id]?.['Rh- Factor (Anti-D)'] === 'Negative'}
                                      onChange={(e) => handleResultChange(test.id, 'Rh- Factor (Anti-D)', e.target.value)}
                                      className="radio radio-primary radio-sm mr-2"
                                    />
                                    <span className="text-sm">Negative</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          ) : test.id === 'widal_test' ? (
                            /* WIDAL Test - Single Row */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">S. Typhi - TO:</label>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium mr-2 bg-gray-100 px-2 py-1 rounded">1:</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="80"
                                    value={testResults[test.id]?.['S. Typhi - TO'] || ''}
                                    onChange={(e) => {
                                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                      handleResultChange(test.id, 'S. Typhi - TO', numericValue);
                                    }}
                                    className="input input-bordered w-full h-8 text-sm"
                                    maxLength="3"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">S. Typhi - TH:</label>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium mr-2 bg-gray-100 px-2 py-1 rounded">1:</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="80"
                                    value={testResults[test.id]?.['S. Typhi - TH'] || ''}
                                    onChange={(e) => {
                                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                      handleResultChange(test.id, 'S. Typhi - TH', numericValue);
                                    }}
                                    className="input input-bordered w-full h-8 text-sm"
                                    maxLength="3"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : test.id === 'crp_test' ? (
                            /* CRP Test - Single Row */
                            <div>
                              <label className="text-sm font-medium text-gray-700 block mb-2">CRP (C-Reactive Protein):</label>
                              <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`crp-${test.id}`}
                                    value="<6 mg/dl"
                                    checked={testResults[test.id]?.['CRP (C-Reactive Protein)'] === '<6 mg/dl'}
                                    onChange={(e) => handleResultChange(test.id, 'CRP (C-Reactive Protein)', e.target.value)}
                                    className="radio radio-primary radio-sm mr-2"
                                  />
                                  <span className="text-sm">&lt;6 mg/dl</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`crp-${test.id}`}
                                    value="<12 mg/dl"
                                    checked={testResults[test.id]?.['CRP (C-Reactive Protein)'] === '<12 mg/dl'}
                                    onChange={(e) => handleResultChange(test.id, 'CRP (C-Reactive Protein)', e.target.value)}
                                    className="radio radio-primary radio-sm mr-2"
                                  />
                                  <span className="text-sm">&lt;12 mg/dl</span>
                                </label>
                              </div>
                            </div>
                          ) : (
                            /* Other Tests - Single Row */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {test.parameters
                                .filter(param => param.isInput !== false)
                                .map((param, index) => (
                                <div key={index}>
                                  <label className="text-sm font-medium text-gray-700 block mb-1">{param.name}:</label>
                                  <input
                                    type="text"
                                    placeholder={`Enter value`}
                                    value={testResults[test.id]?.[param.name] || ''}
                                    onChange={(e) => handleResultChange(test.id, param.name, e.target.value)}
                                    className="input input-bordered w-full h-8 text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Generate Report Button */}
            {hasSelectedTests && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleGenerateReport}
                  className="btn btn-primary btn-lg text-xl px-8"
                >
                  🎯 Generate Report ({selectedTests.length} test{selectedTests.length > 1 ? 's' : ''})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Developer Credits */}
        <div className="mt-12 text-center border-t pt-8">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="text-gray-700">
              <p className="text-base mb-3">
                <span className="font-medium">Developed by:</span> 
                <a 
                  href="https://saddam-hosen.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 font-semibold ml-2 hover:text-blue-800 hover:underline transition-colors duration-200"
                >
                  Saddam Hosen
                </a>
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p> Full Stack Developer | saddamhosen1433@gmail.com</p>
                <p className="text-xs mt-3 text-gray-500">
                  © 2025 | Built with React.js & Modern Web Technologies
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabForm;
