import { useRef } from "react";
import { Link, useLocation } from "react-router";
import { useReactToPrint } from "react-to-print";

const ReactToPrint = () => {
  const contentRef = useRef();
  const location = useLocation();
  const { patientInfo, selectedTest, testResults, completedTests, isMultipleTests } = location.state || {};

  // Handle both single and multiple test scenarios
  const testsToDisplay = isMultipleTests ? completedTests : (selectedTest ? [{ test: selectedTest, results: testResults }] : []);
  
  // Debug logging
  console.log('ReactToPrint Debug:', {
    patientInfo,
    selectedTest,
    testResults,
    completedTests,
    isMultipleTests,
    testsToDisplay
  });

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Lab_Report_${patientInfo?.patientId || "Unknown"}_${
      new Date().toISOString().split("T")[0]
    }_${isMultipleTests ? 'Multiple_Tests' : 'Single_Test'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .print-content {
          width: 210mm;
          min-height: 297mm;
          margin: 0;
          padding: 20mm;
        }
        .page-break {
          page-break-before: always;
          break-before: page;
        }
        .single-test-page {
          width: 210mm;
          min-height: 297mm;
          position: relative;
          padding: 20mm;
          margin: 0;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .single-test-page:not(:first-child) {
          page-break-before: always;
          break-before: page;
        }
        table { 
          page-break-inside: avoid;
          break-inside: avoid;
        }
        tr { 
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .no-break { 
          page-break-inside: avoid;
          break-inside: avoid;
        }
      }
    `,
  });

  if (!patientInfo || testsToDisplay.length === 0) {
    return (
      <div className="text-center min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            No Report Data Found
          </h2>
          <p className="text-gray-600 mb-4">
            Please complete the lab form first.
          </p>
          <Link to="/">
            <button className="btn btn-primary">Go to Lab Form</button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return (
      new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) +
      " at " +
      new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  return (
    <div className="grid grid-cols-4">
      {/* Report Preview */}
      <div className="min-h-screen bg-gray-100 py-8 col-span-3">
        <div className="max-w-4xl mx-auto px-4">
          {/* Print Content - Multiple Pages */}
          <div ref={contentRef}>
            {testsToDisplay.map((testData, testIndex) => (
              <div 
                key={testIndex} 
                className={`single-test-page ${testIndex > 0 ? 'page-break' : ''}`}
                style={{ width: "210mm", minHeight: "297mm" }}
              >
                {/* Header for each page */}
                <div className="text-center mb-5">
                  <h1 className="text-5xl font-medium playfair-font">
                    Upazila Health Complex
                  </h1>
                  <p className="text-3xl font-medium playfair-font">
                    Banaripara, Barishal.
                  </p>
                </div>

                {/* Patient Information Table for each page */}
                <div className="mb-6">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="border border-black px-4 py-2 bg-gray-100 font-medium w-1/6">
                          Name
                        </td>
                        <td className="border border-black px-4 py-2 w-1/3 font-medium">
                          {patientInfo.name}
                        </td>
                        <td className="border border-black px-4 py-2 bg-gray-100 font-medium w-1/6">
                          Reg. No
                        </td>
                        <td className="border border-black px-4 py-2 w-1/3">
                          {patientInfo.patientId || 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black px-4 py-2 bg-gray-100 font-medium">
                          Age
                        </td>
                        <td className="border border-black px-4 py-2">
                          {patientInfo.age} Year's
                        </td>
                        <td className="border border-black px-4 py-2 bg-gray-100 font-medium">
                          Sex
                        </td>
                        <td className="border border-black px-4 py-2">
                          {patientInfo.gender}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black px-4 py-2 bg-gray-100 font-medium">
                          Sample
                        </td>
                        <td className="border border-black px-4 py-2">Blood</td>
                        <td className="border border-black px-4 py-2 bg-gray-100 font-medium">
                          Date
                        </td>
                        <td className="border border-black px-4 py-2">
                          {formatDate(testData.timestamp || testData.results?.timestamp || new Date().toISOString())}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black px-4 py-2 bg-gray-100 font-medium">
                          Refd. by
                        </td>
                        <td className="border border-black px-4 py-2" colSpan="3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Test Name Header */}
                <div className="text-center mb-4 mt-10">
                  <h2 className="text-xl font-bold underline">
                    {testData.test.name.toUpperCase()}
                  </h2>
                </div>

                {/* Test Results Table */}
                <div className="mb-8">
                  {testData.test.id === "blood_grouping" ? (
                    // Special layout for Blood Grouping
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black px-4 py-3 text-left font-bold w-1/2">
                            TEST
                          </th>
                          <th className="border border-black px-4 py-3 text-center font-bold w-1/2">
                            RESULT
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black px-4 py-3 font-medium">
                            Blood Grouping (ABO)
                          </td>
                          <td className="border border-black px-4 py-3 text-center font-bold text-lg">
                            {(() => {
                              const aboGroup = testData.results["Blood Grouping (ABO)"];
                              const rhFactor = testData.results["Rh- Factor (Anti-D)"];
                              if (aboGroup && rhFactor) {
                                const rhSymbol = rhFactor === "Positive" ? "+" : "-";
                                return `${aboGroup}${rhSymbol}`;
                              }
                              return aboGroup || "N/A";
                            })()}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-black px-4 py-3 font-medium">
                            Rh- Factor (Anti-D)
                          </td>
                          <td className="border border-black px-4 py-3 text-center font-bold text-lg">
                            {testData.results["Rh- Factor (Anti-D)"] || "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : testData.test.id === "crp_test" ? (
                    // Special layout for CRP
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black px-4 py-3 text-left font-bold w-2/5">
                            NAME OF TEST
                          </th>
                          <th className="border border-black px-4 py-3 text-center font-bold w-1/5">
                            RESULT
                          </th>
                          <th className="border border-black px-4 py-3 text-center font-bold w-2/5">
                            NORMAL RANGE
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {testData.test.parameters.map((param, index) => (
                          <tr key={index}>
                            <td className="border border-black px-4 py-3 font-medium">
                              {param.name}
                            </td>
                            <td className="border border-black px-4 py-3 text-center font-bold">
                              {testData.results[param.name] || "N/A"}
                            </td>
                            <td className="border border-black px-4 py-3 text-center">
                              {param.normalRange}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    // Default layout for other tests including WIDAL
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black px-4 py-3 text-left font-bold w-2/5">
                            NAME OF TEST
                          </th>
                          <th className="border border-black px-4 py-3 text-center font-bold w-1/5">
                            RESULT
                          </th>
                          <th className="border border-black px-4 py-3 text-center font-bold w-2/5">
                            NORMAL RANGE
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {testData.test.parameters.map((param, index) => (
                          <tr key={index}>
                            <td className="border border-black px-4 py-3 font-medium">
                              {param.name}
                            </td>
                            <td className="border border-black px-4 py-3 text-center font-bold">
                              {testData.results[param.name] || "N/A"}
                            </td>
                            <td className="border border-black px-4 py-3 text-center">
                              {param.normalRange}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Footer with Signatures - Fixed at bottom of each page */}
                <div className="mt-auto pt-8">
                  <div className="grid grid-cols-2 gap-16">
                    <div className="text-left">
                      <div className="border-t border-black pt-2">
                        <p className="text-base font-medium">Md.Rowsan Ali Rakib</p>
                        <p className="text-sm">D.M.T(Laboratory Medicine)</p>
                        <p className="text-sm">Medical Technologist(Lab)</p>
                        <p className="text-sm">Upazila Health Complex</p>
                        <p className="text-sm">Banaripara, Barishal.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="border-t border-black pt-2">
                        <p className="text-base font-medium">Md.Al-Amin</p>
                        <p className="text-sm">D.M.T(Laboratory Medicine)</p>
                        <p className="text-sm">Medical Technologist(Lab)</p>
                        <p className="text-sm">Upazila Health Complex</p>
                        <p className="text-sm">Banaripara, Barishal.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Action Buttons Sidebar */}
      <div className="col-span-1 p-6 mt-20">
        <div className="grid gap-4 grid-cols-2">
          <Link to="/" state={{ 
            editMode: true, 
            patientInfo, 
            selectedTest: isMultipleTests ? null : selectedTest, 
            testResults: isMultipleTests ? null : testResults,
            completedTests: isMultipleTests ? completedTests : null
          }}>
            <button className="btn btn-warning w-full">✏️ Edit Report</button>
          </Link>
          <Link to="/">
            <button className="btn btn-primary w-full">← New Report</button>
          </Link>
          <button className="btn bg-green-600 text-white hover:bg-green-800 w-full" onClick={reactToPrintFn}>
            🖨️ Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReactToPrint;
