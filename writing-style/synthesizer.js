/**
 * Writing Style Synthesizer
 *
 * Takes interview answers (JSON) and produces a style configuration by
 * mapping keywords and choices to register weights and dimension positions.
 *
 * Pure JavaScript heuristics — no LLM calls, no external dependencies.
 *
 * Usage:
 *   node synthesizer.js [answers.json]           # from file
 *   cat answers.json | node synthesizer.js -      # from stdin
 *   node synthesizer.js --preset interdisciplinary-researcher  # load preset
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

const REGISTERS = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'registers.json'), 'utf8')
).registers;

const DIMENSIONS = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'dimensions.json'), 'utf8')
).dimensions;

const REGISTER_IDS = REGISTERS.map(r => r.id);
const DIMENSION_IDS = DIMENSIONS.map(d => d.id);

// ---------------------------------------------------------------------------
// Keyword → Register mapping
// ---------------------------------------------------------------------------

/**
 * Keywords that signal affinity for each register.
 * Weights: strong = 3, moderate = 2, weak = 1
 */
const KEYWORD_REGISTER_MAP = {
  'academic-analytical': {
    strong: ['evidence', 'rigorous', 'citations', 'peer-reviewed', 'methodology', 'hypothesis', 'systematic', 'empirical'],
    moderate: ['research', 'analysis', 'framework', 'literature', 'data', 'findings', 'scholarly'],
    weak: ['careful', 'thorough', 'precise', 'objective']
  },
  'pedagogical': {
    strong: ['teaching', 'scaffolding', 'curriculum', 'learning', 'students', 'explain', 'examples first'],
    moderate: ['tutorial', 'guide', 'step by step', 'understand', 'lesson', 'accessible', 'clarity'],
    weak: ['help', 'show', 'demonstrate', 'walk through']
  },
  'technical-referential': {
    strong: ['documentation', 'specification', 'api', 'reference', 'parameters', 'implementation'],
    moderate: ['technical', 'code', 'system', 'architecture', 'protocol', 'config'],
    weak: ['precise', 'exact', 'detailed', 'procedural']
  },
  'popularizing-explainer': {
    strong: ['analogies', 'accessible', 'general audience', 'simplify', 'eli5', 'layperson'],
    moderate: ['everyday', 'relatable', 'intuitive', 'narrative', 'hooks', 'engaging'],
    weak: ['clear', 'simple', 'interesting', 'fun']
  },
  'corporate-institutional': {
    strong: ['stakeholder', 'brand', 'institutional', 'corporate', 'professional', 'polished'],
    moderate: ['strategic', 'messaging', 'communications', 'pr', 'formal'],
    weak: ['appropriate', 'safe', 'measured', 'diplomatic']
  },
  'consultative-advisory': {
    strong: ['recommendations', 'trade-offs', 'options', 'advisory', 'diagnostic', 'consulting'],
    moderate: ['strategy', 'assessment', 'proposal', 'solution', 'advise'],
    weak: ['suggest', 'consider', 'evaluate', 'weigh']
  },
  'journalistic-reportorial': {
    strong: ['reporting', 'journalism', 'sources', 'investigative', 'news', 'attribution'],
    moderate: ['factual', 'neutral', 'objective', 'coverage', 'feature'],
    weak: ['concise', 'clear', 'direct', 'lead']
  },
  'legal-regulatory': {
    strong: ['legal', 'regulatory', 'compliance', 'contract', 'terms', 'policy'],
    moderate: ['precise', 'exhaustive', 'binding', 'provisions', 'definitions'],
    weak: ['careful', 'thorough', 'unambiguous']
  },
  'literary-poetic': {
    strong: ['poetic', 'lyrical', 'rhythm', 'imagery', 'figurative', 'aesthetic', 'beautiful'],
    moderate: ['literary', 'prose', 'metaphor', 'compression', 'elegance'],
    weak: ['crafted', 'artful', 'evocative', 'musical']
  },
  'narrative-storytelling': {
    strong: ['storytelling', 'narrative', 'story', 'arc', 'character', 'scene'],
    moderate: ['anecdote', 'memoir', 'case study', 'journey', 'suspense'],
    weak: ['compelling', 'engaging', 'vivid', 'dramatic']
  },
  'design-critical': {
    strong: ['design', 'aesthetic', 'visual', 'spatial', 'material', 'curatorial'],
    moderate: ['form', 'composition', 'texture', 'cultural', 'critique', 'art'],
    weak: ['intentional', 'deliberate', 'considered', 'sensibility']
  },
  'lyrical-reflective': {
    strong: ['reflective', 'meditative', 'introspective', 'personal essay', 'journal'],
    moderate: ['contemplative', 'sensory', 'memory', 'associative', 'intimate'],
    weak: ['quiet', 'thoughtful', 'wondering', 'noticing']
  },
  'advocacy-persuasive': {
    strong: ['persuade', 'advocate', 'call to action', 'campaign', 'mobilize', 'provocative'],
    moderate: ['convince', 'argue', 'passionate', 'urgent', 'values', 'mission'],
    weak: ['important', 'matters', 'change', 'impact']
  },
  'facilitative-workshop': {
    strong: ['workshop', 'facilitation', 'collaborative', 'participatory', 'co-design'],
    moderate: ['invite', 'explore', 'together', 'space', 'process', 'group'],
    weak: ['open', 'inclusive', 'discover', 'build']
  },
  'conversational-collegial': {
    strong: ['conversational', 'informal', 'collegial', 'peer', 'chat', 'casual'],
    moderate: ['friendly', 'warm', 'approachable', 'human', 'natural'],
    weak: ['easy', 'relaxed', 'comfortable', 'real']
  },
  'mentoring-coaching': {
    strong: ['mentoring', 'coaching', 'feedback', 'developmental', 'growth', 'socratic'],
    moderate: ['support', 'challenge', 'guide', 'encourage', 'progress'],
    weak: ['help', 'develop', 'nurture', 'build on']
  },
  'social-thread': {
    strong: ['twitter', 'thread', 'social media', 'viral', 'engagement', 'hook'],
    moderate: ['short form', 'posts', 'scroll', 'shareable', 'hot take'],
    weak: ['punchy', 'quick', 'snappy', 'bite-sized']
  },
  'caption-micro': {
    strong: ['caption', 'instagram', 'hashtag', 'micro', 'thumbnail'],
    moderate: ['visual', 'compressed', 'punchy', 'label'],
    weak: ['short', 'tight', 'impact']
  },
  'newsletter-epistolary': {
    strong: ['newsletter', 'substack', 'epistolary', 'subscriber', 'digest'],
    moderate: ['letter', 'dispatch', 'edition', 'personal update', 'email'],
    weak: ['direct', 'personal', 'regular', 'curated']
  },
  'oral-presentational': {
    strong: ['presentation', 'talk', 'keynote', 'lecture', 'spoken', 'conference'],
    moderate: ['audience', 'speaking', 'deliver', 'stage', 'panel'],
    weak: ['clear', 'engaging', 'pacing', 'signpost']
  },
  'documentation-instructional': {
    strong: ['how-to', 'instructions', 'setup', 'readme', 'tutorial', 'runbook'],
    moderate: ['steps', 'guide', 'walkthrough', 'onboarding', 'install'],
    weak: ['follow', 'do', 'create', 'run']
  },
  'interdisciplinary-bridge': {
    strong: ['interdisciplinary', 'cross-disciplinary', 'bridge', 'translate between', 'both fields'],
    moderate: ['analogies', 'domains', 'cross-pollination', 'connect', 'hybrid'],
    weak: ['between', 'across', 'link', 'combine']
  }
};

