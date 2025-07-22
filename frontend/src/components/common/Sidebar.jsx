import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserCog,
  GraduationCap,
  Calculator,
  CreditCard,
  BarChart2,
  School,
  Mail,
  Settings,
  Globe,
  Building2,
  FileSpreadsheet,
  MessageCircle,
  UsersRound,
  Bus,
  Calendar,
  CircleUserRound,
  Bell,
  FileText,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  LogIn,
  Home,
  Phone
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [expandedGroup, setExpandedGroup] = useState('');
    const { isAuthenticated, userRole } = useAuth();
    const location = useLocation();
    const { settings } = useSettings();

    // Add useEffect hooks at the top level
    useEffect(() => {
        if (settings?.appearance?.logo) {
            console.log('Settings updated in Sidebar:', settings);
        }
    }, [settings]);

    // Reset expanded group when location changes
    useEffect(() => {
        setExpandedGroup('');
    }, [location.pathname]);

    // Clean up any duplicate sidebars on unmount
    useEffect(() => {
        return () => {
            const existingSidebars = document.querySelectorAll('.sidebar');
            if (existingSidebars.length > 1) {
                existingSidebars.forEach((sidebar, index) => {
                    if (index > 0) sidebar.remove();
                });
            }
        };
    }, []);

    // Reset to collapsed state when route changes
    useEffect(() => {
        setIsCollapsed(true);
    }, [location.pathname]);

    // Loading state handling - moved after hooks
    if (!settings) {
        return <div>Loading...</div>; // Or your loading component
    }

    // Homepage check - moved after hooks
    if (location.pathname === '/'|| location.pathname =='/login') {
        return null;
    }

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleGroup = (group) => {
        console.log("Toggling group:", group); // Debugging toggle
        setExpandedGroup(expandedGroup === group ? '' : group);
    };

    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        const cleanPath = logoPath.replace(/^https?:\/\/[^/]+/, '').replace(/^\/+/, '');
        return `${process.env.REACT_APP_API_URL}/${cleanPath}`;
    };

    const renderSidebarHeader = () => (
        <div className="sidebar-header">
            {settings?.appearance?.logo ? (
                <img 
                    src={getLogoUrl(settings.appearance.logo)} 
                    alt={settings?.general?.schoolName || 'School Logo'} 
                    style={{ 
                        maxWidth: isCollapsed ? '40px' : '80%',
                        height: 'auto',
                        maxHeight: '60px',
                        objectFit: 'contain',
                        margin: '10px auto',
                        display: 'block'
                    }}
                    onError={(e) => {
                        console.error('Logo load error:', e);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                            <h2 style="color: ${settings?.appearance?.themeColor || '#1976d2'}">
                                ${settings?.general?.schoolName || 'School Name'}
                            </h2>
                        `;
                    }}
                />
            ) : (
                <h2 style={{ 
                    color: settings?.appearance?.themeColor || '#1976d2',
                    fontSize: isCollapsed ? '1rem' : '1.5rem',
                    textAlign: 'center',
                    margin: '10px 0',
                    padding: '0 5px',
                    whiteSpace: isCollapsed ? 'nowrap' : 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {settings?.general?.schoolName || 'School Name'}
                </h2>
            )}
        </div>
    );

    const getIcon = (iconName, size = 20) => {
        const icons = {
            'dashboard': <LayoutDashboard size={size} />,
            'academic': <BookOpen size={size} />,
            'students': <Users size={size} />,
            'staff': <UserCog size={size} />,
            'exams': <GraduationCap size={size} />,
            'finance': <Calculator size={size} />,
            'payroll': <CreditCard size={size} />,
            'reports': <BarChart2 size={size} />,
            'unbick': <School size={size} />,
            'communication': <Mail size={size} />,
            'settings': <Settings size={size} />,
            'website': <Globe size={size} />,
            'classes': <Building2 size={size} />,
            'attendance': <FileSpreadsheet size={size} />,
            'messages': <MessageCircle size={size} />,
            'children': <UsersRound size={size} />,
            'bus': <Bus size={size} />,
            'schedule': <Calendar size={size} />,
            'profile': <CircleUserRound size={size} />,
            'notifications': <Bell size={size} />,
            'documents': <FileText size={size} />
        };
        return icons[iconName.toLowerCase()] || <CircleUserRound size={size} />;
    };

    const handleIconClick = (group) => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setExpandedGroup(group);
        } else {
            setExpandedGroup(expandedGroup === group ? '' : group);
        }
    };

    const navigationItems = {
        admin: [
            {
                group: 'Dashboard',
                icon: 'dashboard',
                items: [{ path: '/admin/dashboard', label: 'Dashboard' }]
            },
            {
                group: 'Academic',
                icon: 'academic',
                items: [
                    { path: '/admin/academic/classes', label: 'Classes' },
                    { path: '/admin/academic/sections', label: 'Sections' },
                    { path: '/admin/academic/subjects', label: 'Subjects' },
                    { path: '/admin/academic/syllabus', label: 'Syllabus' },
                    { path: '/admin/academic/timetable', label: 'Timetable' }
                ]
            },
            {
                group: 'Students',
                icon: 'students',
                items: [
                    { path: '/admin/students/AdmisssionManagement', label: 'Manager' },
                    { path: '/admin/students/student-list', label: 'Student List' },
                    { path: '/admin/students/student-attendance', label: 'Attendance' },
                    { path: '/admin/students/student-library', label: 'Library' },
                    { path: '/admin/students/student-services', label: 'Services' },
                    { path: '/admin/students/student-transport', label: 'Transport' }
                ]
            },
            {
                group: 'Staff',
                icon: 'staff',
                items: [
                    { path: '/admin/staff/staff-list', label: 'Staff List' },
                    { path: '/admin/staff/staff-attendance', label: 'Attendance' },
                    { path: '/admin/staff/staff-leave', label: 'Leave Management' },
                    { path: '/admin/staff/staff-reports', label: 'Reports' },
                    { path: '/admin/staff/staff-services', label: 'Services' },
                    { path: '/admin/staff/staff-transport', label: 'Transport' }
                ]
            },
            {
                group: 'Exams',
                icon: 'exams',
                items: [
                    { path: '/admin/exams/schedule', label: 'Exam Schedule' },
                    { path: '/admin/exams/grades', label: 'Grades' },
                    { path: '/admin/exams/marks', label: 'Marks Entry' },
                    { path: '/admin/exams/results', label: 'Results' }
                ]
            },
            {
                group: 'Finance',
                icon: 'finance',
                items: [
                    { path: '/admin/fees/fee-collection', label: 'Fee Collection' },
                    { path: '/admin/fees/pending-fees', label: 'Pending Fees' },
                    { path: '/admin/fees/receipts', label: 'Receipts' },
                    { path: '/admin/finance/fee/bank-reconciliation', label: 'Bank Reconciliation' },
                    { path: '/admin/finance/fee/fee-collection-records', label: 'Collection Records' },
                    { path: '/admin/finance/fee/fee-structure', label: 'Fee Structure' },
                    { path: '/admin/finance/fee/fee-waivers', label: 'Fee Waivers' },
                    { path: '/admin/finance/fee/payment-gateway', label: 'Payment Gateway' }
                ]
            },
            {
                group: 'Payroll',
                icon: 'payroll',
                items: [
                    { path: '/admin/finance/payroll/salary', label: 'Salary Management' }
                ]
            },
            {
                group: 'Reports',
                icon: 'reports',
                items: [
                    { path: '/admin/reports/attendance-reports', label: 'Attendance Reports' },
                    { path: '/admin/reports/exam-report', label: 'Exam Reports' },
                    { path: '/admin/reports/student-reports', label: 'Student Reports' },
                    { path: '/admin/finance/reports/finance-reports', label: 'Finance Reports' },
                    { path: '/admin/finance/reports/payroll-report', label: 'Payroll Reports' }
                ]
          },
          
            {
                group: 'Communication',
                icon: 'communication',
                items: [
                   { path: '/admin/communication/message', label: 'Message' },
                    { path: '/admin/settings/inbox', label: 'Inbox' }
                ]
            },
            {
                group: 'Settings',
                icon: 'settings',
                items: [
                    { path: '/admin/settings/general-settings', label: 'General Settings' },
                    { path: '/admin/settings/user-management', label: 'User Management' },
                    { path: '/admin/settings/templates', label: 'Templates' },
                    { path: '/admin/settings/backup', label: 'Backup' },
                    { path: '/admin/settings/signature', label: 'Signature' }
                ]
            },

        ],
        student: [
            {
                group: 'Dashboard',
                icon: 'dashboard',
                items: [{ path: '/student/dashboard', label: 'Dashboard' }]
            },
            {
                group: 'My Classes',
                icon: 'classes',
                items: [
                    { path: '/student/classes', label: 'Classes' },
                    { path: '/student/assignments', label: 'Assignments' },
                ]
            },
            {
                group: 'Messages',
                icon: 'messages',
                items: [
                    { path: '/student/messages', label: 'Message' },
                    { path: '/student/inbox', label: 'Inbox' },
                ]
            },
            {
                group: 'Reports',
                icon: 'reports',
                items: [
                    { path: '/student/attendance', label: 'My Attendance' },
                    { path: '/student/exams', label: 'My Exam Results' },
                ]
            },
            {
                group: 'Settings',
                icon: 'settings',
                items: [
                    {path: '/student/profile', label: 'Profile'},
                    {path: '/student/password-management', label: 'Password Management'}
                ]
            },
        ],
        parent: [
            {
                group: 'Dashboard',
                icon: 'dashboard',
                items: [{ path: '/parent/dashboard', label: 'Dashboard' }]
            }, 
            {
                group: 'Children',
                icon: 'children',
                items: [
                    { path: '/parent/student-progress', label: 'Child Progress' },
                    { path: '/parent/bus-tracking', label: 'Bus Tracking' }, // Add this line
                ]
            },
            {
                group: 'Fees',
                icon: 'finance',
                items: [
                    {path : '/parent/fees', label: 'Fees'},
                ]
            },
            {
                group: 'Communication',
                icon: 'communication',
                items: [
                    { path: '/parent/messages', label: 'Message' },
                    { path: '/parent/inbox', label: 'Inbox' },
                ]
            },
            {
                group: 'Reports',
                icon: 'reports',
                items: [
                    { path: '/parent/attendance-Report', label: 'Attendance Reports' },
                    { path: '/parent/result', label: 'Exam Reports' },
                ]
            },
            {
                group: 'Settings',
                icon: 'settings',
                items: [
                    {path : '/parent/profile', label: 'Profile'},
                    {path : '/parent/password-management', label: 'Password Management'}
                ]
            },
        ],
        teacher: [
            {
                group: 'Dashboard',
                icon: 'dashboard',
                items: [{ path: '/teacher/dashboard', label: 'Dashboard' }]
            },
            {
                group: 'Classes',
                icon: 'classes',
                items: [
                    { path: '/teacher/class-schedule', label: 'My Classes' },
                    { path: '/teacher/student', label: 'Take Attendance' },
                    { path: '/teacher/grading', label: 'Manage Grades' },
                ]
            },
            {
                group: 'Communication',
                icon: 'communication',
                items: [
                    { path: '/teacher/message', label: 'Message' },
                    { path: '/teacher/inbox', label: 'Inbox' },
                    { path: '/teacher/notifications', label: 'Notifications' }
                ]
            },
            {
                group: 'Reports',
                icon: 'reports',
                items: [
                    { path: '/teacher/reports', label: 'Reports' },
                ]
            },
            {
                group: 'Self Service',
                icon: 'messages',
                items: [
                    { path: '/teacher/self', label: 'Attendance' },
               ]
            },
            {
                group: 'Settings',
                icon: 'settings',
                items: [
                    { path: '/teacher/general-settings', label: 'General Settings' },
                    { path: '/teacher/password-management', label: 'Password Manager' },
                    { path: '/teacher/profile', label: 'Profile' }
                ]
            }
        ]
    };

    const publicNavItems = [
        {
            group: 'School Name', // Changed from 'Navigation'
            items: [
                { path: '/', label: 'Home', icon: <Home size={20} /> },
                { path: '/contact', label: 'Contact', icon: <Phone size={20} /> }
            ]
        }
    ];

    const renderNavItems = (items) => (
        items.map((group) => (
            <div key={group.group} className="nav-group">
                <div
                    className={`group-header ${expandedGroup === group.group ? 'active' : ''}`}
                    onClick={() => handleIconClick(group.group)}
                    data-group={group.group}
                >
                    <span className="group-icon">
                        {getIcon(group.icon)}
                    </span>
                    {!isCollapsed && (
                        <span className="group-label">{group.group}</span>
                    )}
                </div>
                {!isCollapsed && expandedGroup === group.group && (
                    <ul className="group-items">
                        {group.items.map((item) => (
                            <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                                <Link to={item.path}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        ))
    );

    const renderPublicNav = () => (
        <div className="nav-group">
            {/* Add toggle button for public nav */}
            <div className="sidebar-toggle" onClick={toggleSidebar}>
                <Menu size={24} className="toggle-icon" />
            </div>
            {publicNavItems.map((group) => (
                <div key={group.group}>
                    <div className="group-header">
                        <span className="group-label">{group.group}</span>
                    </div>
                    {group.items.map((item) => (
                        <div
                            key={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <Link to={item.path} className="nav-link">
                                <span className="item-icon">{item.icon}</span>
                                {!isCollapsed && (
                                    <span className="item-label">{item.label}</span>
                                )}
                            </Link>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            {renderSidebarHeader()}
            <nav className="sidebar-nav">
                {isAuthenticated && userRole ? (
                    <>
                        <div className="sidebar-toggle" onClick={toggleSidebar}>
                            <Menu size={24} className="toggle-icon" />
                        </div>
                        {renderNavItems(navigationItems[userRole])}
                    </>
                ) : (
                    renderPublicNav()
                )}
            </nav>
        </div>
    );
};

export default React.memo(Sidebar); // Add memoization to prevent unnecessary re-renders