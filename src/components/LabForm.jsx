import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import TestResultForm from './TestResultForm';

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
  const [selectedTest, setSelectedTest] = useState('');
  const [multipleMode, setMultipleMode] = useState(false);
  const [completedTests, setCompletedTests] = useState([]);
  const [showAddMore, setShowAddMore] = useState(false);

  // Pre-fill data if in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setPatientInfo(editData.patientInfo || {
        name: '',
        age: '',
        gender: '',
        patientId: ''
      });
      
      // Handle single test edit mode
      if (editData.selectedTest) {
        setSelectedTest(editData.selectedTest?.id || '');
      }
      
      // Handle multiple tests edit mode
      if (editData.completedTests) {
        setCompletedTests(editData.completedTests);
        setMultipleMode(true);
        setShowAddMore(true);
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
        { name: 'S. Para Typhi - AH', normalRange: 'Less Than 1:80', unit: 'Ratio', isInput: false },
        { name: 'S. Para Typhi - BH', normalRange: 'Less Than 1:80', unit: 'Ratio', isInput: false }
      ]
    },
    {
      id: 'blood_grouping',
      name: 'Blood Grouping',
      parameters: [
        { name: 'Blood Grouping (ABO)', normalRange: 'A, B, AB, O', unit: 'Type', isInput: true },
        { name: 'Rh- Factor (Anti-D)', normalRange: 'Positive/Negative', unit: 'Type', isInput: true }
      ]
    },
    {
      id: 'crp_test',
      name: 'CRP',
      parameters: [
        { name: 'CRP (C-Reactive Protein)', normalRange: 'Less than 6 mg/dl', unit: 'mg/dl', isInput: true }
      ]
    }
  ];

  const handlePatientInfoChange = (e) => {
    setPatientInfo({
      ...patientInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleTestSelection = (e) => {
    setSelectedTest(e.target.value);
  };

  const generatePatientId = () => {
    const id = 'PAT' + Date.now().toString().slice(-6);
    setPatientInfo({
      ...patientInfo,
      patientId: id
    });
  };

  const handleSubmitResults = (results) => {
    const testData = {
      test: testOptions.find(test => test.id === selectedTest),
      results: results,
      timestamp: new Date().toISOString()
    };

    if (!multipleMode) {
      // Single test - go to print immediately with correct format
      navigate('/print-report', { 
        state: { 
          patientInfo, 
          selectedTest: testData.test,
          testResults: testData.results,
          isMultipleTests: false
        } 
      });
    } else {
      // Multiple tests mode
      const newCompletedTests = [...completedTests, testData];
      setCompletedTests(newCompletedTests);
      setSelectedTest('');
      setShowAddMore(true);
    }
  };

  const handleAddMoreTests = () => {
    setShowAddMore(false);
  };

  const handleFinishAllTests = () => {
    navigate('/print-report', { 
      state: { 
        patientInfo, 
        completedTests: completedTests,
        isMultipleTests: completedTests.length > 1
      } 
    });
  };

  const handleStartMultipleMode = () => {
    setMultipleMode(true);
  };

  // Check if patient info is complete
  const isPatientInfoComplete = patientInfo.name && patientInfo.age && patientInfo.gender;
  
  // Check if test is selected
  const isTestSelected = selectedTest !== '';

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
            
            {/* Process Steps */}
            <div className="bg-black bg-opacity-70 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex flex-wrap justify-center items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <span className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-black">1</span>
                  <span className="text-lg">Patient Info</span>
                </div>
                <div className="text-blue-200">→</div>
                <div className="flex items-center gap-2">
                  <span className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-black">2</span>
                  <span className="text-lg">Select Test</span>
                </div>
                <div className="text-blue-200">→</div>
                <div className="flex items-center gap-2">
                  <span className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-black">3</span>
                  <span className="text-lg">Enter Results</span>
                </div>
                <div className="text-blue-200">→</div>
                <div className="flex items-center gap-2">
                  <span className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-black">4</span>
                  <span className="text-lg">Generate Report</span>
                </div>
              </div>
            </div>
            
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
        <div className="bg-white rounded-lg p-8 mb-8">
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

        {/* Test Selection - Auto appears when patient info is complete */}
        {isPatientInfoComplete && (
          <div className="bg-white rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">Select Test</h2>
            
            {/* Multiple Test Mode Toggle */}
            {completedTests.length === 0 && !multipleMode && (
              <div className="mb-6 p-6 bg-yellow-50 rounded-lg">
                <p className="text-xl mb-4">Choose test mode for this patient:</p>
                <div className="flex gap-6">
                  <button 
                    onClick={handleStartMultipleMode}
                    className="btn btn-primary text-xl h-14 px-6"
                  >
                    📋 Multiple Tests
                  </button>
                  <span className="text-gray-500 flex items-center text-xl">or</span>
                  <span className="text-blue-600 font-medium flex items-center text-xl">📄 Single Test (select below)</span>
                </div>
              </div>
            )}

            {/* Single Test Mode Option */}
            {(multipleMode || completedTests.length > 0) && (
              <div className="mb-6 p-6 bg-blue-50 rounded-lg">
                <p className="text-xl mb-4">Currently in: {multipleMode ? '📋 Multiple Tests Mode' : '📄 Single Test Mode'}</p>
                <div className="flex gap-6">
                  {multipleMode && (
                    <button 
                      onClick={() => {
                        setMultipleMode(false);
                        setCompletedTests([]);
                        setShowAddMore(false);
                        setSelectedTest('');
                      }}
                      className="btn btn-outline btn-primary text-xl h-14 px-6"
                    >
                      📄 Switch to Single Test
                    </button>
                  )}
                  {!multipleMode && completedTests.length === 0 && (
                    <button 
                      onClick={handleStartMultipleMode}
                      className="btn btn-outline btn-primary text-xl h-14 px-6"
                    >
                      📋 Switch to Multiple Tests
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Show completed tests */}
            {completedTests.length > 0 && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2 text-lg">Completed Tests:</h3>
                <div className="space-y-2">
                  {completedTests.map((testData, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                      <span className="font-medium">{testData.test.name}</span>
                      <span className="text-green-600">✓ Completed</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show add more or finish options */}
            {showAddMore && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-lg mb-3">Test completed! What would you like to do?</p>
                <div className="flex gap-4">
                  <button 
                    onClick={handleAddMoreTests}
                    className="btn btn-primary"
                  >
                    Add Another Test
                  </button>
                  <button 
                    onClick={handleFinishAllTests}
                    className="btn btn-success"
                  >
                    Generate Report ({completedTests.length} test{completedTests.length > 1 ? 's' : ''})
                  </button>
                </div>
              </div>
            )}
            
            {/* Test selection dropdown */}
            {!showAddMore && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-xl">
                    Choose Test Type * 
                    {multipleMode && completedTests.length > 0 && ` (Test ${completedTests.length + 1})`}
                    {!multipleMode && <span className="text-blue-600 ml-2">📄 Single Test Mode</span>}
                  </span>
                </label>
                <select
                  value={selectedTest}
                  onChange={handleTestSelection}
                  className="select select-bordered w-full text-xl h-14"
                  required
                >
                  <option value="">Select a test</option>
                  {testOptions.filter(test => !completedTests.find(completed => completed.test.id === test.id)).map(test => (
                    <option key={test.id} value={test.id}>
                      {test.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedTest && !showAddMore && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2 text-lg">
                  {testOptions.find(test => test.id === selectedTest)?.name} Parameters:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-base">
                  {testOptions.find(test => test.id === selectedTest)?.parameters.map((param, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="font-medium">{param.name}:</span>
                      <span className="text-blue-600">{param.normalRange}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Results - Auto appears when test is selected */}
        {isPatientInfoComplete && isTestSelected && !showAddMore && (
          <TestResultForm
            test={testOptions.find(test => test.id === selectedTest)}
            onSubmit={handleSubmitResults}
            existingResults={isEditMode ? editData?.testResults : null}
          />
        )}
      </div>
    </div>
  );
};

export default LabForm;
