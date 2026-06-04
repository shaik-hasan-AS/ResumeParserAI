import { create } from 'zustand';

interface Experience {
  id?: string; // used for dnd-kit
  job_title: string;
  company: string;
  dates: string;
  bullet_points: string[];
}

interface ParsedData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  education?: string;
  summary?: string;
  structured_experience?: Experience[];
  visible_sections?: Record<string, boolean>;
  [key: string]: any;
}

interface ResumeStore {
  parsedData: ParsedData;
  setParsedData: (data: ParsedData) => void;
  updateField: (field: keyof ParsedData, value: any) => void;
  updateExperience: (index: number, updatedExp: Experience) => void;
  reorderExperiences: (startIndex: number, endIndex: number) => void;
  toggleSectionVisibility: (section: string) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  parsedData: {},
  setParsedData: (data) => set({ parsedData: data }),
  updateField: (field, value) => set((state) => ({
    parsedData: { ...state.parsedData, [field]: value }
  })),
  updateExperience: (index, updatedExp) => set((state) => {
    const exps = [...(state.parsedData.structured_experience || [])];
    exps[index] = updatedExp;
    return { parsedData: { ...state.parsedData, structured_experience: exps } };
  }),
  reorderExperiences: (startIndex, endIndex) => set((state) => {
    const exps = Array.from(state.parsedData.structured_experience || []);
    const [removed] = exps.splice(startIndex, 1);
    exps.splice(endIndex, 0, removed);
    return { parsedData: { ...state.parsedData, structured_experience: exps } };
  }),
  toggleSectionVisibility: (section: string) => set((state) => {
    const currentVis = state.parsedData.visible_sections || {};
    // Default to true if undefined
    const isVisible = currentVis[section] !== undefined ? currentVis[section] : true;
    return {
      parsedData: {
        ...state.parsedData,
        visible_sections: { ...currentVis, [section]: !isVisible }
      }
    };
  })
}));
