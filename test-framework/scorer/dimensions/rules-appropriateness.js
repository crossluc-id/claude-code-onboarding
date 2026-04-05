/**
 * rules-appropriateness.js — Scores whether rules are present and customized.
 *
 * Checks the rules directory for file count, compares against template checksums,
 * and looks for domain-specific customization.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

module.exports = function scoreRulesAppropriateness(env, dimRubric) {
  const details = {};
  let score = 0;

  const rulesDir = env.claudeDir
    ? path.join(env.claudeDir, 'rules')
    : null;

  // 1. Rules directory exists
  if (rulesDir && fs.existsSync(rulesDir)) {
    score += 1;
    details.rules_dir_exists = true;
  } else {
    details.rules_dir_exists = false;
    return { score, max: dimRubric.max_score, details };
  }

  // List rule files
  const ruleFiles = fs.readdirSync(rulesDir)
    .filter(f => f.endsWith('.md'))
    .sort();
  details.rule_files = ruleFiles;
  details.rule_count = ruleFiles.length;

  // 2. Has at least one rule file
  if (ruleFiles.length >= 1) {
    score += 1;
    details.has_rule_files = true;
  } else {
    details.has_rule_files = false;
    return { score, max: dimRubric.max_score, details };
  }

  // 3. Three or more rule files
  if (ruleFiles.length >= 3) {
    score += 1;
    details.rules_count_3plus = true;
  } else {
    details.rules_count_3plus = false;
  }

  // 4. Five or more rule files
  if (ruleFiles.length >= 5) {
    score += 1;
    details.rules_count_5plus = true;
  } else {
    details.rules_count_5plus = false;
  }

  // 5-6. Not identical to template (2 points)
  // Compute checksums of template rules from the onboarding kit
  const onboardingRulesDir = path.resolve(__dirname, '..', '..', '..', 'rules');
  const templateChecksums = {};
  if (fs.existsSync(onboardingRulesDir)) {
    const templateFiles = fs.readdirSync(onboardingRulesDir).filter(f => f.endsWith('.md'));
    for (const f of templateFiles) {
      const content = fs.readFileSync(path.join(onboardingRulesDir, f), 'utf8');
      templateChecksums[f] = crypto.createHash('md5').update(content).digest('hex');
    }
  }

  // Compare each rule file against template
  let modifiedCount = 0;
  let newCount = 0;
  const comparisonResults = {};

  for (const f of ruleFiles) {
    const content = fs.readFileSync(path.join(rulesDir, f), 'utf8');
    const checksum = crypto.createHash('md5').update(content).digest('hex');

    if (templateChecksums[f]) {
      if (checksum !== templateChecksums[f]) {
        modifiedCount++;
        comparisonResults[f] = 'modified';
      } else {
        comparisonResults[f] = 'identical';
      }
    } else {
      newCount++;
      comparisonResults[f] = 'new';
    }
  }

  details.template_comparison = comparisonResults;
  details.modified_count = modifiedCount;
  details.new_count = newCount;

  if (modifiedCount > 0 || newCount > 0) {
    score += 2;
    details.not_identical_to_template = true;
  } else {
    details.not_identical_to_template = false;
  }

  // 7. Has domain-specific rules
  const allRulesContent = ruleFiles
    .map(f => fs.readFileSync(path.join(rulesDir, f), 'utf8'))
    .join('\n')
    .toLowerCase();

  const domainTerms = env.persona.domain_terms || [];
  const foundDomainTerms = domainTerms.filter(t =>
    allRulesContent.includes(t.toLowerCase())
  );

  if (foundDomainTerms.length > 0) {
    score += 1;
    details.has_domain_rules = true;
    details.domain_terms_in_rules = foundDomainTerms;
  } else {
    details.has_domain_rules = false;
  }

  // 8. Has research methodology rules
  const researchPatterns = [
    /research/i,
    /citation/i,
    /source/i,
    /literature/i,
    /bibliograph/i,
    /evidence/i
  ];
  if (researchPatterns.some(p => p.test(allRulesContent))) {
    score += 1;
    details.has_research_rules = true;
  } else {
    details.has_research_rules = false;
  }

  // 9. Has communication style rules
  const commPatterns = [
    /communicat/i,
    /tone/i,
    /voice/i,
    /language/i,
    /writing\s+style/i,
    /warm/i,
    /accessible/i,
    /interdisciplinary/i
  ];
  if (commPatterns.some(p => p.test(allRulesContent))) {
    score += 1;
    details.has_communication_rules = true;
  } else {
    details.has_communication_rules = false;
  }

  // 10. Rules reference persona-specific concepts
  const personaName = (env.persona.name || '').toLowerCase();
  const frameworkName = (env.persona.framework_name || '').toLowerCase();
  const personaPatterns = [personaName, frameworkName].filter(Boolean);

  const referencesPersona = personaPatterns.some(p =>
    p.length > 2 && allRulesContent.includes(p)
  );

  if (referencesPersona) {
    score += 1;
    details.rules_reference_persona = true;
  } else {
    details.rules_reference_persona = false;
  }

  return { score, max: dimRubric.max_score, details };
};
