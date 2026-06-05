import { motion, AnimatePresence } from 'framer-motion';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Settings } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MobileWarning } from '@/components/MobileWarning';

const navItems = [
  {
    path: '/',
    label: 'Home'
  },
  {
    path: '/explore',
    label: 'College Explorer'
  },
  {
    path: '/compare',
    label: 'Compare'
  },
  {
    path: '/about',
    label: 'About UCHIT'
  },
  {
    path: '/history',
    label: 'Sorting History'
  }
];

export const RootLayout = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <MobileWarning />
      <motion.header
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-relaxed py-0.5"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Link to="/" className="leading-relaxed inline-block">U.C.H.I.T. (उचित)</Link>
            </motion.div>

            <nav className="flex items-center gap-6">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    path === location.pathname
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, duration: 0.2 }}
                    style={{ display: 'inline-block', width: '100%' }}
                  >
                    {label}
                  </motion.span>
                </Link>
              ))}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </nav>
          </div>
        </div>
      </motion.header>

      <main className="flex-1">
        <Outlet />
      </main>

      <motion.footer
        className="border-t py-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between items-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              © 2024 UCHIT (उचित). All rights reserved.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </Link>
              <a
                href="mailto:sammingasainathrao@gmail.com"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                sammingasainathrao@gmail.com
              </a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}; 