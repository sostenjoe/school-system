# TODO-next-steps

## Current issue: “Standards loading…” never resolves

1. Fix admin standards loader so it actually loads teacher standard groups from backend and removes the “Loading standards...” placeholder.
2. Add UI fallback/error display if `/api/teachers/:teacherId/standards` fails.
3. Ensure multi-select options are replaced with real standard groups (I-II, III-IV, V-VII) when page loads or when teacher changes.

## Testing

4. Open `client/css/js/pages/admin-settings.html` as admin.
5. Select a teacher and verify standards populate immediately and loader text disappears.

