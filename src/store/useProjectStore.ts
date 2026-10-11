import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Project, Room, SelectedRoomItem, UserProfile } from '../types';

interface ProjectState {
  currentProject: Project | null;
  projectsList: Project[];
  userProfile: UserProfile | null;
  isLoading: boolean;

  // Project Actions
  initNewProject: (projectName: string, clientName?: string, projectAddress?: string) => Project;
  setCurrentProject: (project: Project | null) => void;
  updateProjectInfo: (data: Partial<Pick<Project, 'projectName' | 'clientName' | 'projectAddress'>>) => void;
  setProjectStatus: (status: 'draft' | 'submitted' | 'under_review' | 'quoted') => void;
  
  // Room Actions
  addOrUpdateRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  setRoomSelection: (roomId: string, selection: SelectedRoomItem) => void;
  
  // User Profile
  setUserProfile: (profile: UserProfile | null) => void;
  
  // Reset
  clearCurrentProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      projectsList: [],
      userProfile: null,
      isLoading: false,

      initNewProject: (projectName: string, clientName?: string, projectAddress?: string) => {
        const newProject: Project = {
          id: `proj-${Date.now()}`,
          projectName: projectName || 'My Lighting Project',
          clientName: clientName || '',
          projectAddress: projectAddress || '',
          status: 'draft',
          rooms: [],
          totalFixturesCount: 0,
          totalPowerWatts: 0,
          totalEstimatedCost: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          currentProject: newProject,
          projectsList: [newProject, ...state.projectsList.filter((p) => p.id !== newProject.id)],
        }));

        return newProject;
      },

      setCurrentProject: (project) => set({ currentProject: project }),

      updateProjectInfo: (data) => {
        const { currentProject, projectsList } = get();
        if (!currentProject) return;

        const updated: Project = {
          ...currentProject,
          ...data,
          updatedAt: new Date().toISOString(),
        };

        set({
          currentProject: updated,
          projectsList: projectsList.map((p) => (p.id === updated.id ? updated : p)),
        });
      },

      setProjectStatus: (status) => {
        const { currentProject, projectsList } = get();
        if (!currentProject) return;

        const updated: Project = {
          ...currentProject,
          status,
          updatedAt: new Date().toISOString(),
        };

        set({
          currentProject: updated,
          projectsList: projectsList.map((p) => (p.id === updated.id ? updated : p)),
        });
      },

      addOrUpdateRoom: (room) => {
        const { currentProject, projectsList } = get();
        if (!currentProject) return;

        const existingRoomIndex = currentProject.rooms.findIndex((r) => r.id === room.id);
        let updatedRooms = [...currentProject.rooms];

        if (existingRoomIndex >= 0) {
          updatedRooms[existingRoomIndex] = room;
        } else {
          updatedRooms.push(room);
        }

        // Recalculate totals
        let totalFixtures = 0;
        let totalWatts = 0;
        let totalCost = 0;

        updatedRooms.forEach((r) => {
          if (r.selectedItem) {
            totalFixtures += r.selectedItem.quantity;
            totalWatts += r.selectedItem.quantity * r.selectedItem.product.powerWatts;
            totalCost += r.selectedItem.subtotal;
          }
        });

        const updatedProject: Project = {
          ...currentProject,
          rooms: updatedRooms,
          totalFixturesCount: totalFixtures,
          totalPowerWatts: totalWatts,
          totalEstimatedCost: Math.round(totalCost * 100) / 100,
          updatedAt: new Date().toISOString(),
        };

        set({
          currentProject: updatedProject,
          projectsList: projectsList.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
        });
      },

      removeRoom: (roomId) => {
        const { currentProject, projectsList } = get();
        if (!currentProject) return;

        const updatedRooms = currentProject.rooms.filter((r) => r.id !== roomId);

        let totalFixtures = 0;
        let totalWatts = 0;
        let totalCost = 0;

        updatedRooms.forEach((r) => {
          if (r.selectedItem) {
            totalFixtures += r.selectedItem.quantity;
            totalWatts += r.selectedItem.quantity * r.selectedItem.product.powerWatts;
            totalCost += r.selectedItem.subtotal;
          }
        });

        const updatedProject: Project = {
          ...currentProject,
          rooms: updatedRooms,
          totalFixturesCount: totalFixtures,
          totalPowerWatts: totalWatts,
          totalEstimatedCost: Math.round(totalCost * 100) / 100,
          updatedAt: new Date().toISOString(),
        };

        set({
          currentProject: updatedProject,
          projectsList: projectsList.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
        });
      },

      setRoomSelection: (roomId, selection) => {
        const { currentProject, addOrUpdateRoom } = get();
        if (!currentProject) return;

        const room = currentProject.rooms.find((r) => r.id === roomId);
        if (room) {
          addOrUpdateRoom({
            ...room,
            selectedItem: selection,
          });
        }
      },

      setUserProfile: (profile) => set({ userProfile: profile }),

      clearCurrentProject: () => set({ currentProject: null }),
    }),
    {
      name: 'qls-project-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
