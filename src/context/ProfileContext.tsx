import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { StudentProfile, CompletedCourse, GenEdChecks } from '../types';
import { emptyGenEdChecks } from '../types';
import * as storage from '../logic/storage';

interface ProfileContextValue {
  profiles: StudentProfile[];
  currentProfile: StudentProfile | null;
  switchProfile: (id: string) => void;
  createProfile: (data: Omit<StudentProfile, 'id' | 'createdAt' | 'genEdChecks'>) => string;
  updateProfile: (id: string, updates: Partial<StudentProfile>) => void;
  deleteProfile: (id: string) => void;
  addCompletedCourse: (course: CompletedCourse) => void;
  removeCompletedCourse: (code: string) => void;
  updateGenEdChecks: (checks: Partial<GenEdChecks>) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileIds, setProfileIds] = useState<string[]>(() =>
    storage.getItem<string[]>('profiles-list') ?? []
  );
  const [currentId, setCurrentId] = useState<string | null>(() =>
    storage.getItem<string>('current-profile')
  );
  const [profiles, setProfiles] = useState<StudentProfile[]>(() => {
    const ids = storage.getItem<string[]>('profiles-list') ?? [];
    return ids
      .map((id) => storage.getItem<StudentProfile>(`profile-${id}`))
      .filter((p): p is StudentProfile => p !== null);
  });

  const currentProfile = profiles.find((p) => p.id === currentId) ?? null;

  const persistProfiles = useCallback((updated: StudentProfile[], ids: string[]) => {
    setProfiles(updated);
    setProfileIds(ids);
    storage.setItem('profiles-list', ids);
    for (const p of updated) {
      storage.setItem(`profile-${p.id}`, p);
    }
  }, []);

  const switchProfile = useCallback((id: string) => {
    setCurrentId(id);
    storage.setItem('current-profile', id);
  }, []);

  const createProfile = useCallback(
    (data: Omit<StudentProfile, 'id' | 'createdAt' | 'genEdChecks'>): string => {
      const id = data.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString(36);
      const profile: StudentProfile = {
        ...data,
        id,
        createdAt: new Date().toISOString().split('T')[0],
        genEdChecks: emptyGenEdChecks,
      };
      const newIds = [...profileIds, id];
      const newProfiles = [...profiles, profile];
      persistProfiles(newProfiles, newIds);
      switchProfile(id);
      return id;
    },
    [profileIds, profiles, persistProfiles, switchProfile]
  );

  const updateProfile = useCallback(
    (id: string, updates: Partial<StudentProfile>) => {
      const updated = profiles.map((p) => (p.id === id ? { ...p, ...updates } : p));
      persistProfiles(updated, profileIds);
    },
    [profiles, profileIds, persistProfiles]
  );

  const deleteProfile = useCallback(
    (id: string) => {
      const newIds = profileIds.filter((pid) => pid !== id);
      const newProfiles = profiles.filter((p) => p.id !== id);
      storage.removeItem(`profile-${id}`);
      persistProfiles(newProfiles, newIds);
      if (currentId === id) {
        const nextId = newIds[0] ?? null;
        setCurrentId(nextId);
        storage.setItem('current-profile', nextId);
      }
    },
    [profileIds, profiles, currentId, persistProfiles]
  );

  const addCompletedCourse = useCallback(
    (course: CompletedCourse) => {
      if (!currentProfile) return;
      if (currentProfile.completedCourses.some((c) => c.code === course.code)) return;
      updateProfile(currentProfile.id, {
        completedCourses: [...currentProfile.completedCourses, course],
      });
    },
    [currentProfile, updateProfile]
  );

  const removeCompletedCourse = useCallback(
    (code: string) => {
      if (!currentProfile) return;
      updateProfile(currentProfile.id, {
        completedCourses: currentProfile.completedCourses.filter((c) => c.code !== code),
      });
    },
    [currentProfile, updateProfile]
  );

  const updateGenEdChecks = useCallback(
    (checks: Partial<GenEdChecks>) => {
      if (!currentProfile) return;
      updateProfile(currentProfile.id, {
        genEdChecks: { ...currentProfile.genEdChecks, ...checks },
      });
    },
    [currentProfile, updateProfile]
  );

  // Sync currentId on first load
  useEffect(() => {
    if (!currentId && profileIds.length > 0) {
      switchProfile(profileIds[0]);
    }
  }, [currentId, profileIds, switchProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfile,
        switchProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        addCompletedCourse,
        removeCompletedCourse,
        updateGenEdChecks,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
