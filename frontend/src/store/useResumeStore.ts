import { create } from 'zustand';

interface Experience {
  id?: string; // used for dnd-kit
  job_title: string;
  company: string;
  dates: string;
  bullet_points: string[];
}

interface EducationEntry {
  id?: string;
  degree: string;
  institution: string;
  year: string;
}

interface CustomSection {
  id?: string;
  title: string;
  content: string;
}

interface ParsedData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  education?: string;
  education_entries?: EducationEntry[];
  summary?: string;
  structured_experience?: Experience[];
  visible_sections?: Record<string, boolean>;
  section_labels?: Record<string, string>;
  custom_sections?: CustomSection[];
  [key: string]: any;
}

interface ResumeStore {
  parsedData: ParsedData;
  setParsedData: (data: ParsedData) => void;
  updateField: (field: keyof ParsedData, value: any) => void;
  updateExperience: (index: number, updatedExp: Experience) => void;
  reorderExperiences: (startIndex: number, endIndex: number) => void;
  updateEducation: (index: number, updatedEdu: EducationEntry) => void;
  reorderEducations: (startIndex: number, endIndex: number) => void;
  updateCustomSection: (index: number, updatedSec: CustomSection) => void;
  reorderCustomSections: (startIndex: number, endIndex: number) => void;
  toggleSectionVisibility: (section: string) => void;
  updateSectionLabel: (section: string, label: string) => void;
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
  }),
  updateEducation: (index, updatedEdu) => set((state) => {
    const edus = [...(state.parsedData.education_entries || [])];
    edus[index] = updatedEdu;
    return { parsedData: { ...state.parsedData, education_entries: edus } };
  }),
  reorderEducations: (startIndex, endIndex) => set((state) => {
    const edus = Array.from(state.parsedData.education_entries || []);
    const [removed] = edus.splice(startIndex, 1);
    edus.splice(endIndex, 0, removed);
    return { parsedData: { ...state.parsedData, education_entries: edus } };
  }),
  updateCustomSection: (index, updatedSec) => set((state) => {
    const secs = [...(state.parsedData.custom_sections || [])];
    secs[index] = updatedSec;
    return { parsedData: { ...state.parsedData, custom_sections: secs } };
  }),
  reorderCustomSections: (startIndex, endIndex) => set((state) => {
    const secs = Array.from(state.parsedData.custom_sections || []);
    const [removed] = secs.splice(startIndex, 1);
    secs.splice(endIndex, 0, removed);
    return { parsedData: { ...state.parsedData, custom_sections: secs } };
  }),
  updateSectionLabel: (section, label) => set((state) => {
    const labels = state.parsedData.section_labels || {};
    return {
      parsedData: {
        ...state.parsedData,
        section_labels: { ...labels, [section]: label }
      }
    };
  })
}));
