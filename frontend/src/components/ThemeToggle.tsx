Looking at this card, here are the issues — UI and logic both:

** Data quality problems **
  - "Not detected" for phone is shown as a dead end — should prompt the user to manually enter it instead of just displaying failure
    - Education section is in a scrollable textarea dumping raw text — it should be parsed into structured cards(degree, institution, year) not a blob
      - Skills like "Strategy", "Communication", "Operations" are soft skills mixed in with technical ones — they need to be separated into two categories: Technical and Soft

        ** Information gaps **
          - No LinkedIn or GitHub links extracted — for a tech resume these are critical and should be their own fields
            - No location field — most ATS systems need this
              - No experience years calculated — you have the education dates, so you can infer seniority level

                ** UI problems **
                  - The education box with a scrollbar inside a card is a terrible pattern — never nest scroll inside scroll
                    - ALL CAPS labels(`FULL NAME`, `EMAIL ADDRESS`) feel aggressive — use sentence case with muted color instead
                      - Skill pills are all the same color with no hierarchy — technical vs soft vs tools should be visually distinct
                        - No completeness indicator — user doesn't know what's missing at a glance
                          - The card feels cramped with no breathing room between sections

                            ** Structural suggestion **

                              Split this left panel into two cleaner sections:

1. A contact block — name, email, phone(editable inline if not detected), LinkedIn, GitHub, location
2. A profile block — seniority level inferred, education as structured entries, skills split by category with a completeness score at the top showing "7/10 fields detected"

The goal of this panel is to let the user verify and correct extracted data before analysis runs — right now it doesn't support that workflow at all."use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full hover:bg-black/5 dark:hover:bg-muted text-muted-foreground dark:text-muted-foreground dark:hover:text-foreground"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
