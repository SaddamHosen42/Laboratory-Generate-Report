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
    setTestResults(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [paramName]: value
      }
    }));
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
        
        // For WIDAL test, format TO and TH values and add fixed AH and BH
        if (testId === 'widal_test') {
          // Format TO and TH values with 1: prefix (avoid double 1:)
          if (results['S. Typhi - TO']) {
            const toValue = results['S. Typhi - TO'].toString();
            results['S. Typhi - TO'] = toValue.startsWith('1:') ? toValue : `1:${toValue}`;
          }
          if (results['S. Typhi - TH']) {
            const thValue = results['S. Typhi - TH'].toString();
            results['S. Typhi - TH'] = thValue.startsWith('1:') ? thValue : `1:${thValue}`;
          }
          // Add fixed values for AH and BH
          results['S. Para Typhi - AH'] = '1:80';
          results['S. Para Typhi - BH'] = '1:80';
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
                    {/* Left side - Input fields (when test is selected) */}
                    <div className="order-2 lg:order-1">
                      {selectedTests.includes(test.id) && (
                        <div className="space-y-3">
                          <h4 className="text-lg font-medium text-gray-700 mb-4">Enter Results:</h4>
                          {test.parameters
                            .filter(param => param.isInput !== false)
                            .map((param, index) => (
                            <div key={index} className="space-y-2">
                              <label className="text-base font-medium text-gray-700">{param.name}:</label>
                              {test.id === 'widal_test' && (param.name === 'S. Typhi - TO' || param.name === 'S. Typhi - TH') ? (
                                <div className="flex items-center">
                                  <span className="text-base font-medium mr-2 bg-gray-100 px-2 py-1 rounded">1:</span>
                                  <input
                                    type="number"
                                    placeholder="Enter number only (e.g., 80, 160)"
                                    value={testResults[test.id]?.[param.name] || ''}
                                    onChange={(e) => handleResultChange(test.id, param.name, e.target.value)}
                                    className="input input-bordered w-full h-10 text-base"
                                    min="1"
                                    max="999"
                                  />
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  placeholder={`Enter value (${param.unit})`}
                                  value={testResults[test.id]?.[param.name] || ''}
                                  onChange={(e) => handleResultChange(test.id, param.name, e.target.value)}
                                  className="input input-bordered w-full h-10 text-base"
                                />
                              )}
                              <span className="text-sm text-gray-500">Normal: {param.normalRange}</span>
                            </div>
                          ))}
                          
                          {/* Show fixed values for WIDAL AH and BH */}
                          {test.id === 'widal_test' && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                              <p className="text-sm font-medium text-blue-800 mb-2">Fixed Values (Auto-added to report):</p>
                              <div className="space-y-1 text-sm text-blue-700">
                                <div className="flex justify-between">
                                  <span>S. Para Typhi - AH:</span>
                                  <span className="font-medium">1:80</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>S. Para Typhi - BH:</span>
                                  <span className="font-medium">1:80</span>
                                </div>
                              </div>
                              <p className="text-xs text-blue-600 mt-2">
                                💡 Only enter numbers for TO and TH (e.g., 80, 160). The "1:" will be added automatically.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Right side - Test selection and info */}
                    <div className="order-1 lg:order-2">
                      <div className="flex items-center space-x-3 mb-4">
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
                      
                      {/* Show test parameters info */}
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-2">Test Parameters:</p>
                        <ul className="space-y-1">
                          {test.parameters.map((param, index) => (
                            <li key={index} className="flex justify-between">
                              <span className={param.isInput === false ? 'text-gray-400' : ''}>
                                {param.name}
                              </span>
                              <span className={`${param.isInput === false ? 'text-gray-400' : 'text-blue-600'}`}>
                                {param.isInput === false ? 'Fixed: 1:80' : `(${param.unit})`}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
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
      </div>
    </div>
  );
};

export default LabForm;