// ---------------------------------------------------------------------------
// Writer reference → Register mapping
// ---------------------------------------------------------------------------

/**
 * Known writers/publications and their register signatures.
 * Used to interpret Q14 answers.
 */
const WRITER_REGISTER_MAP = {
  'oliver sacks': { primary: 'narrative-storytelling', secondary: ['popularizing-explainer', 'lyrical-reflective'], dimensions: { warmth: 4, abstraction: 2, playfulness: 3 } },
  'joan didion': { primary: 'lyrical-reflective', secondary: ['journalistic-reportorial', 'narrative-storytelling'], dimensions: { authority: 4, pace: 4, voice_person: 5 } },
  'ursula le guin': { primary: 'literary-poetic', secondary: ['narrative-storytelling', 'pedagogical'], dimensions: { warmth: 4, abstraction: 3.5, playfulness: 3 } },
  'paul graham': { primary: 'conversational-collegial', secondary: ['consultative-advisory', 'pedagogical'], dimensions: { formality: 4, authority: 4, pace: 4 } },
  'maria popova': { primary: 'interdisciplinary-bridge', secondary: ['lyrical-reflective', 'pedagogical'], dimensions: { warmth: 4, abstraction: 3, context_dependence: 3.5 } },
  'nate silver': { primary: 'journalistic-reportorial', secondary: ['academic-analytical', 'popularizing-explainer'], dimensions: { authority: 4, density: 3, abstraction: 3 } },
  'brene brown': { primary: 'mentoring-coaching', secondary: ['narrative-storytelling', 'conversational-collegial'], dimensions: { warmth: 5, voice_person: 5, authority: 3.5 } },
  'the economist': { primary: 'journalistic-reportorial', secondary: ['academic-analytical', 'corporate-institutional'], dimensions: { formality: 2, density: 4, authority: 4 } },
  'wired': { primary: 'popularizing-explainer', secondary: ['narrative-storytelling', 'design-critical'], dimensions: { playfulness: 3.5, pace: 3.5, warmth: 3 } },
  'edward tufte': { primary: 'design-critical', secondary: ['academic-analytical', 'technical-referential'], dimensions: { authority: 5, density: 4, abstraction: 3 } },
  'james baldwin': { primary: 'lyrical-reflective', secondary: ['advocacy-persuasive', 'narrative-storytelling'], dimensions: { warmth: 4, authority: 5, voice_person: 5 } },
  'maggie nelson': { primary: 'lyrical-reflective', secondary: ['academic-analytical', 'interdisciplinary-bridge'], dimensions: { abstraction: 4, voice_person: 5, context_dependence: 4 } },
  'robin wall kimmerer': { primary: 'interdisciplinary-bridge', secondary: ['lyrical-reflective', 'pedagogical'], dimensions: { warmth: 5, abstraction: 2.5, voice_person: 4 } },
  'tim urban': { primary: 'popularizing-explainer', secondary: ['conversational-collegial', 'narrative-storytelling'], dimensions: { playfulness: 5, formality: 5, pace: 3 } },
  'cal newport': { primary: 'consultative-advisory', secondary: ['academic-analytical', 'pedagogical'], dimensions: { authority: 4, structure: 4, density: 3 } },
  'chimamanda ngozi adichie': { primary: 'narrative-storytelling', secondary: ['advocacy-persuasive', 'oral-presentational'], dimensions: { warmth: 4, authority: 4, voice_person: 5 } }
};

