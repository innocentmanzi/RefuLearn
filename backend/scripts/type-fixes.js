const fs = require('fs');
const path = require('path');

// Function to fix a route file
function fixRouteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add Request, Response imports if not present
  if (!content.includes('import { Request, Response }')) {
    content = content.replace(
      'import express from \'express\';',
      'import express, { Request, Response } from \'express\';'
    );
  }
  
  // Fix asyncHandler parameter types
  content = content.replace(
    /asyncHandler\(async \(req, res\) =>/g,
    'asyncHandler(async (req: Request, res: Response) =>'
  );
  
  // Add return types to async functions
  content = content.replace(
    /asyncHandler\(async \(req: Request, res: Response\) =>/g,
    'asyncHandler(async (req: Request, res: Response): Promise<void> =>'
  );
  
  // Fix authorizeRoles usage (change array to spread)
  content = content.replace(
    /authorizeRoles\(\[([^\]]+)\]\)/g,
    'authorizeRoles($1)'
  );
  
  // Remove unused imports
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip unused imports
    if (line.includes('import { User }') && !content.includes('User.findById') && !content.includes('User.findOne') && !content.includes('User.create')) {
      continue;
    }
    if (line.includes('import { logger }') && !content.includes('logger.')) {
      continue;
    }
    if (line.includes('import { upload }') && !content.includes('upload.')) {
      continue;
    }
    
    newLines.push(line);
  }
  
  // Fix parameter types in reduce functions
  content = newLines.join('\n');
  content = content.replace(
    /\.reduce\(\(sum, ([^)]+)\) =>/g,
    '.reduce((sum: number, $1: any) =>'
  );
  
  content = content.replace(
    /\.filter\(([^)]+) =>/g,
    '.filter(($1: any) =>'
  );
  
  content = content.replace(
    /\.map\(([^)]+) =>/g,
    '.map(($1: any) =>'
  );
  
  // Fix array access for params
  content = content.replace(
    /req\.params\.([a-zA-Z]+)/g,
    'req.params[\'$1\']'
  );
  
  // Fix array access for info object
  content = content.replace(
    /info\.timestamp/g,
    'info[\'timestamp\']'
  );
  
  // Write back the fixed content
  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${filePath}`);
}

// Get all route files
const routesDir = path.join(__dirname, 'src', 'routes');
const routeFiles = fs.readdirSync(routesDir)
  .filter(file => file.endsWith('.ts'));

// Fix each route file
routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  fixRouteFile(filePath);
});

// Fix middleware files
const middlewareDir = path.join(__dirname, 'src', 'middleware');
const middlewareFiles = fs.readdirSync(middlewareDir)
  .filter(file => file.endsWith('.ts'));

middlewareFiles.forEach(file => {
  const filePath = path.join(middlewareDir, file);
  fixRouteFile(filePath);
});

// Fix config files
const configDir = path.join(__dirname, 'src', 'config');
const configFiles = fs.readdirSync(configDir)
  .filter(file => file.endsWith('.ts'));

configFiles.forEach(file => {
  const filePath = path.join(configDir, file);
  fixRouteFile(filePath);
});

// Fix utils files
const utilsDir = path.join(__dirname, 'src', 'utils');
const utilsFiles = fs.readdirSync(utilsDir)
  .filter(file => file.endsWith('.ts'));

utilsFiles.forEach(file => {
  const filePath = path.join(utilsDir, file);
  fixRouteFile(filePath);
});

console.log('TypeScript fixes applied to all files!'); 