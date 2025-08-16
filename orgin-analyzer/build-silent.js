const { execSync } = require('child_process');

// Suppress CSS selector warnings by redirecting stderr
try {
  console.log('Building Angular application...');
  
  // Run ng build and capture output
  const result = execSync('ng build', { 
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Filter out CSS selector warnings
  const lines = result.split('\n');
  const filteredLines = lines.filter(line => {
    return !line.includes('Did not expect successive traversals') &&
           !line.includes('Unexpected combinator') &&
           !line.includes('rules skipped due to selector errors');
  });
  
  console.log(filteredLines.join('\n'));
  console.log('\n✅ Build completed successfully!');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