// ---------------------------------------------------------------------------
// Q9 choice → signal mapping (imported from interview.yaml logic)
// ---------------------------------------------------------------------------

const Q9_CHOICE_MAP = {
  rigorous: {
    register_boost: ['academic-analytical', 'technical-referential'],
    dimension_nudge: { density: 1, authority: 1 }
  },
  accessible: {
    register_boost: ['popularizing-explainer', 'pedagogical'],
    dimension_nudge: { density: -1, warmth: 0.5 }
  },
  beautiful: {
    register_boost: ['literary-poetic', 'lyrical-reflective'],
    dimension_nudge: { playfulness: 0.5, abstraction: 0.5 }
  },
  practical: {
    register_boost: ['documentation-instructional', 'consultative-advisory'],
    dimension_nudge: { structure: 1, abstraction: -1 }
  },
  provocative: {
    register_boost: ['advocacy-persuasive', 'social-thread'],
    dimension_nudge: { authority: 1, playfulness: 0.5 }
  }
};

// ---------------------------------------------------------------------------
// Q13 purpose → register mapping
// ---------------------------------------------------------------------------

const Q13_PURPOSE_MAP = {
  teach: {
    registers: ['pedagogical', 'popularizing-explainer'],
    dimension_nudge: { warmth: 0.5, structure: 0.5 }
  },
  persuade: {
    registers: ['advocacy-persuasive', 'consultative-advisory'],
    dimension_nudge: { authority: 0.5, warmth: 0.5 }
  },
  document: {
    registers: ['documentation-instructional', 'technical-referential'],
    dimension_nudge: { structure: 1, formality: -0.5 }
  },
  express: {
    registers: ['lyrical-reflective', 'narrative-storytelling'],
    dimension_nudge: { voice_person: 1, playfulness: 0.5 }
  }
};

// ---------------------------------------------------------------------------
// "Not" constraint templates
// ---------------------------------------------------------------------------

const NOT_CONSTRAINT_TEMPLATES = {
  formality: {
    // Scale: 1=Frozen/Formal, 5=Casual/Intimate — high value = casual user
    high: { positive: 'casual', excess: 'sloppy or unprofessional' },
    low: { positive: 'formal', excess: 'stiff or bureaucratic' }
  },
  density: {
    high: { positive: 'dense and thorough', excess: 'impenetrable' },
    low: { positive: 'accessible', excess: 'oversimplified' }
  },
  warmth: {
    high: { positive: 'warm', excess: 'gushing or sentimental' },
    low: { positive: 'analytical', excess: 'cold or dismissive' }
  },
  pace: {
    high: { positive: 'concise', excess: 'curt or cryptic' },
    low: { positive: 'expansive', excess: 'meandering or padded' }
  },
  structure: {
    high: { positive: 'structured and scannable', excess: 'fragmented or list-obsessed' },
    low: { positive: 'flowing', excess: 'wall-of-text' }
  },
  voice_person: {
    high: { positive: 'personal and direct', excess: 'self-absorbed' },
    low: { positive: 'objective', excess: 'invisible or evasive' }
  },
  authority: {
    high: { positive: 'authoritative', excess: 'arrogant or dogmatic' },
    low: { positive: 'exploratory', excess: 'wishy-washy or uncommitted' }
  },
  abstraction: {
    high: { positive: 'conceptual', excess: 'untethered from reality' },
    low: { positive: 'concrete and grounded', excess: 'unable to generalize' }
  },
  playfulness: {
    high: { positive: 'playful', excess: 'flippant or try-hard' },
    low: { positive: 'serious', excess: 'humorless or grim' }
  },
  context_dependence: {
    high: { positive: 'allusive and layered', excess: 'exclusionary or opaque' },
    low: { positive: 'self-contained', excess: 'over-explaining the obvious' }
  }
};

// ---------------------------------------------------------------------------
// Core synthesis engine
// ---------------------------------------------------------------------------

class StyleSynthesizer {
  constructor() {
    this.registerWeights = {};
    this.dimensionValues = {};
    this.antiRegisters = new Set();
    this.contextSwitches = {};
    this.rawSignals = [];

    // Initialize weights and dimensions
    REGISTER_IDS.forEach(id => { this.registerWeights[id] = 0; });
    DIMENSION_IDS.forEach(id => { this.dimensionValues[id] = 3; }); // baseline = 3
  }

