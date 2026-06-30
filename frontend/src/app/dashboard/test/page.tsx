"use client";
import { generateDocx } from '@/lib/docxGenerator';

export default function TestPage() {
  const handleClick = async () => {
    try {
      await generateDocx({ name: "Testing" }, "test.docx");
      console.log("DOCX generated successfully!");
    } catch (e) {
      console.error("DOCX Error:", e);
    }
  };

  return (
    <div>
      <button id="test-btn" onClick={handleClick}>Test DOCX</button>
    </div>
  );
}
