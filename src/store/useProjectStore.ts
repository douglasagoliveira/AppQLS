import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { computeTotals } from '../lib/projectMath';
import { Project, ProjectStatus, RfqRecord, Room, SelectedRoomItem, UserProfile } from '../types';

interface ProjectState {
  currentProject: Project | null;
  projectsList: Project[];
  userProfile: UserProfile | null;
  rfqHistory: RfqRecord[];
  isLoading: boolean;

  // Project Actions
  initNewProject: (projectName: string, clientName?: string, projectAddress?: string) => Project;
  /** Garante um projeto ativo (guest-first, ADR-008). Cria um rascunho se não houver. */
  ensureCurrentProject: (defaultName?: string) => Project;
  setCurrentProject: (project: Project | null) => void;
  updateProjectInfo: (data: Partial<Pick<Project, 'projectName' | 'clientName' | 'projectAddress'>>) => void;
  setProjectStatus: (status: ProjectStatus) => void;
  setProjectStatusById: (projectId: string, status: ProjectStatus, rfqCode?: string) => void;
  duplicateProject: (projectId: string) => Project | null;
  removeProject: (projectId: string) => void;

  // Room Actions
  addOrUpdateRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  setRoomSelection: (roomId: string, selection: SelectedRoomItem) => void;

  // Itens avulsos (vindos do catálogo)
  addAdditionalItem: (item: SelectedRoomItem) => void;
  removeAdditionalItem: (itemId: string) => void;

  // RFQ
  recordRfq: (record: RfqRecord) => void;
  markRfqSent: (code: string) => void;

  // User Profile
  setUserProfile: (profile: UserProfile | null) => void;

  // Reset
  clearCurrentProject: () => void;
}

