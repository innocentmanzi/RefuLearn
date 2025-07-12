const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix Promise<void> annotations
function fixPromiseVoid(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Remove `: Promise<void>` from route handlers
  // This regex matches the pattern: asyncHandler(async (req: Request, res: Response): Promise<void> => {
  content = content.replace(
    /asyncHandler\(async \(req: Request, res: Response\): Promise<void> =>/g,
    'asyncHandler(async (req: Request, res: Response) =>'
  );
  
  // Also handle cases without asyncHandler wrapper
  content = content.replace(
    /async \(req: Request, res: Response\): Promise<void> =>/g,
    'async (req: Request, res: Response) =>'
  );
  
  // Handle cases with different parameter names
  content = content.replace(
    /async \(([^)]+)\): Promise<void> =>/g,
    'async ($1) =>'
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
    return false;
  }
}

// Main execution
const routesDir = path.join(__dirname, 'src', 'routes');
let fixedCount = 0;

if (fs.existsSync(routesDir)) {
  const tsFiles = findTsFiles(routesDir);
  console.log(`Found ${tsFiles.length} TypeScript files in routes directory`);
  
  tsFiles.forEach(filePath => {
    if (fixPromiseVoid(filePath)) {
      fixedCount++;
    }
  });
  
  console.log(`\n🎉 Fixed ${fixedCount} files successfully!`);
} else {
  console.error('Routes directory not found!');
  process.exit(1);
} 