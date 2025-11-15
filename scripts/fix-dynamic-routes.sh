#!/bin/bash

# List of route files that need the dynamic export (excluding already fixed avatar/load)
ROUTES=(
  "app/api/teacher/students/route.ts"
  "app/api/teacher/classes/route.ts"
  "app/api/teacher/classes/[classId]/route.ts"
  "app/api/teacher/classes/[classId]/students/route.ts"
  "app/api/teacher/assignments/route.ts"
  "app/api/teacher/analytics/student/[studentId]/route.ts"
  "app/api/teacher/analytics/overview/route.ts"
  "app/api/teacher/analytics/class/[classId]/route.ts"
  "app/api/teacher/alerts/route.ts"
  "app/api/teacher/alerts/[alertId]/route.ts"
  "app/api/ai/update-profile/route.ts"
  "app/api/ai/recommend-activity/route.ts"
  "app/api/ai/hint/route.ts"
  "app/api/ai/feedback/route.ts"
  "app/api/ai/encouragement/route.ts"
  "app/api/ai/analyze-mistake/route.ts"
  "app/api/stats/student/route.ts"
  "app/api/activities/submit/route.ts"
  "app/api/activities/generate/route.ts"
  "app/api/avatar/save/route.ts"
)

for route in "${ROUTES[@]}"; do
  if [ -f "$route" ]; then
    # Check if dynamic export already exists
    if ! grep -q "export const dynamic" "$route"; then
      # Find the last import line and add the dynamic export after it
      sed -i "/^import /,/^$/!b;/^$/i\
\
export const dynamic = 'force-dynamic'" "$route"
      echo "✓ Added dynamic export to: $route"
    else
      echo "✓ Already has dynamic export: $route"
    fi
  else
    echo "✗ File not found: $route"
  fi
done

echo ""
echo "Done! Fixed all route files."
