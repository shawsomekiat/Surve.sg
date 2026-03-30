import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import SurveyeeDashboard from './pages/surveyee/Dashboard'
import SurveyFlow from './pages/surveyee/SurveyFlow'
import Wallet from './pages/surveyee/Wallet'
import SurveyeeLogin from './pages/surveyee/Login'
import ProfileSetup from './pages/surveyee/ProfileSetup'
import SurveysPage from './pages/surveyee/Surveys'
import SurveyorDashboard from './pages/surveyor/Dashboard'
import CreateSurvey from './pages/surveyor/CreateSurvey'
import Hub from './pages/surveyor/Hub'
import SurveyorLogin from './pages/surveyor/Login'
import QualityReview from './pages/surveyor/QualityReview'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/surveyee/login" element={<SurveyeeLogin />} />
      <Route path="/surveyee/dashboard" element={<SurveyeeDashboard />} />
      <Route path="/surveyee/survey/:id" element={<SurveyFlow />} />
      <Route path="/surveyee/wallet" element={<Wallet />} />
      <Route path="/surveyee/profile-setup" element={<ProfileSetup />} />
      <Route path="/surveyee/surveys" element={<SurveysPage />} />
      <Route path="/surveyor/login" element={<SurveyorLogin />} />
      <Route path="/surveyor/dashboard" element={<SurveyorDashboard />} />
      <Route path="/surveyor/create" element={<CreateSurvey />} />
      <Route path="/surveyor/hub" element={<Hub />} />
      <Route path="/surveyor/quality-review" element={<QualityReview />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App