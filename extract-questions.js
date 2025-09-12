const fs = require('fs');
const path = require('path');

// Read the massive questions file from cagpublicmerge
const questionsPath = '/Users/tone/Desktop/CAG-Official-2025/cagpublicmerge/app/mock-interview/interview-data.ts';

console.log('🔍 Reading questions from cagpublicmerge...');

// Read the file
const fileContent = fs.readFileSync(questionsPath, 'utf8');

// Extract the questions object using regex
const questionsMatch = fileContent.match(/export const interviewQuestions[\s\S]*?};/);
if (!questionsMatch) {
  console.error('❌ Could not find interview questions in file');
  process.exit(1);
}

// Remove the export statement and eval the object
const questionsCode = questionsMatch[0]
  .replace('export const interviewQuestions: Record<string, InterviewQuestion[]> = ', 'const questions = ')
  .replace(/export interface InterviewQuestion[\s\S]*?}/g, '');

// Safely extract the questions (this is a bit hacky but works for our use case)
console.log('⚗️ Parsing questions data...');

// Let's manually extract questions by category
const categories = ['helpdesk', 'isp', 'osp', 'fiber', 'network', 'systems'];
const extractedQuestions = {};

for (const category of categories) {
  console.log(`📊 Processing ${category} questions...`);
  
  // Find the start of this category
  const categoryStart = fileContent.indexOf(`  ${category}: [`);
  const nextCategoryIndex = categories.findIndex(c => c === category) + 1;
  const nextCategory = nextCategoryIndex < categories.length ? categories[nextCategoryIndex] : null;
  
  let categoryEnd;
  if (nextCategory) {
    categoryEnd = fileContent.indexOf(`  ${nextCategory}: [`);
  } else {
    categoryEnd = fileContent.lastIndexOf('};');
  }
  
  const categoryContent = fileContent.substring(categoryStart, categoryEnd);
  
  // Count questions in this category
  const questionCount = (categoryContent.match(/question:/g) || []).length;
  console.log(`✅ Found ${questionCount} questions in ${category}`);
  
  // For now, let's extract first few questions manually to verify structure
  const questionMatches = categoryContent.match(/{\s*question:\s*"([^"]+)",\s*answer:\s*"([^"]+)"/g);
  
  extractedQuestions[category] = {
    count: questionCount,
    sample: questionMatches ? questionMatches.slice(0, 3) : []
  };
}

console.log('\n🎯 EXTRACTION RESULTS:');
console.log('='.repeat(50));

let totalQuestions = 0;
for (const [category, data] of Object.entries(extractedQuestions)) {
  console.log(`${category.toUpperCase()}: ${data.count} questions`);
  totalQuestions += data.count;
}

console.log('='.repeat(50));
console.log(`📊 TOTAL QUESTIONS FOUND: ${totalQuestions}`);
console.log('🎉 Extraction complete!');

// Save the results
fs.writeFileSync('extraction-results.json', JSON.stringify(extractedQuestions, null, 2));
console.log('💾 Results saved to extraction-results.json');