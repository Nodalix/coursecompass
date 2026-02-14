import { Outlet, NavLink, useLocation } from 'react-router-dom';
import ProfileSelector from './ProfileSelector';
import { useProfile } from '../context/ProfileContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/gen-ed', label: 'Gen Ed', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
];

export default function Layout() {
  const { currentProfile } = useProfile();
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding';

  if (isOnboarding) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-navy-lighter bg-navy-light/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal text-navy font-bold text-sm">
            CC
          </div>
          <h1 className="text-lg font-bold text-white">
            Course<span className="text-teal">Compass</span>
          </h1>
        </div>
        <ProfileSelector />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6">
        {currentProfile ? (
          <Outlet />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-light text-3xl">
              🎓
            </div>
            <h2 className="text-xl font-semibold text-white">Welcome to CourseCompass</h2>
            <p className="text-gray-400">Add a student profile to get started</p>
          </div>
        )}
      </main>

      {/* Bottom Tab Bar */}
      {currentProfile && (
        <nav className="fixed bottom-0 left-0 right-0 flex border-t border-navy-lighter bg-navy/95 backdrop-blur-sm">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                  isActive ? 'text-teal' : 'text-gray-500 hover:text-gray-300'
                }`
              }
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