  /**
   * Main entry: synthesize a style config from interview answers.
   * @param {object} answers - Keys q1..q14, optional writing_samples and selected_preset
   * @returns {object} Complete style configuration
   */
  synthesize(answers) {
    // If a preset is selected, load it as the base
    if (answers.selected_preset) {
      return this._loadPreset(answers.selected_preset);
    }

    // Phase 1: Discover
    if (answers.q1) this._processOpenText(answers.q1, 'q1', 2.0);
    if (answers.q2) this._processExplanatoryStyle(answers.q2);
    if (answers.q3) this._processWritingSample(answers.q3);
    if (answers.q4) this._processAntiPreferences(answers.q4);

    // Phase 2: Diagnose
    if (answers.q5 !== undefined) this._processSpectrum(answers.q5, 'q5');
    if (answers.q6 !== undefined) this._processSpectrum(answers.q6, 'q6');
    if (answers.q7 !== undefined) this._processSpectrum(answers.q7, 'q7');
    if (answers.q8 !== undefined) this._processSpectrum(answers.q8, 'q8');
    if (answers.q9) this._processQ9Choices(answers.q9);
    if (answers.q10 !== undefined) this._processSpectrum(answers.q10, 'q10');

    // Phase 3: Differentiate
    if (answers.q11) this._processAudiences(answers.q11);
    if (answers.q12 !== undefined) this._processSpectrum(answers.q12, 'q12');
    if (answers.q13) this._processProportions(answers.q13);
    if (answers.q14) this._processWriterReference(answers.q14);

    // Writing sample direct analysis (if provided as paths)
    if (answers.writing_samples && Array.isArray(answers.writing_samples)) {
      const baseDir = process.cwd();
      answers.writing_samples.forEach(samplePath => {
        try {
          // Sanitize: resolve and reject paths that escape the working directory
          const resolved = path.resolve(baseDir, samplePath);
          if (!resolved.startsWith(baseDir)) {
            process.stderr.write(`[warn] Skipping path outside working directory: ${samplePath}\n`);
            return;
          }
          const content = fs.readFileSync(resolved, 'utf8');
          this._processWritingSample(content);
        } catch (err) {
          if (err.code === 'ENOENT') {
            process.stderr.write(`[warn] Writing sample not found: ${samplePath}\n`);
          } else {
            process.stderr.write(`[warn] Error reading writing sample ${samplePath}: ${err.message}\n`);
          }
        }
      });
    }

    return this._compile();
  }

  // -------------------------------------------------------------------------
  // Phase 1 processors
  // -------------------------------------------------------------------------

  _processOpenText(text, questionId, weight = 1.0) {
    const lower = text.toLowerCase();

    for (const [registerId, keywords] of Object.entries(KEYWORD_REGISTER_MAP)) {
      let score = 0;
      keywords.strong.forEach(kw => {
        if (lower.includes(kw)) score += 3;
      });
      keywords.moderate.forEach(kw => {
        if (lower.includes(kw)) score += 2;
      });
      keywords.weak.forEach(kw => {
        if (lower.includes(kw)) score += 1;
      });

      this.registerWeights[registerId] += score * weight;
    }

    this.rawSignals.push({ question: questionId, text, type: 'open_text' });
  }

  _processExplanatoryStyle(text) {
    const lower = text.toLowerCase();

    // Analogies → popularizing-explainer, interdisciplinary-bridge
    if (lower.includes('analog') || lower.includes('metaphor') || lower.includes('like a')) {
      this.registerWeights['popularizing-explainer'] += 4;
      this.registerWeights['interdisciplinary-bridge'] += 3;
      this.dimensionValues.abstraction -= 0.3;
    }

    // Diagrams / visuals → design-critical, technical-referential
    if (lower.includes('diagram') || lower.includes('visual') || lower.includes('draw') || lower.includes('sketch')) {
      this.registerWeights['design-critical'] += 3;
      this.registerWeights['technical-referential'] += 2;
      this.dimensionValues.structure += 0.3;
    }

    // Stories → narrative-storytelling
    if (lower.includes('stor') || lower.includes('anecdot') || lower.includes('example')) {
      this.registerWeights['narrative-storytelling'] += 4;
      this.registerWeights['pedagogical'] += 2;
      this.dimensionValues.warmth += 0.3;
    }

    // Step-by-step → pedagogical, documentation-instructional
    if (lower.includes('step') || lower.includes('walk through') || lower.includes('break it down')) {
      this.registerWeights['pedagogical'] += 4;
      this.registerWeights['documentation-instructional'] += 2;
      this.dimensionValues.structure += 0.3;
    }

    this._processOpenText(text, 'q2', 1.0);
  }

