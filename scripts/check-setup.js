#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 CMS Platform Setup Checker\n');

const checks = [
  {
    name: 'Environment file exists',
    check: () => fs.existsSync('.env.local'),
    fix: 'Create .env.local file with Supabase credentials (see docs/setup-guide.md)',
  },
  {
    name: 'Database migration file exists',
    check: () => fs.existsSync('supabase/migrations/001_initial_schema.sql'),
    fix: 'SQL migration file exists',
  },
  {
    name: 'Required dependencies installed',
    check: () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const required = ['@supabase/ssr', '@tiptap/react', 'dompurify', 'lucide-react'];
      return required.every(dep => packageJson.dependencies[dep]);
    },
    fix: 'Run: npm install',
  },
  {
    name: 'Node modules exist',
    check: () => fs.existsSync('node_modules'),
    fix: 'Run: npm install',
  },
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  const message = passed ? 'PASS' : 'FAIL';
  
  console.log(`${index + 1}. ${check.name}: ${status} ${message}`);
  
  if (!passed) {
    console.log(`   Fix: ${check.fix}\n`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Your setup looks good.');
  console.log('\nNext steps:');
  console.log('1. Set up your Supabase project credentials in .env.local');
  console.log('2. Run the database migration in Supabase SQL Editor');
  console.log('3. Start development server: npm run dev');
} else {
  console.log('❌ Some checks failed. Please address the issues above.');
  console.log('📖 See docs/setup-guide.md for detailed instructions.');
}

console.log('\n📚 Documentation: docs/setup-guide.md');
console.log('🗄️  Database Schema: supabase/migrations/001_initial_schema.sql'); 