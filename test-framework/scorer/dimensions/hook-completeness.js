/**
 * hook-completeness.js — Scores whether hooks and settings are properly configured.
 *
 * Checks settings.json validity, hook presence, and absence of placeholder values.
 */

const fs = require('fs');
const path = require('path');

module.exports = function scoreHookCompleteness(env, dimRubric) {
  const details = {};
  let score = 0;

  const settingsPath = env.claudeDir
    ? path.join(env.claudeDir, 'settings.json')
    : null;

  // 1. settings.json exists
  if (settingsPath && fs.existsSync(settingsPath)) {
    score += 1;
    details.settings_file_exists = true;
  } else {
    details.settings_file_exists = false;
    return { score, max: dimRubric.max_score, details };
  }

  // 2. settings.json is valid JSON (2 points)
  let settings = null;
  const rawContent = fs.readFileSync(settingsPath, 'utf8');
  try {
    settings = JSON.parse(rawContent);
    score += 2;
    details.settings_valid_json = true;
  } catch (err) {
    details.settings_valid_json = false;
    details.json_error = err.message;
    return { score, max: dimRubric.max_score, details };
  }

  // 3. Has permissions section
  if (settings.permissions && typeof settings.permissions === 'object') {
    score += 1;
    details.has_permissions = true;
    details.permission_allow_count = Array.isArray(settings.permissions.allow)
      ? settings.permissions.allow.length
      : 0;
  } else {
    details.has_permissions = false;
  }

  // 4. Has hooks section
  if (settings.hooks && typeof settings.hooks === 'object') {
    score += 1;
    details.has_hooks_section = true;
    details.hook_event_types = Object.keys(settings.hooks);
  } else {
    details.has_hooks_section = false;
    // Can't check individual hooks without hooks section
    details.has_session_start_hook = false;
    details.has_pre_tool_use_hook = false;
    details.has_post_tool_use_hook = false;
    return { score, max: dimRubric.max_score, details };
  }

  // 5. Has SessionStart hook
  if (settings.hooks.SessionStart && Array.isArray(settings.hooks.SessionStart) &&
      settings.hooks.SessionStart.length > 0) {
    score += 1;
    details.has_session_start_hook = true;
  } else {
    details.has_session_start_hook = false;
  }

  // 6. Has PreToolUse hook
  if (settings.hooks.PreToolUse && Array.isArray(settings.hooks.PreToolUse) &&
      settings.hooks.PreToolUse.length > 0) {
    score += 1;
    details.has_pre_tool_use_hook = true;
  } else {
    details.has_pre_tool_use_hook = false;
  }

  // 7. Has PostToolUse hook
  if (settings.hooks.PostToolUse && Array.isArray(settings.hooks.PostToolUse) &&
      settings.hooks.PostToolUse.length > 0) {
    score += 1;
    details.has_post_tool_use_hook = true;
  } else {
    details.has_post_tool_use_hook = false;
  }

  // 8. No placeholder values
  const placeholderPatterns = [
    /\[YOUR[_-]/i,
    /\[REPLACE/i,
    /\[INSERT/i,
    /your-.*-here/i,
    /placeholder/i,
    /TODO/,
    /CHANGEME/i,
    /xxx/i
  ];

  const hasPlaceholders = placeholderPatterns.some(p => p.test(rawContent));
  if (!hasPlaceholders) {
    score += 1;
    details.no_placeholder_values = true;
  } else {
    details.no_placeholder_values = false;
    details.placeholder_warning = 'Found placeholder-like values in settings.json';
  }

  // 9. Referenced hook files actually exist
  const hookRefs = extractHookPaths(settings);
  details.hook_references = hookRefs;

  if (hookRefs.length === 0) {
    // No hook file references to check — score based on hooks being configured
    score += 1;
    details.hook_files_exist = true;
    details.hook_files_note = 'No file references to verify';
  } else {
    const hooksDir = path.join(env.claudeDir, 'hooks');
    let allExist = true;
    const fileResults = {};

    for (const ref of hookRefs) {
      // Resolve ~ paths relative to the test environment
      const resolved = ref.replace(/^~\/\.claude\//, env.claudeDir + '/');
      const resolvedAlt = ref.replace(/^\$HOME\/\.claude\//, env.claudeDir + '/');
      const exists = fs.existsSync(resolved) || fs.existsSync(resolvedAlt);
      fileResults[ref] = exists;
      if (!exists) allExist = false;
    }

    if (allExist) {
      score += 1;
      details.hook_files_exist = true;
    } else {
      details.hook_files_exist = false;
    }
    details.hook_file_check = fileResults;
  }

  return { score, max: dimRubric.max_score, details };
};

/**
 * Extract file paths referenced in hook commands.
 */
function extractHookPaths(settings) {
  const paths = [];
  if (!settings.hooks) return paths;

  for (const [eventType, hookArrays] of Object.entries(settings.hooks)) {
    if (!Array.isArray(hookArrays)) continue;
    for (const hookGroup of hookArrays) {
      if (!hookGroup.hooks || !Array.isArray(hookGroup.hooks)) continue;
      for (const hook of hookGroup.hooks) {
        if (hook.command) {
          // Extract paths from commands like "bash ~/.claude/hooks/foo.sh"
          // or "node \"$HOME/.claude/hooks/bar.js\""
          const match = hook.command.match(/[~$](?:HOME)?\/\.claude\/hooks\/[\w.-]+/);
          if (match) {
            paths.push(match[0]);
          }
        }
      }
    }
  }
  return [...new Set(paths)];
}
