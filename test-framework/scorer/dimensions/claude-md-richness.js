/**
 * claude-md-richness.js — Scores the quality and completeness of generated CLAUDE.md files.
 *
 * Checks both the global (~/.claude/CLAUDE.md) and project-level CLAUDE.md.
 * Deterministic text analysis: word count, section presence, domain term matching.
 */

const fs = require('fs');
const path = require('path');

module.exports = function scoreCladeMdRichness(env, dimRubric) {
  const details = {};
  let score = 0;

  // Look for CLAUDE.md in both locations
  const projectClaudeMd = env.projectDir
    ? path.join(env.projectDir, 'CLAUDE.md')
    : null;
  const globalClaudeMd = env.claudeDir
    ? path.join(env.claudeDir, 'CLAUDE.md')
    : null;

  // Use project CLAUDE.md as primary, fall back to global
  let claudeMdPath = null;
  let content = '';

  if (projectClaudeMd && fs.existsSync(projectClaudeMd)) {
    claudeMdPath = projectClaudeMd;
    content = fs.readFileSync(projectClaudeMd, 'utf8');
    details.source = 'project';
  } else if (globalClaudeMd && fs.existsSync(globalClaudeMd)) {
    claudeMdPath = globalClaudeMd;
    content = fs.readFileSync(globalClaudeMd, 'utf8');
    details.source = 'global';
  }

  // If both exist, combine content for richer scoring
  if (projectClaudeMd && globalClaudeMd &&
      fs.existsSync(projectClaudeMd) && fs.existsSync(globalClaudeMd)) {
    const globalContent = fs.readFileSync(globalClaudeMd, 'utf8');
    content = content + '\n' + globalContent;
    details.source = 'both';
  }

  const contentLower = content.toLowerCase();
  const words = content.split(/\s+/).filter(w => w.length > 0);

  // 1. File exists
  if (claudeMdPath) {
    score += 1;
    details.file_exists = true;
  } else {
    details.file_exists = false;
    return { score, max: dimRubric.max_score, details };
  }

  // 2. Word count minimum (50)
  details.word_count = words.length;
  if (words.length >= 50) {
    score += 1;
    details.word_count_minimum = true;
  } else {
    details.word_count_minimum = false;
  }

  // 3. Word count rich (200)
  if (words.length >= 200) {
    score += 1;
    details.word_count_rich = true;
  } else {
    details.word_count_rich = false;
  }

  // 4. Has persona background
  const backgroundPatterns = [
    /about\s+you/i,
    /background/i,
    /context/i,
    /who\s+(i|you)\s+(am|are)/i,
    /hairstyl/i,
    /hair\s*cut/i
  ];
  const hasBackground = backgroundPatterns.some(p => p.test(content));
  if (hasBackground) {
    score += 1;
    details.has_persona_background = true;
  } else {
    details.has_persona_background = false;
  }

  // 5. Has research goals
  const goalPatterns = [
    /goals?/i,
    /objectives?/i,
    /aims?/i,
    /research\s+goals?/i,
    /want\s+to/i
  ];
  const hasGoals = goalPatterns.some(p => p.test(content));
  if (hasGoals) {
    score += 1;
    details.has_research_goals = true;
  } else {
    details.has_research_goals = false;
  }

  // 6. Has working method
  const methodPatterns = [
    /working\s+method/i,
    /methodology/i,
    /how\s+(i|we)\s+work/i,
    /approach/i,
    /workflow/i,
    /research.first/i
  ];
  const hasMethod = methodPatterns.some(p => p.test(content));
  if (hasMethod) {
    score += 1;
    details.has_working_method = true;
  } else {
    details.has_working_method = false;
  }

  // 7. Has communication preferences
  const commPatterns = [
    /communicat/i,
    /tone/i,
    /language/i,
    /collaborat/i,
    /prefer/i,
    /style/i,
    /warm/i,
    /accessible/i
  ];
  const hasComm = commPatterns.some(p => p.test(content));
  if (hasComm) {
    score += 1;
    details.has_communication_preferences = true;
  } else {
    details.has_communication_preferences = false;
  }

  // 8. Has domain vocabulary
  const domainTerms = env.persona.domain_terms || [];
  const foundTerms = domainTerms.filter(term =>
    contentLower.includes(term.toLowerCase())
  );
  details.domain_terms_found = foundTerms;
  if (foundTerms.length > 0) {
    score += 1;
    details.has_domain_vocabulary = true;
  } else {
    details.has_domain_vocabulary = false;
  }

  // 9. Has project structure
  const structurePatterns = [
    /key\s+files/i,
    /project\s+structure/i,
    /directory/i,
    /folder/i,
    /research.notes/i,
    /bibliography/i,
    /drafts?/i
  ];
  const hasStructure = structurePatterns.some(p => p.test(content));
  if (hasStructure) {
    score += 1;
    details.has_project_structure = true;
  } else {
    details.has_project_structure = false;
  }

  // 10. Has active questions or future directions
  const questionPatterns = [
    /\?/,
    /question/i,
    /future\s+direction/i,
    /next\s+step/i,
    /todo/i,
    /\[\s*\]/
  ];
  const hasQuestions = questionPatterns.some(p => p.test(content));
  if (hasQuestions) {
    score += 1;
    details.has_active_questions = true;
  } else {
    details.has_active_questions = false;
  }

  return { score, max: dimRubric.max_score, details };
};