  _processWritingSample(text) {
    if (!text || typeof text !== 'string') return;

    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const paragraphs = text.split(/\n\n+/).filter(Boolean);

    if (words.length === 0 || sentences.length === 0) return;

    const avgSentenceLength = words.length / sentences.length;
    const avgParaLength = sentences.length / Math.max(paragraphs.length, 1);

    // Density: long sentences = denser
    if (avgSentenceLength > 25) this.dimensionValues.density += 0.5;
    else if (avgSentenceLength < 12) this.dimensionValues.density -= 0.5;

    // Pace: short paragraphs = faster pace
    if (avgParaLength < 3) this.dimensionValues.pace += 0.3;
    else if (avgParaLength > 6) this.dimensionValues.pace -= 0.3;

    // Structure: check for bullets, headers
    const bulletCount = (text.match(/^[-*]\s/gm) || []).length;
    const headerCount = (text.match(/^#+\s/gm) || []).length;
    if (bulletCount > 3 || headerCount > 2) this.dimensionValues.structure += 0.5;

    // Voice person: I/we usage
    const firstPersonCount = (text.match(/\b(I|my|me|we|our|us)\b/gi) || []).length;
    const firstPersonDensity = firstPersonCount / words.length;
    if (firstPersonDensity > 0.03) this.dimensionValues.voice_person += 0.5;
    else if (firstPersonDensity < 0.005) this.dimensionValues.voice_person -= 0.5;

    // Formality: contractions = less formal
    const contractionCount = (text.match(/\b\w+'\w+\b/g) || []).length;
    const contractionDensity = contractionCount / words.length;
    if (contractionDensity > 0.02) this.dimensionValues.formality += 0.5;
    else if (contractionDensity < 0.005) this.dimensionValues.formality -= 0.3;

    // Warmth: emotional/empathetic language
    const warmWords = ['feel', 'care', 'love', 'heart', 'hope', 'believe', 'imagine', 'together', 'share', 'grateful'];
    const warmCount = warmWords.reduce((acc, w) => acc + (text.match(new RegExp(`\\b${w}\\b`, 'gi')) || []).length, 0);
    if (warmCount > 3) this.dimensionValues.warmth += 0.5;

    // Also run keyword analysis on the sample
    this._processOpenText(text, 'q3_sample', 0.5);

    this.rawSignals.push({ question: 'q3', type: 'writing_sample', wordCount: words.length, avgSentenceLength });
  }

  _processAntiPreferences(text) {
    const lower = text.toLowerCase();

    // Negation guard: skip keywords near negation words ("not", "don't", "except", "no", "isn't")
    const negationPatterns = /\b(not|don'?t|doesn'?t|isn'?t|aren'?t|no|never|except|unlike|actually like|actually enjoy)\b/g;

    const isNegated = (keyword) => {
      // Check if keyword appears within 8 words of a negation
      const kwIdx = lower.indexOf(keyword);
      if (kwIdx === -1) return false;
      const windowStart = Math.max(0, kwIdx - 60);
      const windowEnd = Math.min(lower.length, kwIdx + keyword.length + 60);
      const window = lower.substring(windowStart, windowEnd);
      return negationPatterns.test(window);
    };

    // Check for register keywords in negative context
    for (const [registerId, keywords] of Object.entries(KEYWORD_REGISTER_MAP)) {
      let antiScore = 0;
      [...keywords.strong, ...keywords.moderate].forEach(kw => {
        if (lower.includes(kw) && !isNegated(kw)) antiScore += 2;
      });
      // Reset regex lastIndex after each register
      negationPatterns.lastIndex = 0;

      if (antiScore > 0) {
        this.antiRegisters.add(registerId);
        this.registerWeights[registerId] -= antiScore * 2;
      }
    }

    // Common anti-patterns (with negation guard)
    const hasAnti = (kw) => lower.includes(kw) && !isNegated(kw);
    negationPatterns.lastIndex = 0;

    if (hasAnti('corporate') || hasAnti('jargon') || hasAnti('buzzword')) {
      this.antiRegisters.add('corporate-institutional');
      this.registerWeights['corporate-institutional'] -= 8;
    }
    if (hasAnti('pretentious') || hasAnti('ivory tower')) {
      this.antiRegisters.add('academic-analytical');
      this.registerWeights['academic-analytical'] -= 6;
      this.dimensionValues.formality += 0.5;
    }
    if (lower.includes('dry') || lower.includes('boring') || lower.includes('lifeless')) {
      this.dimensionValues.warmth += 0.5;
      this.dimensionValues.playfulness += 0.3;
    }
    if (lower.includes('clickbait') || lower.includes('hype') || lower.includes('sensational')) {
      this.antiRegisters.add('social-thread');
      this.dimensionValues.authority -= 0.3;
    }
    if (lower.includes('condescending') || lower.includes('patronizing')) {
      this.dimensionValues.authority -= 0.3;
      this.dimensionValues.warmth += 0.3;
    }
    if (lower.includes('rambling') || lower.includes('verbose') || lower.includes('wordy')) {
      this.dimensionValues.pace += 0.5;
    }

    this.rawSignals.push({ question: 'q4', text, type: 'anti_preferences' });
  }

  // -------------------------------------------------------------------------
  // Phase 2 processors
  // -------------------------------------------------------------------------

  /**
   * Process spectrum answers (1-5 scale or text like "left", "right", "center")
   */
  _processSpectrum(value, questionId) {
    let numericValue;

    if (typeof value === 'number') {
      numericValue = Math.max(1, Math.min(5, value));
    } else if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'left' || lower === 'strongly left') numericValue = 1;
      else if (lower === 'somewhat left' || lower === 'lean left') numericValue = 2;
      else if (lower === 'center' || lower === 'middle' || lower === 'balanced') numericValue = 3;
      else if (lower === 'somewhat right' || lower === 'lean right') numericValue = 4;
      else if (lower === 'right' || lower === 'strongly right') numericValue = 5;
      else numericValue = 3;
    } else {
      return;
    }

    const normalized = (numericValue - 3) / 2; // -1 to +1

    switch (questionId) {
      case 'q5': // Examples-first vs big-picture-first
        this.dimensionValues.abstraction += normalized * 1.5;
        if (numericValue <= 2) {
          this.registerWeights['pedagogical'] += 3;
          this.registerWeights['popularizing-explainer'] += 2;
        } else if (numericValue >= 4) {
          this.registerWeights['academic-analytical'] += 2;
          this.dimensionValues.structure -= 0.3;
        }
        break;

      case 'q6': // Personal voice vs anonymous
        this.dimensionValues.voice_person += normalized * -1.5; // inverted: left = personal
        this.dimensionValues.authority += normalized * -0.5;
        this.dimensionValues.formality += normalized * 1.0;
        break;

      case 'q7': // Over-explain vs under-explain
        this.dimensionValues.density += normalized * 1.0;
        this.dimensionValues.context_dependence += normalized * 1.0;
        this.dimensionValues.pace += normalized * 0.5;
        break;

      case 'q8': // Enthusiastic vs measured
        this.dimensionValues.warmth += normalized * -1.0; // left = enthusiastic = warmer
        this.dimensionValues.formality += normalized * -0.5;
        this.dimensionValues.playfulness += normalized * -0.5;
        break;

      case 'q10': // Paragraphs vs bullets
        this.dimensionValues.structure += normalized * 1.5;
        this.dimensionValues.pace += normalized * 0.5;
        if (numericValue >= 4) {
          this.registerWeights['documentation-instructional'] += 2;
        } else if (numericValue <= 2) {
          this.registerWeights['narrative-storytelling'] += 1;
          this.registerWeights['lyrical-reflective'] += 1;
        }
        break;

      case 'q12': // Code-switch vs consistent
        // Low value = heavy code-switching → more context switches
        // High value = consistent → stronger primary register
        if (numericValue <= 2) {
          this.rawSignals.push({ question: 'q12', value: numericValue, note: 'heavy code-switcher' });
        }
        break;
    }

    this.rawSignals.push({ question: questionId, value: numericValue, type: 'spectrum' });
  }

  _processQ9Choices(choices) {
    const selected = Array.isArray(choices) ? choices : [choices];

    selected.forEach(choice => {
      const mapping = Q9_CHOICE_MAP[choice.toLowerCase()];
      if (!mapping) return;

      mapping.register_boost.forEach(regId => {
        this.registerWeights[regId] += 4;
      });

      Object.entries(mapping.dimension_nudge).forEach(([dim, nudge]) => {
        if (this.dimensionValues[dim] !== undefined) {
          this.dimensionValues[dim] += nudge;
        }
      });
    });

    this.rawSignals.push({ question: 'q9', choices: selected, type: 'multiple_choice' });
  }

  // -------------------------------------------------------------------------
  // Phase 3 processors
  // -------------------------------------------------------------------------

  _processAudiences(text) {
    if (typeof text === 'string') {
      this._processOpenText(text, 'q11', 1.0);
      // Look for context-switch clues
      this._extractContextSwitches(text);
    } else if (typeof text === 'object') {
      // Structured audience input: { audience: voice_description }
      Object.entries(text).forEach(([audience, description]) => {
        this._processOpenText(description, 'q11_' + audience, 0.5);
        this._buildContextSwitch(audience, description);
      });
    }
  }

  _processProportions(input) {
    let proportions;

    if (typeof input === 'string') {
      // Parse text like "50% teach, 30% express, 10% persuade, 10% document"
      proportions = {};
      const matches = input.matchAll(/(\d+)%?\s*(teach|persuade|document|express)/gi);
      for (const match of matches) {
        proportions[match[2].toLowerCase()] = parseInt(match[1]) / 100;
      }
    } else if (typeof input === 'object') {
      proportions = input;
    } else {
      return;
    }

    // Normalize to sum to 1
    const total = Object.values(proportions).reduce((a, b) => a + b, 0);
    if (total === 0) return;

    Object.entries(proportions).forEach(([purpose, proportion]) => {
      const normalized = proportion / total;
      const mapping = Q13_PURPOSE_MAP[purpose];
      if (!mapping) return;

      mapping.registers.forEach(regId => {
        this.registerWeights[regId] += normalized * 6;
      });

      Object.entries(mapping.dimension_nudge).forEach(([dim, nudge]) => {
        if (this.dimensionValues[dim] !== undefined) {
          this.dimensionValues[dim] += nudge * normalized;
        }
      });
    });

    this.rawSignals.push({ question: 'q13', proportions, type: 'proportion' });
  }

  _processWriterReference(text) {
    const lower = text.toLowerCase().trim();

    // Check against known writers
    for (const [writer, profile] of Object.entries(WRITER_REGISTER_MAP)) {
      if (lower.includes(writer)) {
        this.registerWeights[profile.primary] += 5;
        profile.secondary.forEach(regId => {
          this.registerWeights[regId] += 3;
        });

        if (profile.dimensions) {
          Object.entries(profile.dimensions).forEach(([dim, value]) => {
            if (this.dimensionValues[dim] !== undefined) {
              // Blend toward the writer's dimension value
              this.dimensionValues[dim] = (this.dimensionValues[dim] + value) / 2;
            }
          });
        }

        this.rawSignals.push({ question: 'q14', writer, matched: true, type: 'writer_reference' });
        return;
      }
    }

    // No match — process as open text for keyword signals
    this._processOpenText(text, 'q14', 1.5);
    this.rawSignals.push({ question: 'q14', text, matched: false, type: 'writer_reference' });
  }

  // -------------------------------------------------------------------------
  // Context switch extraction
  // -------------------------------------------------------------------------

  _extractContextSwitches(text) {
    const contextKeywords = {
      'workshop': 'workshops',
      'class': 'workshops',
      'teaching': 'workshops',
      'blog': 'blog_posts',
      'article': 'blog_posts',
      'post': 'blog_posts',
      'paper': 'publications',
      'journal': 'publications',
      'academic': 'publications',
      'publication': 'publications',
      'social': 'social_media',
      'twitter': 'social_media',
      'instagram': 'social_media',
      'linkedin': 'social_media',
      'email': 'emails',
      'talk': 'conference_talks',
      'conference': 'conference_talks',
      'presentation': 'conference_talks',
      'client': 'client_communications',
      'proposal': 'proposals',
      'grant': 'proposals'
    };

    const lower = text.toLowerCase();
    const detectedContexts = new Set();

    Object.entries(contextKeywords).forEach(([keyword, context]) => {
      if (lower.includes(keyword)) {
        detectedContexts.add(context);
      }
    });

    detectedContexts.forEach(context => {
      if (!this.contextSwitches[context]) {
        this.contextSwitches[context] = { detected: true, description: '' };
      }
    });
  }

  _buildContextSwitch(audience, description) {
    const miniSynth = new StyleSynthesizer();
    miniSynth._processOpenText(description, 'context', 2.0);

    const sorted = Object.entries(miniSynth.registerWeights)
      .sort(([, a], [, b]) => b - a)
      .filter(([, weight]) => weight > 0);

    if (sorted.length > 0) {
      this.contextSwitches[audience] = {
        primary: sorted[0][0],
        modifiers: {}
      };
    }
  }

  // -------------------------------------------------------------------------
  // Compilation
  // -------------------------------------------------------------------------

  _compile() {
    // Clamp dimensions to [1, 5]
    DIMENSION_IDS.forEach(dim => {
      this.dimensionValues[dim] = Math.max(1, Math.min(5,
        Math.round(this.dimensionValues[dim] * 2) / 2 // round to nearest 0.5
      ));
    });

    // Sort registers by weight, exclude anti-registers for primary/secondary
    const sortedRegisters = Object.entries(this.registerWeights)
      .sort(([, a], [, b]) => b - a)
      .filter(([, weight]) => weight > 0);

    const nonAntiRegisters = sortedRegisters.filter(([id]) => !this.antiRegisters.has(id));

    // Select primary (highest non-anti)
    const primary = nonAntiRegisters.length > 0
      ? nonAntiRegisters[0][0]
      : 'conversational-collegial'; // safe default

    // Select secondaries (next 1-2 from different families when possible)
    const primaryFamily = REGISTERS.find(r => r.id === primary)?.family;
    const secondaryCandidates = nonAntiRegisters
      .slice(1)
      .filter(([id]) => id !== primary);

    const secondary = [];
    const usedFamilies = new Set([primaryFamily]);

    // First pass: prefer different families
    for (const [id] of secondaryCandidates) {
      if (secondary.length >= 2) break;
      const family = REGISTERS.find(r => r.id === id)?.family;
      if (!usedFamilies.has(family)) {
        secondary.push(id);
        usedFamilies.add(family);
      }
    }

    // Second pass: fill remaining slots from any family
    for (const [id] of secondaryCandidates) {
      if (secondary.length >= 2) break;
      if (!secondary.includes(id)) {
        secondary.push(id);
      }
    }

    // Select accents (next after secondaries, moderate weight)
    const accents = secondaryCandidates
      .map(([id]) => id)
      .filter(id => !secondary.includes(id))
      .slice(0, 2);

    // Generate "not" constraints
    const notConstraints = this._generateNotConstraints();

    // Build context switches with register assignments
    const contextSwitchConfigs = this._buildContextSwitchConfigs(primary, secondary);

    // Build the blending config
    const blending = {
      primary_modifier: {
        description: 'Base register with dimension adjustments',
        base: primary,
        modifiers: { ...this.dimensionValues }
      },
      context_switching: {
        description: 'Different registers for different writing contexts',
        contexts: contextSwitchConfigs
      },
      not_constraints: {
        description: 'Auto-generated guardrails from dimension positions',
        constraints: notConstraints
      }
    };

    return {
      _meta: {
        version: '1.0.0',
        generated: new Date().toISOString(),
        description: 'Synthesized writing style configuration'
      },
      primary_register: primary,
      secondary_registers: secondary,
      accent_registers: accents,
      anti_registers: Array.from(this.antiRegisters),
      dimensions: { ...this.dimensionValues },
      not_constraints: notConstraints,
      context_switches: contextSwitchConfigs,
      blending,
      _debug: {
        register_weights: Object.fromEntries(
          Object.entries(this.registerWeights)
            .sort(([, a], [, b]) => b - a)
            .filter(([, w]) => w !== 0)
        ),
        signals_processed: this.rawSignals.length
      }
    };
  }

  _generateNotConstraints() {
    const constraints = [];

    DIMENSION_IDS.forEach(dim => {
      const value = this.dimensionValues[dim];
      const template = NOT_CONSTRAINT_TEMPLATES[dim];
      if (!template) return;

      if (value >= 3.5) {
        constraints.push(`${template.high.positive} but not ${template.high.excess}`);
      } else if (value <= 2.5) {
        constraints.push(`${template.low.positive} but not ${template.low.excess}`);
      }
    });

    return constraints;
  }

  _buildContextSwitchConfigs(primary, secondary) {
    const configs = {};

    // Default context mappings based on detected contexts
    const contextRegisterDefaults = {
      workshops: {
        primary: 'facilitative-workshop',
        fallback_dimensions: { warmth: 4, structure: 4, voice_person: 4, formality: 3.5 }
      },
      blog_posts: {
        primary: 'interdisciplinary-bridge',
        fallback_dimensions: { warmth: 3.5, pace: 3, voice_person: 4, formality: 3.5 }
      },
      publications: {
        primary: 'academic-analytical',
        fallback_dimensions: { formality: 2, density: 4, authority: 4, voice_person: 2 }
      },
      social_media: {
        primary: 'conversational-collegial',
        fallback_dimensions: { formality: 4, pace: 4.5, warmth: 4, playfulness: 3.5 }
      },
      conference_talks: {
        primary: 'oral-presentational',
        fallback_dimensions: { pace: 3.5, structure: 3, voice_person: 4, warmth: 3.5 }
      },
      emails: {
        primary: 'conversational-collegial',
        fallback_dimensions: { formality: 3.5, pace: 4, warmth: 3.5 }
      },
      client_communications: {
        primary: 'consultative-advisory',
        fallback_dimensions: { formality: 2.5, authority: 3.5, warmth: 3 }
      },
      proposals: {
        primary: 'consultative-advisory',
        fallback_dimensions: { formality: 2, authority: 4, density: 3.5 }
      }
    };

    // Build configs for detected contexts
    Object.keys(this.contextSwitches).forEach(context => {
      const defaults = contextRegisterDefaults[context];
      if (!defaults) return;

      configs[context] = {
        primary: defaults.primary,
        modifiers: { ...defaults.fallback_dimensions }
      };
    });

    // If no contexts were detected, provide sensible defaults
    if (Object.keys(configs).length === 0) {
      // Always provide at least a few context switches
      ['blog_posts', 'social_media', 'emails'].forEach(context => {
        const defaults = contextRegisterDefaults[context];
        if (defaults) {
          configs[context] = {
            primary: defaults.primary,
            modifiers: { ...defaults.fallback_dimensions }
          };
        }
      });
    }

    return configs;
  }

  // -------------------------------------------------------------------------
  // Preset loading
  // -------------------------------------------------------------------------

  _loadPreset(presetName) {
    const presetPath = path.join(__dirname, 'presets', `${presetName}.json`);
    try {
      return JSON.parse(fs.readFileSync(presetPath, 'utf8'));
    } catch (e) {
      throw new Error(`Preset not found: ${presetName} (looked in ${presetPath})`);
    }
  }
}

// ---------------------------------------------------------------------------
// CLI interface
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage:');
    console.error('  node synthesizer.js <answers.json>');
    console.error('  cat answers.json | node synthesizer.js -');
    console.error('  node synthesizer.js --preset <preset-name>');
    process.exit(1);
  }

  // Handle --preset flag
  if (args[0] === '--preset') {
    const presetName = args[1];
    if (!presetName) {
      console.error('Error: --preset requires a preset name');
      process.exit(1);
    }
    const synthesizer = new StyleSynthesizer();
    const result = synthesizer.synthesize({ selected_preset: presetName });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Handle stdin
  if (args[0] === '-') {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => {
      try {
        const answers = JSON.parse(data);
        const synthesizer = new StyleSynthesizer();
        const result = synthesizer.synthesize(answers);
        console.log(JSON.stringify(result, null, 2));
      } catch (e) {
        console.error('Error parsing input:', e.message);
        process.exit(1);
      }
    });
    return;
  }

  // Handle file input
  try {
    const data = fs.readFileSync(args[0], 'utf8');
    const answers = JSON.parse(data);
    const synthesizer = new StyleSynthesizer();
    const result = synthesizer.synthesize(answers);
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = { StyleSynthesizer };

// Run CLI if invoked directly
if (require.main === module) {
  main();
}
