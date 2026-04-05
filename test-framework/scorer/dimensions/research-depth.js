/**
 * research-depth.js — Scores the depth of research artifacts produced.
 *
 * Checks for research notes, citations, domain terminology usage,
 * bibliography, custom skills, and structured output organization.
 */

const fs = require('fs');
const path = require('path');

module.exports = function scoreResearchDepth(env, dimRubric) {
  const details = {};
  let score = 0;

  // Collect all text content from both directories for analysis
  let allContent = '';
  const artifactFiles = [];

  // Scan project directory
  if (env.projectDir && fs.existsSync(env.projectDir)) {
    const projectFiles = walkDir(env.projectDir);
    for (const file of projectFiles) {
      if (isTextFile(file)) {
        allContent += '\n' + fs.readFileSync(file, 'utf8');
        artifactFiles.push(path.relative(env.projectDir, file));
      }
    }
  }

  // Scan claude directory for custom content
  if (env.claudeDir && fs.existsSync(env.claudeDir)) {
    const claudeSubdirs = ['contexts', 'references', 'skills'];
    for (const sub of claudeSubdirs) {
      const dir = path.join(env.claudeDir, sub);
      if (fs.existsSync(dir)) {
        const files = walkDir(dir);
        for (const file of files) {
          if (isTextFile(file)) {
            allContent += '\n' + fs.readFileSync(file, 'utf8');
            artifactFiles.push('.claude/' + path.relative(env.claudeDir, file));
          }
        }
      }
    }
  }

  details.artifact_files = artifactFiles;
  details.total_artifact_count = artifactFiles.length;

  const allContentLower = allContent.toLowerCase();

  // 1. Has research notes
  const researchNotePatterns = [
    'research-notes',
    'research_notes',
    'notes/',
    'findings',
    'research/'
  ];
  const hasResearchNotes = artifactFiles.some(f => {
    const fl = f.toLowerCase();
    return researchNotePatterns.some(p => fl.includes(p));
  });

  // Also check if any content looks like research notes
  const contentHasNotes = /##\s*(findings|notes|research|summary)/i.test(allContent);

  if (hasResearchNotes || contentHasNotes) {
    score += 1;
    details.has_research_notes = true;
  } else {
    details.has_research_notes = false;
  }

  // 2. Research word count (substantial content beyond templates)
  const words = allContent.split(/\s+/).filter(w => w.length > 0);
  details.total_word_count = words.length;

  if (words.length >= 100) {
    score += 1;
    details.research_word_count = true;
  } else {
    details.research_word_count = false;
  }

  // 3. Has external citations (2 points)
  const urlPattern = /https?:\/\/[^\s)>"]+/g;
  const urls = allContent.match(urlPattern) || [];
  const uniqueUrls = [...new Set(urls)];
  details.citation_urls = uniqueUrls.slice(0, 20); // Cap for readability
  details.citation_count = uniqueUrls.length;

  if (uniqueUrls.length >= 1) {
    score += 1;
    if (uniqueUrls.length >= 3) {
      score += 1;
      details.has_external_citations = 'rich';
    } else {
      details.has_external_citations = 'some';
    }
  } else {
    details.has_external_citations = false;
  }

  // 4. Has domain-specific terms
  const domainTerms = env.persona.domain_terms || [];
  const foundTerms = domainTerms.filter(term =>
    allContentLower.includes(term.toLowerCase())
  );
  details.domain_terms_found = foundTerms;

  if (foundTerms.length > 0) {
    score += 1;
    details.has_domain_terms = true;
  } else {
    details.has_domain_terms = false;
  }

  // 5. Domain term richness (5+ distinct terms)
  if (foundTerms.length >= 5) {
    score += 1;
    details.domain_term_count = true;
  } else {
    details.domain_term_count = false;
  }

  // 6. Has bibliography
  const bibPatterns = [
    'bibliography',
    'references.md',
    'sources.md',
    'reading-list',
    'further-reading'
  ];
  const hasBib = artifactFiles.some(f =>
    bibPatterns.some(p => f.toLowerCase().includes(p))
  );
  const contentHasBib = /##\s*(bibliography|references|sources|reading\s+list)/i.test(allContent);

  if (hasBib || contentHasBib) {
    score += 1;
    details.has_bibliography = true;
  } else {
    details.has_bibliography = false;
  }

  // 7. Has custom skills
  const skillsDir = env.claudeDir
    ? path.join(env.claudeDir, 'skills')
    : null;
  let customSkillCount = 0;
  if (skillsDir && fs.existsSync(skillsDir)) {
    const skillEntries = fs.readdirSync(skillsDir);
    // Each skill is a directory with a SKILL.md
    for (const entry of skillEntries) {
      const skillMd = path.join(skillsDir, entry, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        customSkillCount++;
      }
    }
  }
  details.custom_skill_count = customSkillCount;
  if (customSkillCount > 0) {
    score += 1;
    details.has_custom_skills = true;
  } else {
    details.has_custom_skills = false;
  }

  // 8. Has custom contexts
  const contextsDir = env.claudeDir
    ? path.join(env.claudeDir, 'contexts')
    : null;
  let customContextCount = 0;
  if (contextsDir && fs.existsSync(contextsDir)) {
    const contextFiles = fs.readdirSync(contextsDir).filter(f => f.endsWith('.md'));
    // Count files beyond the template ones
    const templateContexts = ['research.md'];
    customContextCount = contextFiles.filter(f =>
      !templateContexts.includes(f.toLowerCase())
    ).length;
  }
  details.custom_context_count = customContextCount;
  if (customContextCount > 0) {
    score += 1;
    details.has_custom_contexts = true;
  } else {
    details.has_custom_contexts = false;
  }

  // 9. Has structured output (organized into directories/files)
  const directories = new Set();
  for (const f of artifactFiles) {
    const dir = path.dirname(f);
    if (dir !== '.') directories.add(dir);
  }
  details.output_directories = [...directories];
  if (directories.size >= 2 || artifactFiles.length >= 5) {
    score += 1;
    details.has_structured_output = true;
  } else {
    details.has_structured_output = false;
  }

  return { score, max: dimRubric.max_score, details };
};

/**
 * Recursively walk a directory and return all file paths.
 */
function walkDir(dir, maxDepth = 4, currentDepth = 0) {
  if (currentDepth > maxDepth) return [];
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip common non-content directories
        if (['node_modules', '.git', 'sessions'].includes(entry.name)) continue;
        results.push(...walkDir(fullPath, maxDepth, currentDepth + 1));
      } else {
        results.push(fullPath);
      }
    }
  } catch (err) {
    // Ignore permission errors
  }
  return results;
}

/**
 * Check if a file is likely a text file we should analyze.
 */
function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const textExts = ['.md', '.txt', '.json', '.yaml', '.yml', '.js', '.sh'];
  return textExts.includes(ext);
}
