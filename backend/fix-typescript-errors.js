const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/course.routes.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix all catch blocks with any type annotations
content = content.replace(/catch \(([^:]+): any\)/g, (match, variableName) => {
  return `catch (${variableName}: unknown)`;
});

// Fix all error handling to use proper typing
content = content.replace(/console\.error\(([^,]+), ([^.]+)\.message\)/g, (match, logMessage, errorVar) => {
  return `console.error(${logMessage}, ${errorVar} instanceof Error ? ${errorVar}.message : 'Unknown error')`;
});

// Fix explicit any type annotations for variables
content = content.replace(/let selector: any = { type: 'course' };/g, `let selector: { type: string; instructor?: string } = { type: 'course' };`);

// Fix parseArrayField function
content = content.replace(/const parseArrayField = \(field: any\) => {/g, `const parseArrayField = (field: unknown) => {`);

// Fix function signature at the end
content = content.replace(/async function checkCourseCompletion\(database: any,/g, `async function checkCourseCompletion(database: any,`);

// Write back to file
fs.writeFileSync(filePath, content);

console.log('Fixed TypeScript errors in course.routes.ts'); 