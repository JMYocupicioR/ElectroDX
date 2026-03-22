import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ClinicalWorkflow from './components/ClinicalWorkflow';
import FileUpload from './components/FileUpload';
import EvaluationComplete from './components/EvaluationComplete';
import IntegratedEMGWorkflow from './components/IntegratedEMGWorkflow';
import ExerciseMode from './components/ExerciseMode';

const App: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Router>
        <Routes>
          <Route path="/exercise" element={<ExerciseMode />} />
          <Route path="/evaluation-complete" element={<EvaluationComplete />} />
          <Route path="/file-upload" element={<FileUpload />} />
          <Route path="/clinical" element={<ClinicalWorkflow />} />
          <Route path="/clinical-emg" element={<IntegratedEMGWorkflow />} />
          <Route path="/" element={
            <HomePage 
              onStartEvaluation={() => {
                window.location.href = '/clinical';
              }} 
            />
          } />
        </Routes>
      </Router>
    </div>
  );
};

export default App;