/** Recalcula totais a partir da fonte única (projectMath). */
function withTotals(p: Project): Project {
  const t = computeTotals(p.rooms, p.additionalItems ?? []);
  return {
    ...p,
    totalFixturesCount: t.pieces,
    totalPowerWatts: t.watts,
    totalEstimatedCost: t.cost,
    updatedAt: new Date().toISOString(),
  };
}

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => {
      /** Aplica uma versão atualizada do projeto à lista e (se for o ativo) ao currentProject. */
      const commit = (updated: Project) =>
        set((state) => ({
          currentProject: state.currentProject?.id === updated.id ? updated : state.currentProject,
          projectsList: state.projectsList.map((p) => (p.id === updated.id ? updated : p)),
        }));

      return {
        currentProject: null,
        projectsList: [],
        userProfile: null,
        rfqHistory: [],
        isLoading: false,

        initNewProject: (projectName, clientName, projectAddress) => {
          const now = new Date().toISOString();
          const newProject: Project = {
            id: uid('proj'),
            projectName: projectName || 'My Lighting Project',
            clientName: clientName || '',
            projectAddress: projectAddress || '',
            status: 'draft',
            rooms: [],
            additionalItems: [],
            totalFixturesCount: 0,
            totalPowerWatts: 0,
            totalEstimatedCost: 0,
            createdAt: now,
            updatedAt: now,
          };

          set((state) => ({
            currentProject: newProject,
            projectsList: [newProject, ...state.projectsList.filter((p) => p.id !== newProject.id)],
          }));

          return newProject;
        },

        ensureCurrentProject: (defaultName = 'My Lighting Project') => {
          const { currentProject, projectsList } = get();
          if (currentProject && projectsList.some((p) => p.id === currentProject.id)) return currentProject;
          return get().initNewProject(defaultName);
        },

        setCurrentProject: (project) => set({ currentProject: project }),

        updateProjectInfo: (data) => {
          const { currentProject } = get();
          if (!currentProject) return;
          commit({ ...currentProject, ...data, updatedAt: new Date().toISOString() });
        },

        setProjectStatus: (status) => {
          const { currentProject } = get();
          if (!currentProject) return;
          commit({ ...currentProject, status, updatedAt: new Date().toISOString() });
        },

        setProjectStatusById: (projectId, status, rfqCode) => {
          const project = get().projectsList.find((p) => p.id === projectId);
          if (!project) return;
          commit({
            ...project,
            status,
            rfqCode: rfqCode ?? project.rfqCode,
            updatedAt: new Date().toISOString(),
          });
        },

        duplicateProject: (projectId) => {
          const source = get().projectsList.find((p) => p.id === projectId);
          if (!source) return null;

          const newId = uid('proj');
          const rooms: Room[] = source.rooms.map((r) => {
            const roomId = uid('room');
            return {
              ...r,
              id: roomId,
              projectId: newId,
              createdAt: new Date().toISOString(),
              selectedItem: r.selectedItem ? { ...r.selectedItem, id: uid('item'), roomId } : undefined,
            };
          });
          const additionalItems = (source.additionalItems ?? []).map((it) => ({ ...it, id: uid('item') }));

          const now = new Date().toISOString();
          const copy = withTotals({
            ...source,
            id: newId,
            projectName: `${source.projectName} (copy)`,
            status: 'draft',
            rfqCode: undefined,
            rooms,
            additionalItems,
            createdAt: now,
            updatedAt: now,
          });

          set((state) => ({
            currentProject: copy,
            projectsList: [copy, ...state.projectsList],
          }));
          return copy;
        },

        removeProject: (projectId) =>
          set((state) => ({
            currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
            projectsList: state.projectsList.filter((p) => p.id !== projectId),
          })),

        addOrUpdateRoom: (room) => {
          const { currentProject } = get();
          if (!currentProject) return;

          const idx = currentProject.rooms.findIndex((r) => r.id === room.id);
          const rooms = [...currentProject.rooms];
          if (idx >= 0) rooms[idx] = room;
          else rooms.push(room);

          commit(withTotals({ ...currentProject, rooms }));
        },

        removeRoom: (roomId) => {
          const { currentProject } = get();
          if (!currentProject) return;
          commit(withTotals({ ...currentProject, rooms: currentProject.rooms.filter((r) => r.id !== roomId) }));
        },

        setRoomSelection: (roomId, selection) => {
          const { currentProject, addOrUpdateRoom } = get();
          if (!currentProject) return;
          const room = currentProject.rooms.find((r) => r.id === roomId);
          if (room) addOrUpdateRoom({ ...room, selectedItem: selection });
        },

        addAdditionalItem: (item) => {
          const { currentProject } = get();
          if (!currentProject) return;
          commit(
            withTotals({
              ...currentProject,
              additionalItems: [...(currentProject.additionalItems ?? []), item],
            })
          );
        },

        removeAdditionalItem: (itemId) => {
          const { currentProject } = get();
          if (!currentProject) return;
          commit(
            withTotals({
              ...currentProject,
              additionalItems: (currentProject.additionalItems ?? []).filter((i) => i.id !== itemId),
            })
          );
        },

        recordRfq: (record) =>
          set((state) => ({
            rfqHistory: [record, ...state.rfqHistory.filter((r) => r.code !== record.code)],
          })),

        markRfqSent: (code) =>
          set((state) => ({
            rfqHistory: state.rfqHistory.map((r) => (r.code === code ? { ...r, status: 'sent' as const } : r)),
          })),

        setUserProfile: (profile) => set({ userProfile: profile }),

        clearCurrentProject: () => set({ currentProject: null }),
      };
    },
    {
      name: 'qls-project-storage',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      /** v1 → v2: projetos antigos não tinham itens avulsos nem histórico de RFQ. */
      migrate: (persisted: any, version) => {
        if (!persisted) return persisted;
        if (version < 2) {
          const fix = (p: any) => (p ? { ...p, additionalItems: p.additionalItems ?? [] } : p);
          return {
            ...persisted,
            currentProject: fix(persisted.currentProject),
            projectsList: (persisted.projectsList ?? []).map(fix),
            rfqHistory: persisted.rfqHistory ?? [],
          };
        }
        return persisted;
      },
    }
  )
);
