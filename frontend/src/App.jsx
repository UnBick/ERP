import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider , createTheme } from '@mui/material/styles';
import { GlobalStyles } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AuthProvider from './contexts/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './components/Home/HomePage';
import { StudentProvider } from './components/admin/Students/context/StudentContext';
import { AlertProvider } from './components/common/AlertProvider';
import { SnackbarProvider } from 'notistack';
import { SettingsProvider } from './context/SettingsContext';
import { TeacherProvider } from './context/TeacherContext';
import { createGlobalStyle } from 'styled-components'; // Add this import
import Sidebar from './components/common/Sidebar';

// Auth Components
import LoginForm from './components/auth/LoginForm';
//import RegisterForm from './components/auth/RegisterForm';
import OtpLoginForm from './components/auth/OtpLoginForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';

// Admin Components
import AdminDashboard from './components/admin/Dashboard';
import Classes from './components/admin/Academic/Classes';
import Sections from './components/admin/Academic/Sections';
import Subjects from './components/admin/Academic/Subjects';
import Syllabus from './components/admin/Academic/Syllabus';
import AdminTimetable from './components/admin/Academic/TImetable';
import Grades from './components/admin/Exams/Grades';
import Marks from './components/admin/Exams/Marks';
import Results from './components/admin/Exams/Results';
import Schedule from './components/admin/Exams/Schedule';
import ScheduleExam from './components/admin/Exams/ScheduleExam';
import PublishExam from './components/admin/Exams/PublishExam';
import FeeCollection from './components/admin/Fees/FeeCollection';
import PendingFees from './components/admin/Fees/PendingFees';
import Receipts from './components/admin/Fees/Receipts';
import BankReconciliation from './components/admin/Finance/Fee/BankReconciliation';
import FeeAdjustment from './components/admin/Finance/Fee/FeeAdjustment';
import FeeCollectionRecords from './components/admin/Finance/Fee/FeeCollectionRecords';
import FeeStructure from './components/admin/Finance/Fee/FeeStructure';
import FeeWaivers from './components/admin/Finance/Fee/FeeWaivers';
import PaymentGateway from './components/admin/Finance/Fee/PaymentGateway';
import Salary from './components/admin/Finance/Payroll/Salary';
import FinanceReports from './components/admin/Finance/Reports/FinanceReports';
import PayrollReport from './components/admin/Finance/Reports/PayrollReport';
import AttendanceReports from './components/admin/Reports/AttendanceReports';
import ExamReport from './components/admin/Reports/ExamReport';
import StudentReports from './components/admin/Reports/StudentReports';
import Message from './components/admin/communication/MessageSettings';
import Backup from './components/admin/Settings/Backup';
import GeneralSettings from './components/admin/Settings/GeneralSettings';
import Inbox from './components/admin/communication/Inbox';
import Design from './components/admin/Settings/Templates';
import Templates from './components/admin/Settings/TemplateList';
import UserManagement from './components/admin/Settings/UserManagement';
import StaffAttendance from './components/admin/Staff/StaffAttendance';
import StaffLeave from './components/admin/Staff/StaffLeave';
import StaffLibrary from './components/admin/Staff/StaffLibrary';
import StaffList from './components/admin/Staff/StaffList';
import StaffReports from './components/admin/Staff/StaffReports';
import StaffServices from './components/admin/Staff/StaffServices';
import StaffTransport from './components/admin/Staff/StaffTransport';
import Manager from './components/admin/Students/AdmissionManagement';
import Examinations from './components/admin/Students/Examinations';
import AdminStudentAttendance from './components/admin/Students/StudentAttendance';
import StudentLibrary from './components/admin/Students/StudentLibrary';
import StudentList from './components/admin/Students/StudentList';
import StudentServices from './components/admin/Students/StudentServices';
import StudentTransport from './components/admin/Students/StudentTransport';
import AdminBooks from './components/admin/unbickSchooling/books';
import AdminPredefinedSyllabus from './components/admin/unbickSchooling/PredefinedSyllabus';
import StudentPromotion from './components/admin/Students/StudentPromotion';
import AddStudent from './components/admin/Students/AddStudent';
import Signature from './components/admin/Settings/SignatureManager';
import ManageExam from './components/admin/Exams/ExamManage';

