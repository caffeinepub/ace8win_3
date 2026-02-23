import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import RegistrationModal from './components/RegistrationModal';
import UserDashboard from './pages/UserDashboard';
import PaymentPage from './pages/PaymentPage';
import TransactionHistory from './pages/TransactionHistory';
import AdminMatchCreate from './pages/AdminMatchCreate';
import AdminPayments from './pages/AdminPayments';
import AdminMatchParticipants from './pages/AdminMatchParticipants';
import AdminUserManagement from './pages/AdminUserManagement';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function RootLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showRegistration = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <Layout>
      {showRegistration && <RegistrationModal />}
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: UserDashboard,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment/$matchId',
  component: PaymentPage,
});

const transactionHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: TransactionHistory,
});

const adminMatchCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/matches/create',
  component: AdminMatchCreate,
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/payments',
  component: AdminPayments,
});

const adminMatchParticipantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/matches/$matchId/participants',
  component: AdminMatchParticipants,
});

const adminUserManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: AdminUserManagement,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  paymentRoute,
  transactionHistoryRoute,
  adminMatchCreateRoute,
  adminPaymentsRoute,
  adminMatchParticipantsRoute,
  adminUserManagementRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
