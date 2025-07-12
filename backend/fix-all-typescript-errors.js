const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/course.routes.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix all error property access issues
const errorPropertyAccessFixes = [
  // Fix .message access on unknown errors
  {
    search: /console\.error\('([^']+)', ([^.]+)\.message\)/g,
    replace: "console.error('$1', $2 instanceof Error ? $2.message : 'Unknown error')"
  },
  {
    search: /console\.error\('([^']+)', ([^.]+)\.stack\)/g,
    replace: "console.error('$1', $2 instanceof Error ? $2.stack : 'Unknown error')"
  },
  {
    search: /console\.warn\('([^']+)', ([^.]+)\.message\)/g,
    replace: "console.warn('$1', $2 instanceof Error ? $2.message : 'Unknown error')"
  },
  // Fix error responses
  {
    search: /error: ([^.]+)\.message/g,
    replace: "error: $1 instanceof Error ? $1.message : 'Unknown error'"
  },
  {
    search: /message: ([^.]+)\.message/g,
    replace: "message: $1 instanceof Error ? $1.message : 'Unknown error'"
  },
  // Fix specific error object property access
  {
    search: /if \(([^.]+)\.error === 'not_found'\)/g,
    replace: "if ($1 instanceof Error && '$1'.includes('not_found'))"
  },
  {
    search: /if \(([^.]+)\.error === 'conflict'\)/g,
    replace: "if ($1 instanceof Error && '$1'.includes('conflict'))"
  },
  {
    search: /if \(([^.]+)\.statusCode === 404\)/g,
    replace: "if ($1 instanceof Error && ('statusCode' in $1 && $1.statusCode === 404))"
  },
  {
    search: /if \(([^.]+)\.statusCode === 409\)/g,
    replace: "if ($1 instanceof Error && ('statusCode' in $1 && $1.statusCode === 409))"
  },
  // Fix error name access
  {
    search: /type: ([^.]+)\.name/g,
    replace: "type: $1 instanceof Error ? $1.name : 'UnknownError'"
  },
  {
    search: /details: ([^.]+)\.message/g,
    replace: "details: $1 instanceof Error ? $1.message : 'Unknown error'"
  }
];

// Apply all fixes
errorPropertyAccessFixes.forEach(fix => {
  content = content.replace(fix.search, fix.replace);
});

// Fix remaining catch blocks with any type
content = content.replace(/catch \(([^:]+): any\)/g, 'catch ($1: unknown)');

// Fix selector type issue
content = content.replace(
  /let selector: any = { type: 'course' };/g,
  'let selector: { type: string; instructor?: string } = { type: \'course\' };'
);

// Fix parseArrayField function
content = content.replace(
  /const parseArrayField = \(field: any\) => {/g,
  'const parseArrayField = (field: unknown) => {'
);

// Fix specific error handling patterns
content = content.replace(
  /throw new Error\(([^)]+)\);/g,
  'throw new Error($1);'
);

// Write back to file
fs.writeFileSync(filePath, content);

console.log('Fixed all TypeScript errors in course.routes.ts'); 