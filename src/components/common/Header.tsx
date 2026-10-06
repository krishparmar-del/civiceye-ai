import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  MapPin,
  Moon,
  RefreshCw,
  Sun,
  User,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentTab,
    setCurrentTab,
    theme,
    toggleTheme,
    logout,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    allOfficials,
    switchOfficialAccount,
    resetAllData,
  } = useCivic();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!currentUser) return null;

  const isCitizen = currentUser.role === 'citizen';

  // Filter notifications for current user/role
  const userNotifs = notifications.filter((n) => {
    if (isCitizen) {
      return n.recipientRole === 'citizen' && (!n.recipientId || n.recipientId === currentUser.id);
    } else {
      return n.recipientRole === 'official' && (!n.recipientId || n.recipientId === currentUser.id);
    }
  });

  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const citizenNav = [
    { id: 'home', label: 'Home' },
    { id: 'area-feed', label: 'Problems in My Area' },
    { id: 'citizen-map', label: 'Area Map' },
    { id: 'my-reports', label: 'My Reports' },
    { id: 'profile', label: 'Profile' },
  ];

  const officialNav = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'queue', label: 'Priority Queue' },
    { id: 'all-problems', label: 'All Problems' },
    { id: 'official-map', label: 'Jurisdiction Map' },
    { id: 'health', label: 'Infrastructure Health' },
    { id: 'contractors', label: 'Contractors' },
  ];

  const navLinks = isCitizen ? citizenNav : officialNav;

  return (
    <header className="sticky top-0 z-40 bg-card-theme border-b border-theme theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab(isCitizen ? 'home' : 'dashboard')}
              className="text-left font-bold text-lg tracking-tight text-theme-primary hover:text-olive-primary transition-colors flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-olive-primary inline-block"></span>
              <span>CivicEye AI</span>
            </button>
            <span className="hidden sm:inline-block text-xs text-theme-muted font-mono truncate max-w-xs">
              {currentUser.city} · {currentUser.block}
            </span>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentTab(link.id)}
                  className={`text-sm font-medium transition-colors whitespace-nowrap relative py-1 ${
                    isActive
                      ? 'text-olive-primary font-semibold border-b-2 border-olive-primary'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Theme Toggle, Notifications, Role Switcher, Profile) */}
          <div className="flex items-center gap-3">
            {/* Elegant Light / Dark Mode Toggle (Requirement 6) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle light/dark theme"
              className="p-2 rounded-lg border border-theme text-theme-secondary hover:text-theme-primary hover:bg-surface theme-transition"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-theme-secondary" />
              ) : (
                <Sun className="w-4 h-4 text-amber-300" />
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                aria-label="Open notifications"
                className="relative p-2 text-theme-secondary hover:text-theme-primary rounded-lg border border-theme hover:bg-surface theme-transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-olive-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card-theme border border-theme rounded-xl shadow-lg py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-theme flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-theme-primary uppercase tracking-wider">Notifications</h4>
                      <p className="text-[11px] text-theme-muted">
                        {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-olive-primary hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-theme">
                    {userNotifs.length === 0 ? (
                      <div className="p-6 text-center text-xs text-theme-muted">
                        <p className="font-semibold text-theme-secondary">You're all caught up</p>
                        <p className="text-[11px] mt-0.5">No notifications currently.</p>
                      </div>
                    ) : (
                      userNotifs.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.problemId) {
                              setCurrentTab(isCitizen ? 'area-feed' : 'all-problems');
                            }
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 text-left cursor-pointer transition-colors hover:bg-surface ${
                            !notif.read ? 'bg-olive-soft/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-theme-primary">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-theme-muted font-mono">
                              {new Date(notif.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-theme-secondary mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-theme hover:bg-surface theme-transition text-left"
              >
                <div className="w-7 h-7 rounded-full bg-olive-primary text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-xs">
                  <div className="font-semibold text-theme-primary truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-theme-muted text-[11px] truncate max-w-[110px]">
                    {isCitizen ? 'Citizen' : currentUser.department}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-theme-muted" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-card-theme border border-theme rounded-xl shadow-lg py-1 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-theme">
                    <p className="text-xs font-bold text-theme-primary">{currentUser.name}</p>
                    <p className="text-[11px] text-theme-muted font-mono">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-theme-secondary">
                      <MapPin className="w-3 h-3 text-olive-primary" />
                      <span>{currentUser.block}, {currentUser.city}</span>
                    </div>
                    {currentUser.officialId && (
                      <div className="mt-1 text-[11px] text-olive-dark font-mono font-semibold">
                        ID: {currentUser.officialId} ({currentUser.department})
                      </div>
                    )}
                  </div>

                  {/* Switch Official Jurisdiction / Account (Requirement 20) */}
                  {!isCitizen && (
                    <div className="px-4 py-2 border-b border-theme">
                      <p className="text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-1.5">
                        Switch Official Jurisdiction
                      </p>
                      <div className="space-y-1">
                        {allOfficials.map((off) => (
                          <button
                            key={off.id}
                            onClick={() => {
                              switchOfficialAccount(off.id);
                              setShowProfileMenu(false);
                            }}
                            className={`w-full text-left text-xs py-1 px-1.5 rounded flex items-center justify-between ${
                              off.id === currentUser.id
                                ? 'bg-olive-soft/40 font-semibold text-olive-dark'
                                : 'text-theme-secondary hover:bg-surface'
                            }`}
                          >
                            <span className="truncate">
                              {off.name} ({off.block})
                            </span>
                            {off.id === currentUser.id && <Check className="w-3 h-3 text-olive-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="py-1">
                    <button
                      onClick={() => {
                        resetAllData();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-theme-secondary hover:bg-surface flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-theme-muted" />
                      Reset to 0 Problems (Clean Baseline)
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-surface flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex overflow-x-auto py-2 border-t border-theme gap-4 text-xs font-medium text-theme-secondary scrollbar-none">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setCurrentTab(link.id)}
              className={`whitespace-nowrap px-1 py-1 ${
                currentTab === link.id ? 'text-olive-primary font-bold border-b-2 border-olive-primary' : ''
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
