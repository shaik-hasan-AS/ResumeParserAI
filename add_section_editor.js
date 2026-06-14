const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/dashboard/builder/[id]/page.tsx', 'utf8');

// Update imports
content = content.replace(
  `import { useResumeStore } from '@/store/useResumeStore';`,
  `import { useResumeStore, DEFAULT_SECTION_ORDER } from '@/store/useResumeStore';`
);

const component = `
const SectionOrderEditor = () => {
  const { parsedData, reorderGlobalSections, toggleSectionVisibility } = useResumeStore();
  const order = parsedData.section_order || DEFAULT_SECTION_ORDER;
  const labels = parsedData.section_labels || {};

  const getLabel = (sec: string) => {
    if (sec === 'custom_sections') return 'Custom Sections';
    if (sec === 'summary') return labels.summary || 'Summary';
    return labels[sec] || sec.charAt(0).toUpperCase() + sec.slice(1);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold">Section Layout Order</h2>
      <p className="text-xs text-muted-foreground">Reorder sections across your entire resume PDF.</p>
      <div className="bg-muted p-2 rounded-xl border border-border">
        {order.map((sec, index) => {
          const isVisible = parsedData.visible_sections?.[sec] !== false;
          return (
            <div key={sec} className="flex items-center justify-between py-2 px-2 border-b border-border/50 last:border-0 hover:bg-background/50 rounded-lg transition-colors">
              <span className="text-sm font-semibold">{getLabel(sec)}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => { if(index > 0) reorderGlobalSections(index, index - 1); }} disabled={index === 0} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded disabled:opacity-30">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => { if(index < order.length - 1) reorderGlobalSections(index, index - 1 + 2); }} disabled={index === order.length - 1} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded disabled:opacity-30">
                  <ArrowDown className="w-4 h-4" />
                </button>
                {sec !== 'custom_sections' && (
                  <button type="button" onClick={() => toggleSectionVisibility(sec)} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded">
                    {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
`;

content = content.replace(
  `export default function BuilderPage() {`,
  component + `\n\nexport default function BuilderPage() {`
);

// Insert the component into the layout at the bottom of the left pane
content = content.replace(
  `          <section className="space-y-4">
            <div className="flex justify-between items-center border-t border-border pt-6">
              <h2 className="text-lg font-bold">Custom Sections</h2>`,
  `          <SectionOrderEditor />\n\n          <section className="space-y-4">
            <div className="flex justify-between items-center border-t border-border pt-6">
              <h2 className="text-lg font-bold">Custom Sections</h2>`
);

fs.writeFileSync('frontend/src/app/dashboard/builder/[id]/page.tsx', content);
