import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import SurveyeeDashboard from './pages/surveyee/Dashboard'
import SurveyFlow from './pages/surveyee/SurveyFlow'
import Wallet from './pages/surveyee/Wallet'
import SurveyorDashboard from './pages/surveyor/Dashboard'
import CreateSurvey from './pages/surveyor/CreateSurvey'
import Hub from './pages/surveyor/Hub'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/surveyee/dashboard" element={<SurveyeeDashboard />} />
      <Route path="/surveyee/survey/:id" element={<SurveyFlow />} />
      <Route path="/surveyee/wallet" element={<Wallet />} />
      <Route path="/surveyor/dashboard" element={<SurveyorDashboard />} />
      <Route path="/surveyor/create" element={<CreateSurvey />} />
      <Route path="/surveyor/hub" element={<Hub />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App