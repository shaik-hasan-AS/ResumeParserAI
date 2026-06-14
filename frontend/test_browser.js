const { chromium } = require('playwright');
(async () => {
  // wait for next.js to start
  await new Promise(r => setTimeout(r, 2000));
  console.log("Starting playwright...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Create a mock parsed data response so we don't need the backend
  await page.route('**/api/resume/*/parsed', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        parsed_json: {
          custom_sections: [
            { id: '1', title: 'First', content: 'Content 1' },
            { id: '2', title: 'Second', content: 'Content 2' }
          ]
        }
      })
    });
  });

  await page.goto('http://localhost:3000/dashboard/builder/test_resume_id');
  await page.waitForLoadState('networkidle');

  console.log("Page loaded. Looking for custom sections...");
  
  // Wait for Custom Sections to render
  await page.waitForSelector('text="First"');
  
  // Get all custom section titles
  let titles = await page.$$eval('input[placeholder="Custom Section Title (e.g. Strengths)"]', inputs => inputs.map(i => i.value));
  console.log("Titles before move:", titles);

  // Click move down on the first item
  // The first item should have a move down button
  const buttons = await page.$$('button:has(.lucide-arrow-down)');
  // Depending on how many sections have arrow down, we need the one for 'First'.
  // We can just click the first move-down button (since experience/education are empty)
  console.log(`Found ${buttons.length} move down buttons. Clicking the first one...`);
  if (buttons.length > 0) {
    await buttons[0].click();
    await page.waitForTimeout(500); // wait for re-render
  }

  let titlesAfter = await page.$$eval('input[placeholder="Custom Section Title (e.g. Strengths)"]', inputs => inputs.map(i => i.value));
  console.log("Titles after move:", titlesAfter);

  await browser.close();
})();
