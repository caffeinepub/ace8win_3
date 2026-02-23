import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Menu, X, Trophy, History, Users, CreditCard, UserCog, Plus } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/assets/generated/hero-bg.dim_1920x1080.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/assets/generated/logo.dim_256x256.png" alt="ACE8WIN" className="h-10 w-10" />
              <span className="text-2xl font-black tracking-tight text-neon-cyan">ACE8WIN</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-6 md:flex">
              {isAuthenticated && (
                <>
                  <Link
                    to="/"
                    className="flex items-center gap-2 text-sm font-bold text-foreground/80 transition-colors hover:text-neon-cyan"
                  >
                    <Trophy className="h-4 w-4" />
                    Matches
                  </Link>
                  <Link
                    to="/transactions"
                    className="flex items-center gap-2 text-sm font-bold text-foreground/80 transition-colors hover:text-neon-cyan"
                  >
                    <History className="h-4 w-4" />
                    History
                  </Link>
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/matches/create"
                        className="flex items-center gap-2 text-sm font-bold text-neon-purple transition-colors hover:text-neon-purple/80"
                      >
                        <Plus className="h-4 w-4" />
                        Create Match
                      </Link>
                      <Link
                        to="/admin/payments"
                        className="flex items-center gap-2 text-sm font-bold text-neon-purple transition-colors hover:text-neon-purple/80"
                      >
                        <CreditCard className="h-4 w-4" />
                        Payments
                      </Link>
                      <Link
                        to="/admin/users"
                        className="flex items-center gap-2 text-sm font-bold text-neon-purple transition-colors hover:text-neon-purple/80"
                      >
                        <UserCog className="h-4 w-4" />
                        Users
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleAuth}
                disabled={disabled}
                variant={isAuthenticated ? 'outline' : 'default'}
                className="hidden md:flex"
              >
                {disabled ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-foreground"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="border-t border-border/50 py-4 md:hidden">
              <nav className="flex flex-col gap-4">
                {isAuthenticated && (
                  <>
                    <Link
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-bold text-foreground/80"
                    >
                      <Trophy className="h-4 w-4" />
                      Matches
                    </Link>
                    <Link
                      to="/transactions"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-bold text-foreground/80"
                    >
                      <History className="h-4 w-4" />
                      History
                    </Link>
                    {isAdmin && (
                      <>
                        <Link
                          to="/admin/matches/create"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 text-sm font-bold text-neon-purple"
                        >
                          <Plus className="h-4 w-4" />
                          Create Match
                        </Link>
                        <Link
                          to="/admin/payments"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 text-sm font-bold text-neon-purple"
                        >
                          <CreditCard className="h-4 w-4" />
                          Payments
                        </Link>
                        <Link
                          to="/admin/users"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 text-sm font-bold text-neon-purple"
                        >
                          <UserCog className="h-4 w-4" />
                          Users
                        </Link>
                      </>
                    )}
                  </>
                )}
                <Button onClick={handleAuth} disabled={disabled} variant={isAuthenticated ? 'outline' : 'default'}>
                  {disabled ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-background/80 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} ACE8WIN. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'ace8win'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-cyan hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