// Parent Components
import ParentDashboard from './components/parent/ParentDashboard';
import FeesDetails from './components/parent/FeesDetails';
import ParentInbox from './components/parent/communication/inbox';
import ParentMessage from './components/parent/communication/message';
import StudentProgress from './components/parent/StudentProgress';
import ParentGeneralSettings from './components/parent/Settings/GeneralSettings';
import ParentNotifications from './components/parent/Settings/Notifications';
import ParentPasswordManagement from './components/parent/Settings/PasswordManagement';
import ParentProfile from './components/parent/Settings/Profile';
import ParentBooks from './components/parent/UnbickSchooling/Books';
import ParentPredefinedSyllabus from './components/parent/UnbickSchooling/PredefinedSyllabus';
import BusTracking from './components/parent/BusTracking';
import ParentAttendance from './components/parent/attendance';
import ParentResults from './components/parent/grades';

// Student Components
import StudentDashboard from './components/student/StudentDashboard';
import Assignment from './components/student/Assignment';
import StudentAttendance from './components/student/Attendance';
import StudentGrades from './components/student/Grades';
import StudentTimetable from './components/student/Timetable';
import StudentGeneralSettings from './components/student/Settings/GeneralSettings';
import StudentNotifications from './components/student/Settings/Notifications';
import StudentPasswordManagement from './components/student/Settings/PasswordManagement';
import StudentProfile from './components/student/Settings/Profile';
import StudentBooks from './components/student/UnbickSchooling/Books';
import StudentPredefinedSyllabus from './components/student/UnbickSchooling/PredefinedSyllabus';
import StudentMessage from './components/student/communication/message';
import StudentInbox from './components/student/communication/inbox';

// Teacher Components
import TeacherDashboard from './components/teacher/TeacherDashboard';
import ClassSchedule from './components/teacher/ClassSchedule';
import Grading from './components/teacher/Grading';
import TeacherReports from './components/teacher/Reports';
import TeacherAttendanceSelf from './components/teacher/Attendance/Self';
import TeacherAttendanceStudent from './components/teacher/Attendance/Student';
import TeacherGeneralSettings from './components/teacher/Settings/GeneralSettings';
import TeacherNotifications from './components/teacher/Settings/Notifications';
import TeacherPasswordManagement from './components/teacher/Settings/PasswordManagement';
import TeacherProfile from './components/teacher/Settings/Profile';
import TeacherBooks from './components/teacher/UnbickSchooling/Books';
import TeacherPredefinedSyllabus from './components/teacher/UnbickSchooling/PredefinedSyllabus';
import TeacherMessage from './components/teacher/communication/message';
import TeacherInbox from './components/teacher/communication/inbox';

//pages Components
import Admissions from './components/Home/sections/Admissions';
import AboutSchool from './components/pages/About/AboutSchool';
import Awards from './components/pages/About/Awards';
import Infrastructure from './components/pages/About/Infrastructure';
import MandatoryDisclosure from './components/pages/About/MandatoryDisclosure';
import PhilosophyMission from './components/pages/About/PhilosophyMission';
import PrincipalMessage from './components/pages/About/PrincipalMessage';
import StudentCouncil from './components/pages/About/StudentCouncil';
import ArtIntegration from './components/pages/Academics/ArtIntegration';
import Curriculum from './components/pages/Academics/Curriculum';
import Faculty from './components/pages/Academics/Faculty';
import QuestionPapers from './components/pages/Academics/QuestionPapers';
import ScholarBadge from './components/pages/Academics/ScholarBadge';
import PagesSyllabus from './components/pages/Academics/Syllabus';
import Assemblies from './components/pages/Activities/Assemblies';
import Clubs from './components/pages/Activities/Clubs';
import Cultural from './components/pages/Activities/Cultural';
import InterHouse from './components/pages/Activities/InterHouse';
import Sports from './components/pages/Activities/Sports';
import Workshops from './components/pages/Activities/Workshops';
import FAQs from './components/pages/Admissions/FAQs';
import Fees from './components/pages/Admissions/Fees';
import Process from './components/pages/Admissions/Process';
import Contact from './components/pages/Contact/Contact';
import Events from './components/pages/Events/Events';
import News from './components/pages/Gallery/News';
import Photos from './components/pages/Gallery/Photos';
import Videos from './components/pages/Gallery/Videos';


