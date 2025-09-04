import { useState, useEffect } from 'react';

const TestResultForm = ({ test, onSubmit, existingResults }) => {
  const [results, setResults] = useState({});

  // Pre-fill results if editing
  useEffect(() => {
    if (existingResults) {
      setResults(existingResults);
    }
  }, [existingResults]);

  const handleResultChange = (parameterName, value) => {
    setResults({
      ...results,
      [parameterName]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalResults = {
      ...results,
      // Auto-fill AH and BH with 1:80 for WIDAL test
      ...(test.id === 'widal_test' ? {
        'S. Para Typhi - AH': '1:80',
        'S. Para Typhi - BH': '1:80'
      } : {}),
      timestamp: new Date().toISOString(),
      technician: 'Lab Technician'
    };
    onSubmit(finalResults);
  };

  const isFormValid = () => {
    if (test.id === 'widal_test') {
      // For WIDAL test, only check TO and TH fields
      const requiredFields = test.parameters.filter(param => param.isInput);
      return requiredFields.every(param => 
        results[param.name] && results[param.name].trim() !== ''
      );
    }
    return test?.parameters.every(param => 
      results[param.name] && results[param.name].trim() !== ''
    );
  };

  if (!test) return null;

  return (
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">
        Enter Test Results: {test.name}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {test.parameters.filter(parameter => parameter.isInput !== false).map((parameter, index) => (
            <div key={index} className="border rounded-lg p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div>
                  <label className="label">
                    <span className="label-text font-medium text-xl">{parameter.name} *</span>
                  </label>
                  <p className="text-sm text-gray-600">Unit: {parameter.unit}</p>
                </div>
                
                <div>
                  <label className="label">
                    <span className="label-text text-lg">Normal Range</span>
                  </label>
                  <p className="text-lg bg-green-100 text-green-800 p-3 rounded">
                    {parameter.normalRange}
                  </p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text text-xl">Result Value *</span>
                  </label>
                  {/* Debug logging */}
                  {console.log('Debug:', { testId: test.id, parameterName: parameter.name })}
                  {test.id === 'blood_grouping' ? (
                    parameter.name === 'Blood Grouping (ABO)' ? (
                      // Dropdown for Blood Grouping (ABO)
                      <select
                        value={results[parameter.name] || ''}
                        onChange={(e) => handleResultChange(parameter.name, e.target.value)}
                        className="select select-bordered w-full text-xl h-14"
                        required
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                      </select>
                    ) : parameter.name === 'Rh- Factor (Anti-D)' ? (
                      // Radio buttons for Rh Factor
                      <div className="flex gap-6 mt-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`radio-${parameter.name}`}
                            value="Positive"
                            checked={results[parameter.name] === 'Positive'}
                            onChange={(e) => handleResultChange(parameter.name, e.target.value)}
                            className="radio radio-primary mr-3 w-6 h-6"
                            required
                          />
                          <span className="label-text text-xl">Positive</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`radio-${parameter.name}`}
                            value="Negative"
                            checked={results[parameter.name] === 'Negative'}
                            onChange={(e) => handleResultChange(parameter.name, e.target.value)}
                            className="radio radio-primary mr-3 w-6 h-6"
                            required
                          />
                          <span className="label-text text-xl">Negative</span>
                        </label>
                      </div>
                    ) : null
                  ) : test.id === 'crp_test' && parameter.name === 'CRP (C-Reactive Protein)' ? (
                    // Radio buttons for CRP Test
                    <div className="flex gap-6 mt-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`radio-${parameter.name}`}
                          value="<6 mg/dl"
                          checked={results[parameter.name] === '<6 mg/dl'}
                          onChange={(e) => handleResultChange(parameter.name, e.target.value)}
                          className="radio radio-primary mr-3 w-6 h-6"
                          required
                        />
                        <span className="label-text text-xl">&lt;6 mg/dl</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`radio-${parameter.name}`}
                          value="<12 mg/dl"
                          checked={results[parameter.name] === '<12 mg/dl'}
                          onChange={(e) => handleResultChange(parameter.name, e.target.value)}
                          className="radio radio-primary mr-3 w-6 h-6"
                          required
                        />
                        <span className="label-text text-xl">&lt;12 mg/dl</span>
                      </label>
                    </div>
                  ) : (
                    // Regular text input for other tests
                    <input
                      type="text"
                      value={results[parameter.name] || ''}
                      onChange={(e) => handleResultChange(parameter.name, e.target.value)}
                      placeholder={`Enter ${parameter.name} value`}
                      className="input input-bordered w-full text-xl h-14"
                      required
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={!isFormValid()}
            className="btn btn-primary text-xl h-16 px-8"
          >
            Generate Report →
          </button>
        </div>
      </form>

      {/* Results Preview */}
      {Object.keys(results).length > 0 && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-4 text-xl">Results Preview:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-lg">
            {Object.entries(results).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span className="text-blue-600">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultForm;
