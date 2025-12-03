
import { Route, Switch } from 'wouter';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Timetable from './pages/Timetable';
import Admissions from './pages/Admissions';
import Documents from './pages/Documents';
import Homework from './pages/Homework';
import Results from './pages/Results';
import Payroll from './pages/Payroll';
import Calendar from './pages/Calendar';
import Users from './pages/Users';
import NotFound from './pages/NotFound';

export default function Router() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/students" component={Students} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/fees" component={Fees} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route path="/timetable" component={Timetable} />
      <Route path="/admissions" component={Admissions} />
      <Route path="/documents" component={Documents} />
      <Route path="/homework" component={Homework} />
      <Route path="/results" component={Results} />
      <Route path="/payroll" component={Payroll} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/users" component={Users} />
      <Route component={NotFound} />
    </Switch>
  );
}