import AcademicCalendar from './components/admin/schoolpage/Calendar/AcademicCalendar';
import WebsiteManager from './components/admin/schoolpage/Pages/WebsiteManager';
import AboutManager from './components/admin/schoolpage/sections/AboutManager';
import AcademicsManager from './components/admin/schoolpage/sections/AcademicsManager';
import ActivitiesManager from './components/admin/schoolpage/sections/ActivitiesManager';
import GalleryManager from './components/admin/schoolpage/sections/GalleryManager';
import HomePageManager from './components/admin/schoolpage/sections/HomePageManager';
import ThemeManager from './components/admin/schoolpage/Pages/settings/ThemeManager';
import ContactManager from './components/admin/schoolpage/Pages/contact/ContactManager';


import AdminLayout from './components/admin/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { DesignServices } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e', // Add missing main color for secondary
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a237e',
          color: '#fff',
        },
      },
    },
    // Add more component customizations
  },
});

const CustomGlobalStyles = createGlobalStyle`
  * {
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  body {
    overflow-y: auto;
  }

  .main-content-wrapper {
    height: 100vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const App = () => {
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CustomGlobalStyles /> {/* Changed from GlobalStyles to CustomGlobalStyles */}
        <CssBaseline />
        <SnackbarProvider 
          maxSnack={3} 
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <AuthProvider>
            <SettingsProvider>  {/* Add SettingsProvider here */}
              <StudentProvider>
                <TeacherProvider>
                  <AlertProvider>
                    <ErrorBoundary>
                      <Router>
                        <div className="app-layout">
                          <Sidebar />
                          <div className="main-content-wrapper">
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/login" element={<LoginForm />} />
                              <Route path="/otp-login" element={<OtpLoginForm />} />
                              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                              <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
                              
                              {/* Admin Routes */}
                              <Route 
                                path="/admin/dashboard" 
                                element={
                                  <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminLayout>
                                      <AdminDashboard />
                                    </AdminLayout>
                                  </ProtectedRoute>
                                } 
                              />
                              <Route path="/admin/academic/classes" element={<Classes />} />
                              <Route path="/admin/academic/sections" element={<Sections />} />
                              <Route path="/admin/academic/subjects" element={<Subjects />} />
                              <Route path="/admin/academic/syllabus" element={<Syllabus />} />
                              <Route path="/admin/academic/timetable" element={<AdminTimetable />} />
                              <Route path="/admin/exams/grades" element={<Grades />} />
                              <Route path="/admin/exams/marks" element={<Marks />} />
                              <Route path="/admin/exams/results" element={<Results />} />
                              <Route path="/admin/exams/schedule" element={<Schedule />} />
                              <Route path="/admin/exams/schedule-exam" element={<ScheduleExam />} />
                              <Route path="/admin/exams/publish" element={<PublishExam />} />
                              <Route path="/admin/fees/fee-collection" element={<FeeCollection />} />
                              <Route path="/admin/fees/pending-fees" element={<PendingFees />} />
                              <Route path="/admin/fees/receipts" element={<Receipts />} />
                              <Route path="/admin/finance/fee/bank-reconciliation" element={<BankReconciliation />} />
                              <Route path="/admin/finance/fee/fee-adjustment" element={<FeeAdjustment />} />
                              <Route path="/admin/finance/fee/fee-collection-records" element={<FeeCollectionRecords />} />
                              <Route path="/admin/finance/fee/fee-structure" element={<FeeStructure />} />
                              <Route path="/admin/finance/fee/fee-waivers" element={<FeeWaivers />} />
                              <Route path="/admin/finance/fee/payment-gateway" element={<PaymentGateway />} />
                              <Route path="/admin/finance/payroll/salary" element={<Salary />} />
                              <Route path="/admin/finance/reports/finance-reports" element={<FinanceReports />} />
                              <Route path="/admin/finance/reports/payroll-report" element={<PayrollReport />} />
                              <Route path="/admin/reports/attendance-reports" element={<AttendanceReports />} />
                              <Route path="/admin/reports/exam-report" element={<ExamReport />} />
                              <Route path="/admin/reports/student-reports" element={<StudentReports />} />
                              <Route path="/admin/settings/backup" element={<Backup />} />
                              <Route path="/admin/settings/general-settings" element={<GeneralSettings />} />
                              <Route path="/admin/settings" element={<GeneralSettings />} />
                              <Route path="/admin/Communication/message" element={<Message />} />
                              <Route path="/admin/inbox" element={<Inbox />} />
                              <Route path="/admin/settings/templates" element={<Templates />} />
                              <Route path="/admin/settings/design" element={<Design />} />
                              <Route path="/admin/settings/user-management" element={<UserManagement />} />
                              <Route path="/admin/settings/signature" element={<Signature />} />
                              <Route path="/admin/staff/staff-attendance" element={<StaffAttendance />} />
                              <Route path="/admin/staff/staff-leave" element={<StaffLeave />} />
                              <Route path="/admin/staff/staff-library" element={<StaffLibrary />} />
                              <Route path="/admin/staff/staff-list" element={<StaffList />} />
                              <Route path="/admin/staff/staff-reports" element={<StaffReports />} />
                              <Route path="/admin/staff/staff-services" element={<StaffServices />} />
                              <Route path="/admin/staff/staff-transport" element={<StaffTransport />} />
                              <Route path="/admin/students/AdmisssionManagement" element={<Manager />} />
                              <Route path="/admin/students/examinations" element={<Examinations />} />
                              <Route path="/admin/students/student-attendance" element={<AdminStudentAttendance />} />
                              <Route path="/admin/students/student-library" element={<StudentLibrary />} />
                              <Route path="/admin/students/student-list" element={<StudentList />} />
                              <Route path="/admin/students/promotion" element={<StudentPromotion />} />
                              <Route path="/admin/students/student-services" element={<StudentServices />} />
                              <Route path="/admin/students/student-transport" element={<StudentTransport />} />
                              <Route path="/admin/students/add" element={<AddStudent />} />
                              <Route path="/admin/unbick-schooling/books" element={<AdminBooks />} />
                              <Route path="/admin/unbick-schooling/predefined-syllabus" element={<AdminPredefinedSyllabus />} />
                              <Route path="/admin/school/calendar" element={<AcademicCalendar />} />
                              <Route path="/admin/exams/manage-exam" element={<ManageExam />} />
                  
                              {/* School Page Management Routes */}
                              <Route path="/admin/school/website" element={<WebsiteManager />} />
                              <Route path="/admin/website/about" element={<AboutManager />} />
                              <Route path="/admin/website/academics" element={<AcademicsManager />} />
                              <Route path="/admin/website/activities" element={<ActivitiesManager />} />
                              
                              <Route path="/admin/website/Gallery" element={<GalleryManager />} />
                              <Route path="/admin/website/homepage" element={<HomePageManager />} />
                              <Route path="/admin/website/Settings" element={<ThemeManager />} />
                              <Route path="/admin/website/Contact" element={<ContactManager />} />
                              {/* Parent Routes */}
                              <Route path="/parent/dashboard" element={<ParentDashboard />} />
                              <Route path="/parent/fees" element={<FeesDetails />} />
                              <Route path="/parent/messages" element={<ParentMessage />} />
                              <Route path="/parent/inbox" element={<ParentInbox />} />
                              <Route path="/parent/student-progress" element={<StudentProgress />} />
                              <Route path="/parent/settings/general-settings" element={<ParentGeneralSettings />} />
                              <Route path="/parent/settings/notifications" element={<ParentNotifications />} />
                              <Route path="/parent/password-management" element={<ParentPasswordManagement />} />
                              <Route path="/parent/profile" element={<ParentProfile />} />
                              <Route path="/parent/unbick-schooling/books" element={<ParentBooks />} />
                              <Route path="/parent/unbick-schooling/predefined-syllabus" element={<ParentPredefinedSyllabus />} />
                              <Route path="/parent/bus-tracking" element={<BusTracking />} /> {/* Add this line */}
                              <Route path="/parent/attendance-Report" element={<ParentAttendance />} />
                              <Route path="/parent/result" element={<ParentResults />} />
                              {/* Student Routes */}
                              <Route path="/student/dashboard" element={<StudentDashboard />} />
                              <Route path="/student/assignments" element={<Assignment />} />
                              <Route path="/student/attendance" element={<StudentAttendance />} />
                              <Route path="/student/exams" element={<StudentGrades />} />
                              <Route path="/student/classes" element={<StudentTimetable />} />
                              <Route path="/student/settings/general-settings" element={<StudentGeneralSettings />} />
                              <Route path="/student/settings/notifications" element={<StudentNotifications />} />
                              <Route path="/student/password-management" element={<StudentPasswordManagement />} />
                              <Route path="/student/profile" element={<StudentProfile />} />
                              <Route path="/student/unbick-schooling/books" element={<StudentBooks />} />
                              <Route path="/student/unbick-schooling/predefined-syllabus" element={<StudentPredefinedSyllabus />} />
                              <Route path="/student/messages" element={<StudentMessage />} />
                              <Route path="/student/inbox" element={<StudentInbox />} />
                              {/* Teacher Routes */}
                              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                              <Route path="/teacher/class-schedule" element={<ClassSchedule />} />
                              <Route path="/teacher/grading" element={<Grading />} />
                              <Route path="/teacher/reports" element={<TeacherReports />} />
                              <Route path="/teacher/self" element={<TeacherAttendanceSelf />} />
                              <Route path="/teacher/student" element={<TeacherAttendanceStudent />} />
                              <Route path="/teacher/general-settings" element={<TeacherGeneralSettings />} />
                              <Route path="/teacher/notifications" element={<TeacherNotifications />} />
                              <Route path="/teacher/password-management" element={<TeacherPasswordManagement />} />
                              <Route path="/teacher/profile" element={<TeacherProfile />} />
                              <Route path="/teacher/books" element={<TeacherBooks />} />
                              <Route path="/teacher/predefined-syllabus" element={<TeacherPredefinedSyllabus />} />
                              <Route path="/teacher/message" element={<TeacherMessage />} />
                              <Route path="/teacher/inbox" element={<TeacherInbox />} />

                              {/* Pages Routes */}
                              <Route path="/admissions" element={<Admissions />} />
                              <Route path="/about" element={<AboutSchool />} />
                              <Route path="/about/awards" element={<Awards />} />
                              <Route path="/about/infrastructure" element={<Infrastructure />} />
                              <Route path="/about/mandatory-disclosure" element={<MandatoryDisclosure />} />
                              <Route path="/about/philosophy-mission" element={<PhilosophyMission />} />
                              <Route path="/about/principal-message" element={<PrincipalMessage />} />
                              <Route path="/about/student-council" element={<StudentCouncil />} />
                              <Route path="/academics/art-integration" element={<ArtIntegration />} />
                              <Route path="/academics/curriculum" element={<Curriculum />} />
                              <Route path="/academics/faculty" element={<Faculty />} />
                              <Route path="/academics/question-papers" element={<QuestionPapers />} />
                              <Route path="/academics/scholar-badge" element={<ScholarBadge />} />
                              <Route path="/academics/Syllabus" element={<PagesSyllabus />} />
                              <Route path="/activities/assemblies" element={<Assemblies />} />
                              <Route path="/activities/clubs" element={<Clubs />} />
                              <Route path="/activities/cultural" element={<Cultural />} />
                              <Route path="/activities/inter-house" element={<InterHouse />} />
                              <Route path="/activities/sports" element={<Sports />} />
                              <Route path="/activities/workshops" element={<Workshops />} />
                              <Route path="/admissions/faqs" element={<FAQs />} />
                              <Route path="/admissions/fees" element={<Fees />} />
                              <Route path="/admissions/process" element={<Process />} />
                              <Route path="/contact/contact" element={<Contact />} />
                              <Route path="/events/events" element={<Events />} />
                              <Route path="/gallery/news" element={<News />} />
                              <Route path="/gallery/photos" element={<Photos />} />
                              <Route path="/gallery/videos" element={<Videos />} />
                            </Routes>
                          </div>
                        </div>
                      </Router>
                    </ErrorBoundary>
                  </AlertProvider>
                </TeacherProvider>
              </StudentProvider>
            </SettingsProvider>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;