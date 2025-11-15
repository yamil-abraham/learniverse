const fs = require('fs');
const path = require('path');

const routeFiles = [
  'app/api/teacher/students/route.ts',
  'app/api/teacher/classes/route.ts',
  'app/api/teacher/classes/[classId]/route.ts',
  'app/api/teacher/classes/[classId]/students/route.ts',
  'app/api/teacher/assignments/route.ts',
  'app/api/teacher/analytics/student/[studentId]/route.ts',
  'app/api/teacher/analytics/overview/route.ts',
  'app/api/teacher/analytics/class/[classId]/route.ts',
  'app/api/teacher/alerts/route.ts',
  'app/api/teacher/alerts/[alertId]/route.ts',
  'app/api/ai/update-profile/route.ts',
  'app/api/ai/recommend-activity/route.ts',
  'app/api/ai/hint/route.ts',
  'app/api/ai/feedback/route.ts',
  'app/api/ai/encouragement/route.ts',
  'app/api/ai/analyze-mistake/route.ts',
  'app/api/stats/student/route.ts',
  'app/api/activities/submit/route.ts',
  'app/api/activities/generate/route.ts',
  'app/api/avatar/save/route.ts'
];

const baseDir = process.cwd();
let successCount = 0;
let skipCount = 0;
let errorCount = 0;

console.log('Adding dynamic export to API routes...\n');

routeFiles.forEach(routeFile => {
  const filePath = path.join(baseDir, routeFile);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`✗ File not found: ${routeFile}`);
      errorCount++;
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if dynamic export already exists
    if (content.includes("export const dynamic = 'force-dynamic'")) {
      console.log(`⊙ Already has dynamic export: ${routeFile}`);
      skipCount++;
      return;
    }

    // Find the position after the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') ||
          lines[i].trim().startsWith('} from ')) {
        lastImportIndex = i;
      } else if (lastImportIndex !== -1 && lines[i].trim() === '') {
        // Found empty line after imports
        break;
      }
    }

    if (lastImportIndex === -1) {
      console.log(`✗ Could not find import statements in: ${routeFile}`);
      errorCount++;
      return;
    }

    // Insert dynamic export after imports
    lines.splice(lastImportIndex + 1, 0, '', "export const dynamic = 'force-dynamic'");

    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');

    console.log(`✓ Added dynamic export to: ${routeFile}`);
    successCount++;

  } catch (error) {
    console.log(`✗ Error processing ${routeFile}:`, error.message);
    errorCount++;
  }
});

console.log(`\n✨ Done! Success: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
