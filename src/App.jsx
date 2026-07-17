import { Navigate, Route, Routes } from 'react-router-dom'
import { WorkspaceProvider } from './context/WorkspaceContext'
import AddBranch from './pages/AddBranch'
import AddComboPackage from './pages/AddComboPackage'
import AddCommission from './pages/AddCommission'
import AddEmployee from './pages/AddEmployee'
import AddSalaryRecord from './pages/AddSalaryRecord'
import AddSeasonalOffer from './pages/AddSeasonalOffer'
import AddService from './pages/AddService'
import AddServiceCategory from './pages/AddServiceCategory'
import AddShift from './pages/AddShift'
import AddTarget from './pages/AddTarget'
import AddWorkingHours from './pages/AddWorkingHours'
import AssignedEmployees from './pages/AssignedEmployees'
import BranchStaff from './pages/BranchStaff'
import BranchDetails from './pages/BranchDetails'
import Branches from './pages/Branches'
import CommissionDetails from './pages/CommissionDetails'
import Commissions from './pages/Commissions'
import ComboPackageDetails from './pages/ComboPackageDetails'
import ComboPackages from './pages/ComboPackages'
import EditBranch from './pages/EditBranch'
import EditCommission from './pages/EditCommission'
import EditComboPackage from './pages/EditComboPackage'
import EditEmployee from './pages/EditEmployee'
import EditSalaryRecord from './pages/EditSalaryRecord'
import EditSeasonalOffer from './pages/EditSeasonalOffer'
import EditService from './pages/EditService'
import EditServiceCategory from './pages/EditServiceCategory'
import EditShift from './pages/EditShift'
import EditTarget from './pages/EditTarget'
import EditWorkingHours from './pages/EditWorkingHours'
import EmployeeBranchHistory from './pages/EmployeeBranchHistory'
import EmployeeDetails from './pages/EmployeeDetails'
import Employees from './pages/Employees'
import SalaryDetails from './pages/SalaryDetails'
import SalaryRecords from './pages/SalaryRecords'
import SeasonalOfferDetails from './pages/SeasonalOfferDetails'
import SeasonalOffers from './pages/SeasonalOffers'
import ShiftDetails from './pages/ShiftDetails'
import ShiftSchedule from './pages/ShiftSchedule'
import Shifts from './pages/Shifts'
import ServiceCategories from './pages/ServiceCategories'
import ServiceCategoryDetails from './pages/ServiceCategoryDetails'
import ServiceDetails from './pages/ServiceDetails'
import Services from './pages/Services'
import TargetDetails from './pages/TargetDetails'
import Targets from './pages/Targets'
import WorkingHoursDetails from './pages/WorkingHoursDetails'
import WorkingHoursList from './pages/WorkingHoursList'
import ForgotPassword from './pages/auth/ForgotPassword'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/dashboard/Dashboard'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import Profile from './pages/profile/Profile'
import BusinessSettings from './pages/settings/BusinessSettings'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<WorkspaceProvider />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/branches/new" element={<AddBranch />} />
          <Route path="/branches/:id" element={<BranchDetails />} />
          <Route path="/branches/:id/edit" element={<EditBranch />} />
          <Route path="/branch-staff" element={<BranchStaff />} />
          <Route path="/assigned-employees" element={<AssignedEmployees />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/new" element={<AddEmployee />} />
          <Route path="/employees/:id" element={<EmployeeDetails />} />
          <Route path="/employees/:id/branches" element={<EmployeeBranchHistory />} />
          <Route path="/employees/:id/edit" element={<EditEmployee />} />
          <Route path="/working-hours" element={<WorkingHoursList />} />
          <Route path="/working-hours/new" element={<AddWorkingHours />} />
          <Route path="/working-hours/:id" element={<WorkingHoursDetails />} />
          <Route path="/working-hours/:id/edit" element={<EditWorkingHours />} />
          <Route path="/salary-records" element={<SalaryRecords />} />
          <Route path="/salary-records/new" element={<AddSalaryRecord />} />
          <Route path="/salary-records/:id" element={<SalaryDetails />} />
          <Route path="/salary-records/:id/edit" element={<EditSalaryRecord />} />
          <Route path="/commissions" element={<Commissions />} />
          <Route path="/commissions/new" element={<AddCommission />} />
          <Route path="/commissions/:id" element={<CommissionDetails />} />
          <Route path="/commissions/:id/edit" element={<EditCommission />} />
          <Route path="/targets" element={<Targets />} />
          <Route path="/targets/new" element={<AddTarget />} />
          <Route path="/targets/:id" element={<TargetDetails />} />
          <Route path="/targets/:id/edit" element={<EditTarget />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/shifts/new" element={<AddShift />} />
          <Route path="/shifts/schedule" element={<ShiftSchedule />} />
          <Route path="/shifts/:id" element={<ShiftDetails />} />
          <Route path="/shifts/:id/edit" element={<EditShift />} />
          <Route path="/shift-schedule" element={<ShiftSchedule />} />
          <Route path="/service-categories" element={<ServiceCategories />} />
          <Route path="/service-categories/new" element={<AddServiceCategory />} />
          <Route path="/service-categories/:id" element={<ServiceCategoryDetails />} />
          <Route path="/service-categories/:id/edit" element={<EditServiceCategory />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/new" element={<AddService />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/services/:id/edit" element={<EditService />} />
          <Route path="/combo-packages" element={<ComboPackages />} />
          <Route path="/combo-packages/new" element={<AddComboPackage />} />
          <Route path="/combo-packages/:id" element={<ComboPackageDetails />} />
          <Route path="/combo-packages/:id/edit" element={<EditComboPackage />} />
          <Route path="/seasonal-offers" element={<SeasonalOffers />} />
          <Route path="/seasonal-offers/new" element={<AddSeasonalOffer />} />
          <Route path="/seasonal-offers/:id" element={<SeasonalOfferDetails />} />
          <Route path="/seasonal-offers/:id/edit" element={<EditSeasonalOffer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings/business" element={<BusinessSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
