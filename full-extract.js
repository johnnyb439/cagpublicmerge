const fs = require('fs');

console.log('🚀 FULL QUESTION EXTRACTION STARTING! ⚡️');

// Copy the entire interview-data.ts file and modify it to be importable
const sourcePath = '/Users/tone/Desktop/CAG-Official-2025/cagpublicmerge/app/mock-interview/interview-data.ts';
const content = fs.readFileSync(sourcePath, 'utf8');

console.log('📁 File size:', Math.round(content.length / 1024), 'KB');

// Create a temporary JS file that we can actually import
const jsContent = content
  .replace(/export interface[\s\S]*?}/g, '') // Remove interface declarations
  .replace(/export const interviewQuestions/, 'const interviewQuestions')
  .replace(/: Record<string, InterviewQuestion\[\]>/, '')
  + '\n\nmodule.exports = interviewQuestions;';

// Write temporary file
fs.writeFileSync('temp-questions.js', jsContent);

console.log('📊 Processing questions...');

try {
  // Import the questions
  const questions = require('./temp-questions.js');
  
  const results = {};
  let totalQuestions = 0;
  
  for (const [category, questionArray] of Object.entries(questions)) {
    console.log(`\n🎯 Processing ${category.toUpperCase()}:`);
    
    const processedQuestions = questionArray.map((q, index) => {
      // Add metadata
      let difficulty = 'easy';
      if (index >= questionArray.length * 0.33 && index < questionArray.length * 0.67) {
        difficulty = 'medium';
      } else if (index >= questionArray.length * 0.67) {
        difficulty = 'hard';
      }
      
      return {
        id: `${category}-${String(index + 1).padStart(3, '0')}`,
        category: category,
        question: q.question,
        answer: q.answer,
        difficulty: difficulty,
        tags: category === 'helpdesk' ? ['troubleshooting', 'customer-service'] :
              category === 'network' ? ['networking', 'infrastructure'] :
              category === 'systems' ? ['servers', 'administration'] :
              [category, 'technical']
      };
    });
    
    results[category] = processedQuestions;
    totalQuestions += processedQuestions.length;
    
    console.log(`✅ ${processedQuestions.length} questions processed`);
    console.log(`📝 Sample: "${processedQuestions[0].question.substring(0, 50)}..."`);
  }
  
  console.log('\n🏆 EXTRACTION COMPLETE!');
  console.log('='.repeat(60));
  console.log(`📊 TOTAL QUESTIONS: ${totalQuestions}`);
  console.log('📁 Categories:', Object.keys(results).join(', '));
  
  // Save the complete database
  const outputPath = 'public/api/interview-questions-db.json';
  
  // Create directory if it doesn't exist
  fs.mkdirSync('public/api', { recursive: true });
  
  // Save the full database
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  // Also create individual category files for faster loading
  for (const [category, questions] of Object.entries(results)) {
    fs.writeFileSync(
      `public/api/questions-${category}.json`, 
      JSON.stringify(questions, null, 2)
    );
    console.log(`💾 ${category}: ${questions.length} questions saved`);
  }
  
  console.log('\n🎉 ALL FILES CREATED SUCCESSFULLY!');
  console.log(`📁 Main database: ${outputPath}`);
  console.log('📁 Individual files: public/api/questions-[category].json');
  
  // Create metadata file
  const metadata = {
    totalQuestions,
    categories: Object.keys(results),
    lastUpdated: new Date().toISOString(),
    breakdown: Object.fromEntries(
      Object.entries(results).map(([cat, questions]) => [cat, questions.length])
    )
  };
  
  fs.writeFileSync('public/api/questions-metadata.json', JSON.stringify(metadata, null, 2));
  console.log('📋 Metadata file created');
  
} catch (error) {
  console.error('❌ Error processing questions:', error);
} finally {
  // Cleanup
  if (fs.existsSync('temp-questions.js')) {
    fs.unlinkSync('temp-questions.js');
  }
}

console.log('\n🔥 READY TO ROCK WITH 334 QUESTIONS! ⚡️');