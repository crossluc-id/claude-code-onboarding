/**
 * research-profile.js — Scores how thoroughly the research profile was filled.
 *
 * Checks field presence, content specificity, and completeness of the profile
 * as it appears in the output directory.
 */

const fs = require('fs');
const path = require('path');

module.exports = function scoreResearchProfile(env, dimRubric) {
  const details = {};
  let score = 0;

  // Look for profile content in multiple locations
  const candidates = [];
  if (env.projectDir) {
    candidates.push(path.join(env.projectDir, 'CLAUDE.md'));
    candidates.push(path.join(env.projectDir, 'RESEARCH-PROFILE.md'));
    candidates.push(path.join(env.projectDir, 'profile.md'));
  }
  if (env.claudeDir) {
    candidates.push(path.join(env.claudeDir, 'CLAUDE.md'));
    candidates.push(path.join(env.claudeDir, 'RESEARCH-PROFILE.md'));
    candidates.push(path.join(env.claudeDir, 'profile.md'));
    candidates.push(path.join(env.claudeDir, 'contexts', 'profile.md'));
    candidates.push(path.join(env.claudeDir, 'references', 'profile.md'));
  }

  // Combine all found content
  let content = '';
  const foundFiles = [];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      content += '\n' + fs.readFileSync(candidate, 'utf8');
      foundFiles.push(candidate);
    }
  }

  details.files_checked = candidates;
  details.files_found = foundFiles;

  // 1. File exists
  if (foundFiles.length > 0) {
    score += 1;
    details.file_exists = true;
  } else {
    details.file_exists = false;
    return { score, max: dimRubric.max_score, details };
  }

  const contentLower = content.toLowerCase();

  // 2. Has name (not placeholder)
  const nameMatch = content.match(/\*?\*?name\*?\*?[:\s]+(.+)/i);
  if (nameMatch) {
    const nameValue = nameMatch[1].trim();
    const isPlaceholder = /\[your|your\s+name|placeholder|tbd|n\/a/i.test(nameValue);
    if (nameValue.length > 1 && !isPlaceholder) {
      score += 1;
      details.has_name = true;
      details.name_value = nameValue.substring(0, 50);
    } else {
      details.has_name = false;
      details.name_value_placeholder = true;
    }
  } else {
    details.has_name = false;
  }

  // 3. Has background with substance
  const bgMatch = content.match(/background[:\s]+(.+?)(?=\n\*?\*?|$)/is);
  if (bgMatch) {
    const bgValue = bgMatch[1].trim();
    if (bgValue.length > 20) {
      score += 1;
      details.has_background = true;
      details.background_length = bgValue.length;
    } else {
      details.has_background = false;
      details.background_too_short = true;
    }
  } else {
    details.has_background = false;
  }

  // 4. Has technical level
  const techMatch = content.match(/technical\s+level[:\s]+(.+)/i);
  if (techMatch && techMatch[1].trim().length > 5) {
    score += 1;
    details.has_technical_level = true;
  } else {
    details.has_technical_level = false;
  }

  // 5. Has goals list (at least one)
  const goalIndicators = content.match(/[-*]\s+.{10,}/g) || [];
  const goalsSection = /goals?/i.test(content);
  if (goalsSection && goalIndicators.length >= 1) {
    score += 1;
    details.has_goals_list = true;
    details.goal_count = goalIndicators.length;
  } else {
    details.has_goals_list = false;
  }

  // 6. Has multiple goals (3+)
  if (goalIndicators.length >= 3) {
    score += 1;
    details.has_multiple_goals = true;
  } else {
    details.has_multiple_goals = false;
  }

  // 7. Has working preferences
  const workPatterns = [
    /how\s+(i|we)\s+want/i,
    /working\s+prefer/i,
    /how\s+i\s+work/i,
    /collaboration/i,
    /work\s+style/i
  ];
  if (workPatterns.some(p => p.test(content))) {
    score += 1;
    details.has_working_preferences = true;
  } else {
    details.has_working_preferences = false;
  }

  // 8. Has current focus
  const focusPatterns = [
    /current\s+focus/i,
    /currently/i,
    /right\s+now/i,
    /working\s+on/i,
    /active/i
  ];
  if (focusPatterns.some(p => p.test(content))) {
    score += 1;
    details.has_current_focus = true;
  } else {
    details.has_current_focus = false;
  }

  // 9. Has future directions
  const futurePatterns = [
    /future/i,
    /direction/i,
    /next\s+step/i,
    /roadmap/i,
    /plan/i,
    /eventually/i,
    /\[\s*[x ]?\s*\]/i
  ];
  if (futurePatterns.some(p => p.test(content))) {
    score += 1;
    details.has_future_directions = true;
  } else {
    details.has_future_directions = false;
  }

  // 10. Specificity score — penalize generic content
  const specificTerms = [
    'hairstyl', 'haircut', 'salon', 'client',
    'math', 'geometry', 'topology', 'fractal', 'ratio',
    'workshop', 'teach', 'framework', 'model',
    'section', 'layer', 'cut', 'curl'
  ];
  const specificCount = specificTerms.filter(t => contentLower.includes(t)).length;
  details.specificity_terms_found = specificCount;
  details.specificity_total_checked = specificTerms.length;

  // Need at least 4 specific terms to score
  if (specificCount >= 4) {
    score += 1;
    details.specificity_score = true;
  } else {
    details.specificity_score = false;
  }

  return { score, max: dimRubric.max_score, details };
};
