#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const blogDir = path.join(root, "blog");
const baseUrl = process.env.AUTO_BLOG_BASE_URL || "https://josetteperrone.com";

const args = parseArgs(process.argv.slice(2));
const publish = Boolean(args.publish);
const dryRun = Boolean(args["dry-run"]) || !publish;
const noAi = Boolean(args["no-ai"]);
const requireAi = Boolean(args["require-ai"]);
const date = args.date || isoDate(new Date());
const categoryOverride = args.category;
const titleOverride = args.title || args.topic;
const focusOverride = args.focus;
const source = args.source || "auto-blog";

const articlesPath = path.join(blogDir, "articles.json");
const editorialIndexPath = path.join(blogDir, "editorial-index.json");
const feedPath = path.join(blogDir, "daily-field-notes.html");
const blogIndexPath = path.join(blogDir, "index.html");
const logPath = path.join(blogDir, "auto-blog-log.json");

const categoryProfiles = {
  "Healthcare Worker Safety": {
    description:
      "Workplace safety, violence prevention, reporting culture, and the daily conditions that help nurses deliver safer care.",
    audience: "nurses, charge nurses, clinical leaders, and staff-development teams",
    tags: ["worker safety", "safety culture", "nursing teams"],
    references: [
      {
        label: "OSHA: Guidelines for Preventing Workplace Violence for Healthcare and Social Service Workers",
        url: "https://www.osha.gov/sites/default/files/publications/osha3148.pdf",
      },
      {
        label: "CDC/NIOSH: About Healthcare Workers",
        url: "https://www.cdc.gov/niosh/healthcare/about/index.html",
      },
      {
        label: "AHRQ: TeamSTEPPS 3.0",
        url: "https://www.ahrq.gov/teamstepps-program/index.html",
      },
    ],
    seeds: [
      ["When Safety Concerns Sound Like Small Complaints", "treating repeated friction as early safety data"],
      ["The Unit Habits That Make Escalation Easier", "building shared expectations before pressure rises"],
      ["Why Safety Follow-Through Builds Trust", "closing the loop after nurses report concerns"],
      ["The Quiet Risk of Always Working Around the Problem", "recognizing workarounds that should not become normal"],
      ["How Leaders Can Hear Safety Signals Earlier", "listening for patterns before an event forces attention"],
    ],
  },
  "Burnout and Resilience": {
    description:
      "Nurse burnout, recovery, moral distress, and resilience practices that pair human support with operational change.",
    audience: "nurses, educators, managers, and healthcare leaders",
    tags: ["nurse burnout", "resilience", "clinician well-being"],
    references: [
      {
        label: "U.S. Surgeon General: Addressing Health Worker Burnout",
        url: "https://www.hhs.gov/surgeongeneral/reports-and-publications/health-worker-burnout/index.html",
      },
      {
        label: "National Academy of Medicine: Clinician Resilience and Well-Being",
        url: "https://nam.edu/our-work/programs/clinician-resilience-and-well-being/",
      },
      {
        label: "CDC/NIOSH: About Healthcare Workers",
        url: "https://www.cdc.gov/niosh/healthcare/about/index.html",
      },
    ],
    seeds: [
      ["Why Recovery Cannot Be Left to the Drive Home", "making decompression part of the work system"],
      ["The Difference Between Rest and Repair for Nurses", "understanding what helps after repeated stress"],
      ["When Resilience Language Starts to Sound Like Blame", "keeping support practical and systems-aware"],
      ["How Nurse Leaders Can Notice Emotional Load", "reading burnout signals before disengagement"],
      ["Why Breaks Need Operational Protection", "turning recovery from permission into practice"],
    ],
  },
  "Emergency and Trauma Nursing": {
    description:
      "Emergency nursing, trauma care, high-acuity decision-making, and team readiness under pressure.",
    audience: "emergency nurses, trauma teams, educators, and healthcare leaders",
    tags: ["emergency nursing", "trauma nursing", "high-acuity care"],
    references: [
      {
        label: "AHRQ: TeamSTEPPS 3.0",
        url: "https://www.ahrq.gov/teamstepps-program/index.html",
      },
      {
        label: "OSHA: Guidelines for Preventing Workplace Violence for Healthcare and Social Service Workers",
        url: "https://www.osha.gov/sites/default/files/publications/osha3148.pdf",
      },
      {
        label: "CDC/NIOSH: About Healthcare Workers",
        url: "https://www.cdc.gov/niosh/healthcare/about/index.html",
      },
    ],
    seeds: [
      ["What High-Acuity Teams Need Before the Room Gets Loud", "preparing roles, language, and attention before escalation"],
      ["Why Fast Nursing Decisions Still Need Shared Language", "protecting clarity in urgent clinical moments"],
      ["The Discipline Behind Calm Emergency Care", "how preparation and tone shape team performance"],
      ["How Trauma Nursing Teaches Operational Awareness", "seeing the patient, the room, and the team at once"],
      ["Why After-Action Conversations Matter in Emergency Care", "turning intense cases into team learning"],
    ],
  },
  "Nursing Education": {
    description:
      "Nurse education, clinical judgment, student confidence, simulation, and practical teaching.",
    audience: "nurse educators, preceptors, clinical instructors, and academic leaders",
    tags: ["nursing education", "clinical judgment", "student learning"],
    references: [
      {
        label: "AACN: The Essentials: Core Competencies for Professional Nursing Education",
        url: "https://www.aacnnursing.org/Portals/0/PDFs/Publications/Essentials-2021.pdf",
      },
      {
        label: "QSEN Institute: Pre-Licensure Competencies",
        url: "https://qsen.org/competencies/pre-licensure-ksas/",
      },
      {
        label: "National League for Nursing: Teaching Resources",
        url: "https://www.nln.org/education/training/professional-development-programs/teaching-resources",
      },
    ],
    seeds: [
      ["Why Students Need Practice Naming What They Notice", "building clinical judgment through observation language"],
      ["How Educators Can Make Feedback Feel Usable", "turning critique into a next action students can try"],
      ["The Teaching Value of Slowing Down the First Decision", "helping students understand clinical priorities"],
      ["Why Confidence Needs Structure in Nursing Education", "supporting growth without false reassurance"],
      ["How Simulation Builds More Than Technical Skill", "using scenarios for communication, reflection, and judgment"],
    ],
  },
  "Clinical Communication": {
    description:
      "Communication for nursing teams, educators, and healthcare leaders who need clarity during high-stakes moments.",
    audience: "nurses, educators, charge nurses, leaders, and interdisciplinary teams",
    tags: ["clinical communication", "team communication", "escalation"],
    references: [
      {
        label: "AHRQ: TeamSTEPPS 3.0",
        url: "https://www.ahrq.gov/teamstepps-program/index.html",
      },
      {
        label: "QSEN Institute: Pre-Licensure Competencies",
        url: "https://qsen.org/competencies/pre-licensure-ksas/",
      },
      {
        label: "AACN: The Essentials: Core Competencies for Professional Nursing Education",
        url: "https://www.aacnnursing.org/Portals/0/PDFs/Publications/Essentials-2021.pdf",
      },
    ],
    seeds: [
      ["Why Clear Requests Protect Clinical Teams", "making needs visible before confusion grows"],
      ["The Communication Cost of Hinting in Healthcare", "replacing vague cues with direct professional language"],
      ["How Handoffs Lose Meaning Under Pressure", "protecting shared understanding during transitions"],
      ["Why Tone Changes What Teams Hear", "using calm language without softening urgent concerns"],
      ["How Leaders Can Model Better Questions", "creating communication habits that invite useful information"],
    ],
  },
  "Patient Advocacy": {
    description:
      "Nursing advocacy, patient dignity, family communication, ethics, and speaking up with professionalism.",
    audience: "nurses, students, educators, and clinical leaders",
    tags: ["patient advocacy", "ethics", "family communication"],
    references: [
      {
        label: "American Nurses Association: Code of Ethics for Nurses",
        url: "https://codeofethics.ana.org/home",
      },
      {
        label: "QSEN Institute: Pre-Licensure Competencies",
        url: "https://qsen.org/competencies/pre-licensure-ksas/",
      },
      {
        label: "AHRQ: TeamSTEPPS 3.0",
        url: "https://www.ahrq.gov/teamstepps-program/index.html",
      },
    ],
    seeds: [
      ["When Advocacy Begins as a Clarifying Question", "using questions to make patient needs visible"],
      ["Why Patient Dignity Depends on Small Clinical Choices", "protecting personhood during busy care"],
      ["How Nurses Advocate Without Escalating Conflict", "keeping concerns clear, respectful, and persistent"],
      ["Why Family Communication Is Part of Advocacy", "helping families understand without overpromising"],
      ["The Professional Courage Behind Everyday Advocacy", "speaking up before a concern becomes harm"],
    ],
  },
  "Advanced Practice Nursing": {
    description:
      "Advanced practice nursing, nurse practitioner judgment, doctoral preparation, and leadership rooted in bedside experience.",
    audience: "nurses, nurse practitioner students, advanced practice nurses, and clinical leaders",
    tags: ["advanced practice", "nurse practitioner", "DNP"],
    references: [
      {
        label: "AANP: What is a Nurse Practitioner?",
        url: "https://www.aanp.org/about/all-about-nps/whats-a-nurse-practitioner",
      },
      {
        label: "AACN: The Essentials: Core Competencies for Professional Nursing Education",
        url: "https://www.aacnnursing.org/Portals/0/PDFs/Publications/Essentials-2021.pdf",
      },
      {
        label: "American Nurses Association: Code of Ethics for Nurses",
        url: "https://codeofethics.ana.org/home",
      },
    ],
    seeds: [
      ["Why Advanced Practice Still Needs Nursing Roots", "carrying bedside perspective into broader responsibility"],
      ["The Judgment Shift From Doing to Deciding", "understanding the transition into advanced practice thinking"],
      ["How NP Students Can Build Clinical Humility", "balancing confidence, questions, and accountability"],
      ["Why Doctoral Thinking Belongs in Daily Practice", "connecting systems awareness to patient care"],
      ["The Leadership Work Inside Advanced Practice", "using influence without losing clinical grounding"],
    ],
  },
  "Mentorship and Career Growth": {
    description:
      "Nursing mentorship, graduate education, professional identity, career transitions, and sustainable growth.",
    audience: "novice nurses, experienced nurses, mentors, educators, and nursing leaders",
    tags: ["mentorship", "career growth", "nursing leadership"],
    references: [
      {
        label: "AACN: The Essentials: Core Competencies for Professional Nursing Education",
        url: "https://www.aacnnursing.org/Portals/0/PDFs/Publications/Essentials-2021.pdf",
      },
      {
        label: "National League for Nursing: Teaching Resources",
        url: "https://www.nln.org/education/training/professional-development-programs/teaching-resources",
      },
      {
        label: "National Academy of Medicine: Clinician Resilience and Well-Being",
        url: "https://nam.edu/our-work/programs/clinician-resilience-and-well-being/",
      },
    ],
    seeds: [
      ["Why Mentorship Needs More Than Encouragement", "turning support into specific professional growth"],
      ["How Nurses Recognize Their Next Career Step", "reading curiosity, capacity, and timing with honesty"],
      ["The Value of Naming Professional Identity Out Loud", "helping nurses understand who they are becoming"],
      ["Why Experienced Nurses Should Tell Better Stories", "using career stories to teach judgment and resilience"],
      ["How Novice Nurses Find Their Voice Safely", "supporting confidence without rushing independence"],
    ],
  },
};

main().catch((error) => {
  console.error(`auto-blog failed: ${error.message}`);
  process.exitCode = 1;
});

async function main() {
  assertProjectShape();

  const articles = readJson(articlesPath);
  const editorialIndex = readJson(editorialIndexPath);
  const indexableSlugs = new Set(editorialIndex.indexableArticleSlugs || []);
  const existingSlugs = new Set(articles.map((article) => article.slug));
  const category = chooseCategory(articles);
  const profile = categoryProfiles[category];
  const topic = chooseTopic(profile, existingSlugs);
  const draft = await createDraft({ articles, category, profile, topic, indexableSlugs });
  const article = normalizeDraft(draft, { category, profile, topic });
  ensureMinimumLength(article, { category, profile, topic });
  const slug = uniqueSlug(slugify(article.title), existingSlugs);
  const relatedArticles = relatedFor({ category, articles, indexableSlugs });
  const html = renderArticlePage({ article, slug, date, relatedArticles, source });
  const validation = validateArticle({ article, html, slug, existingSlugs });

  const entry = {
    id: Math.max(0, ...articles.map((item) => Number(item.id) || 0)) + 1,
    category,
    title: article.title,
    focus: article.focus,
    slug,
    date,
    dateDisplay: dateDisplay(date),
    month: monthDisplay(date),
  };

  const logEntry = {
    date,
    slug,
    category,
    title: article.title,
    focus: article.focus,
    source,
    model: draft.model || "fallback",
    robots: "noindex, follow, max-image-preview:large",
    wordCount: validation.wordCount,
  };

  if (dryRun) {
    console.log(JSON.stringify({ mode: "dry-run", entry, validation, logEntry }, null, 2));
    return;
  }

  const targetPath = path.join(blogDir, `${slug}.html`);
  fs.writeFileSync(targetPath, html);

  const updatedArticles = [entry, ...articles.filter((item) => item.slug !== slug)];
  fs.writeFileSync(articlesPath, `${JSON.stringify(updatedArticles, null, 2)}\n`);

  const updatedLog = [logEntry, ...readLog(logPath).filter((item) => item.slug !== slug)].slice(0, 90);
  fs.writeFileSync(logPath, `${JSON.stringify(updatedLog, null, 2)}\n`);
  fs.writeFileSync(feedPath, renderDailyFeed(updatedLog));
  updateBlogIndexDailyPreview(updatedLog);

  console.log(`Generated /blog/${slug}`);
  console.log(`Robots: ${logEntry.robots}`);
  console.log(`Words: ${validation.wordCount}`);
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function assertProjectShape() {
  for (const requiredPath of [articlesPath, editorialIndexPath, path.join(blogDir, "blog.css")]) {
    if (!fs.existsSync(requiredPath)) {
      throw new Error(`Expected ${path.relative(root, requiredPath)} to exist. Run from the project root.`);
    }
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readLog(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return readJson(filePath);
}

function chooseCategory(articles) {
  if (categoryOverride) {
    if (!categoryProfiles[categoryOverride]) {
      throw new Error(`Unknown category "${categoryOverride}". Use one of: ${Object.keys(categoryProfiles).join(", ")}`);
    }
    return categoryOverride;
  }

  const counts = Object.fromEntries(Object.keys(categoryProfiles).map((category) => [category, 0]));
  for (const article of articles) {
    if (counts[article.category] !== undefined) counts[article.category] += 1;
  }

  return Object.keys(counts).sort((left, right) => counts[left] - counts[right] || left.localeCompare(right))[0];
}

function chooseTopic(profile, existingSlugs) {
  if (titleOverride) {
    return {
      title: titleCase(titleOverride),
      focus: focusOverride || focusFromTitle(titleOverride),
    };
  }

  for (const [title, focus] of profile.seeds) {
    if (!existingSlugs.has(slugify(title))) return { title, focus };
  }

  const suffix = date.replaceAll("-", "");
  return {
    title: `${profile.seeds[0][0]} ${suffix}`,
    focus: profile.seeds[0][1],
  };
}

async function createDraft(context) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AUTO_BLOG_MODEL;
  const useAi = Boolean(apiKey && model && !noAi);

  if (requireAi && !useAi) {
    throw new Error("Set OPENAI_API_KEY and AUTO_BLOG_MODEL, or remove --require-ai.");
  }

  if (!useAi) return fallbackDraft(context);

  const response = await callOpenAi(context, { apiKey, model });
  return { ...response, model };
}

async function callOpenAi({ articles, category, profile, topic, indexableSlugs }, { apiKey, model }) {
  const sourceArticles = articles
    .filter((article) => indexableSlugs.has(article.slug))
    .slice(0, 4)
    .map((article) => articleSample(article))
    .filter(Boolean);

  const prompt = {
    role: "user",
    content: [
      "Generate one original professional-development blog post for Josette Perrone's site.",
      "Return strict JSON only. Do not include markdown fences.",
      "",
      `Category: ${category}`,
      `Audience: ${profile.audience}`,
      `Working title: ${topic.title}`,
      `Working focus: ${topic.focus}`,
      "",
      "Voice and style:",
      "- Practical, calm, clinically grounded, and systems-aware.",
      "- Use specific nursing, education, leadership, and communication contexts.",
      "- Avoid motivational slogans, hype, emojis, exaggerated claims, and medical instructions.",
      "- Do not imitate a private person by claiming personal memories or first-person lived experiences.",
      "- Write as educational professional-development content, not medical, legal, or organizational policy advice.",
      "- Use article-specific headings. Do not reuse stock paragraphs.",
      "",
      "Required JSON shape:",
      JSON.stringify(
        {
          title: "string",
          focus: "lowercase phrase without a period",
          description: "150-160 character meta description",
          dek: "one-sentence article deck",
          sections: [
            { heading: "string", paragraphs: ["string", "string"] },
            { heading: "string", paragraphs: ["string", "string"] },
            { heading: "string", paragraphs: ["string", "string"] },
            { heading: "string", paragraphs: ["string", "string"] },
          ],
          practicalList: { heading: "string", items: ["string", "string", "string", "string", "string"] },
          reflection: { heading: "Reflection for teams", paragraphs: ["string"] },
        },
        null,
        2,
      ),
      "",
      "Length requirement: 800 to 950 words in the article body. Each paragraph should be specific and developed, not a short note.",
      "Existing cornerstone samples for style reference:",
      sourceArticles.join("\n\n---\n\n"),
    ].join("\n"),
  };

  const apiUrl =
    process.env.AUTO_BLOG_API_URL ||
    `${(process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.65,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an editorial assistant for a healthcare speaker website. You produce accurate, cautious, original educational content in JSON.",
        },
        prompt,
      ],
    }),
  });

  const payload = await response.json().catch(async () => ({ error: { message: await response.text() } }));
  if (!response.ok) {
    throw new Error(payload?.error?.message || `OpenAI request failed with status ${response.status}`);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI response did not include message content.");
  return JSON.parse(content);
}

function articleSample(article) {
  const filePath = path.join(blogDir, `${article.slug}.html`);
  if (!fs.existsSync(filePath)) return "";
  const html = fs.readFileSync(filePath, "utf8");
  const sections = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>\s*<p>(.*?)<\/p>/gs)]
    .slice(0, 3)
    .map((match) => `${stripTags(match[1])}: ${stripTags(match[2])}`)
    .join("\n");
  return `${article.title}\n${article.focus}\n${sections}`;
}

function fallbackDraft({ category, profile, topic }) {
  return {
    model: "fallback",
    title: topic.title,
    focus: topic.focus,
    description: `${topic.title}: ${topic.focus}. A practical reflection for ${profile.audience}.`,
    dek: `A clinical-style reflection from the Josette Perrone speaking library on ${topic.focus}.`,
    sections: [
      {
        heading: "The pattern worth noticing",
        paragraphs: [
          `${topic.title} is not only a matter of individual effort. In healthcare settings, the issue usually shows up through repeated patterns: rushed communication, uneven expectations, quiet workarounds, and the pressure to keep moving even when the team needs a clearer pause.`,
          `For ${profile.audience}, the practical question is not whether people care enough. The better question is whether the environment makes the right action visible, supported, and repeatable.`,
          `That distinction matters because professional commitment can hide process problems for a long time. Skilled nurses often compensate so effectively that the workaround looks like competence instead of a signal that the system needs attention.`,
        ],
      },
      {
        heading: "Why it matters in real clinical work",
        paragraphs: [
          `Small frictions can become cultural norms when no one has time to name them. A concern gets softened. A learner stops asking. A nurse compensates for a missing process. A leader hears the same issue but does not yet see the pattern underneath it.`,
          `This is where ${category.toLowerCase()} connects to safety, trust, and sustainability. Teams need language that helps them discuss the work without blaming the people carrying it.`,
          `A stronger conversation separates accountability from blame. It asks what people are being asked to hold in memory, which decisions need clearer support, and where repeated pressure is teaching the team to tolerate avoidable confusion.`,
        ],
      },
      {
        heading: "What teams can make more visible",
        paragraphs: [
          `A useful conversation starts with observable behavior. What is happening every shift? Where do people hesitate? Which workarounds have become accepted? Which moments depend on one strong person instead of a reliable process?`,
          `Those questions turn vague concern into usable information. They also help newer nurses and students understand that naming a pattern is part of professional practice, not a sign that they are failing to adapt.`,
          `Visibility also protects experienced staff. When the most capable people silently absorb friction, leaders may underestimate the strain until turnover, conflict, or a safety event makes the pattern impossible to ignore.`,
        ],
      },
      {
        heading: "How leaders and educators can respond",
        paragraphs: [
          `Leaders and educators do not need to solve every issue in one conversation. They do need to show that concerns lead somewhere. A small visible repair often builds more trust than a broad promise that never reaches the unit or classroom.`,
          `That response might be a revised huddle question, a clearer escalation phrase, a short debrief, a changed teaching prompt, or a follow-up note that tells the team what happened after they spoke up.`,
          `The important part is closing the loop. When staff or students can see that a concern produced a concrete next step, they are more likely to keep sharing the information leaders need before a problem grows.`,
        ],
      },
      {
        heading: "How to use this in professional development",
        paragraphs: [
          `This topic works well as a short staff-development or classroom discussion. Ask the group to name one recurring moment where the work depends on improvisation, then sort the answers into communication, staffing, environment, teaching, policy, or recovery themes.`,
          `After the themes are visible, choose one small test of change. The goal is not to create a perfect solution in the room. The goal is to practice moving from general frustration to a specific behavior, question, or follow-through step.`,
          `For event planners and educators, this structure keeps the conversation grounded. Participants leave with language they can use in huddles, post-conference debriefs, preceptor conversations, or leadership check-ins.`,
        ],
      },
    ],
    practicalList: {
      heading: "Practical prompts for discussion",
      items: [
        "What part of this issue shows up most often in daily work?",
        "Which phrase would help someone raise the concern earlier?",
        "Where does the current process depend too much on memory or personality?",
        "What is one small repair a leader or educator could make visible this week?",
        "How will the team know whether the change reduced friction?",
      ],
    },
    reflection: {
      heading: "Reflection for teams",
      paragraphs: [
        `The goal is not to make healthcare work sound simple. The goal is to give teams practical language for the parts of the work they already recognize. When a pattern can be named clearly, it can be taught, discussed, and improved with more honesty.`,
      ],
    },
  };
}

function normalizeDraft(draft, { category, profile, topic }) {
  const article = {
    title: cleanText(draft.title || topic.title),
    focus: cleanText(draft.focus || topic.focus).replace(/\.$/, ""),
    description: cleanText(
      draft.description ||
        `${draft.title || topic.title}: ${draft.focus || topic.focus}. A practical reflection for ${profile.audience}.`,
    ),
    dek: cleanText(draft.dek || `A clinical-style reflection from the Josette Perrone speaking library on ${topic.focus}.`),
    category,
    tags: profile.tags,
    references: profile.references,
    sections: normalizeSections(draft.sections),
    practicalList: normalizePracticalList(draft.practicalList),
    reflection: normalizeReflection(draft.reflection),
  };

  if (!article.title || !article.focus) throw new Error("Generated article is missing title or focus.");
  return article;
}

function normalizeSections(sections) {
  const normalized = Array.isArray(sections)
    ? sections
        .map((section) => ({
          heading: cleanText(section.heading),
          paragraphs: Array.isArray(section.paragraphs) ? section.paragraphs.map(cleanText).filter(Boolean) : [],
        }))
        .filter((section) => section.heading && section.paragraphs.length)
    : [];

  if (normalized.length < 4) {
    throw new Error("Generated article needs at least four substantive sections.");
  }

  return normalized;
}

function normalizePracticalList(list) {
  const items = Array.isArray(list?.items) ? list.items.map(cleanText).filter(Boolean).slice(0, 6) : [];
  if (items.length < 4) throw new Error("Generated article needs at least four practical list items.");
  return {
    heading: cleanText(list.heading || "Practical prompts for discussion"),
    items,
  };
}

function normalizeReflection(reflection) {
  const paragraphs = Array.isArray(reflection?.paragraphs)
    ? reflection.paragraphs.map(cleanText).filter(Boolean)
    : [cleanText(reflection?.paragraphs || reflection || "")].filter(Boolean);
  if (!paragraphs.length) throw new Error("Generated article needs a reflection close.");
  return {
    heading: cleanText(reflection.heading || "Reflection for teams"),
    paragraphs,
  };
}

function ensureMinimumLength(article, { category, profile, topic }) {
  if (articleWordCount(article) >= 650) return;

  const existingHeadings = new Set(article.sections.map((section) => section.heading.toLowerCase()));
  if (!existingHeadings.has("how to use this in professional development")) {
    article.sections.push({
      heading: "How to use this in professional development",
      paragraphs: [
        `For ${profile.audience}, this topic works best when it is tied to one recognizable moment instead of discussed as a broad ideal. A facilitator can ask the group where ${topic.focus} shows up during a shift, class, huddle, simulation, or leadership check-in, then listen for the specific behaviors that make the issue easier or harder to address.`,
        `The next step is to choose one small practice the group can test. That might be a clearer question, a more direct phrase, a brief debrief prompt, a preceptor coaching cue, or a leader follow-up habit. The point is to move from agreement to behavior, because behavior is what teams can observe, repeat, and improve.`,
        `This keeps the conversation grounded in ${category.toLowerCase()} without turning it into blame. Nurses and learners usually know where the pressure lives. A useful professional-development conversation gives them language for that pressure and a practical way to respond before the same pattern becomes normal.`,
      ],
    });
  }

  if (articleWordCount(article) >= 650) return;

  article.reflection.paragraphs.push(
    `A strong closing question for the team is simple: what is one part of this pattern we can make easier to notice this week? When the answer is specific, the discussion becomes more than reflection. It becomes a small act of clinical leadership.`,
  );

  if (articleWordCount(article) >= 650) return;

  article.sections.push({
    heading: "What leaders should carry forward",
    paragraphs: [
      `Leaders do not need to turn every daily note into a new initiative. They do need to notice which ideas keep returning across staff comments, student questions, debriefs, and patient-care friction. Repetition is information. When the same concern keeps surfacing, the system is offering a place to learn.`,
      `A practical response is to name the pattern, pick one next action, and report back. That visible follow-through is often what helps teams believe that speaking clearly is worth the effort.`,
    ],
  });
}

function renderArticlePage({ article, slug, date, relatedArticles, source }) {
  const minutes = Math.max(4, Math.ceil(articleWordCount(article) / 190));
  const robots = "noindex, follow, max-image-preview:large";
  const canonical = `${baseUrl}/blog/${slug}`;
  const description = trimMeta(article.description, 170);
  const keywords = [article.category, ...article.tags, article.title].join(", ");

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${canonical}#article`,
        mainEntityOfPage: canonical,
        headline: article.title,
        description,
        image: `${baseUrl}/assets/brand/og-josette-perrone-contrast.png`,
        datePublished: date,
        dateModified: date,
        author: { "@id": `${baseUrl}/#josette-perrone` },
        publisher: { "@id": `${baseUrl}/#speaker-business` },
        articleSection: article.category,
        keywords: [article.category, "nursing", "healthcare leadership", "clinical education", article.focus],
        isAccessibleForFree: true,
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#speaker-business`,
        name: "Josette Perrone Healthcare Speaking",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/assets/brand/favicon-32.png`,
        },
        image: `${baseUrl}/assets/brand/og-josette-perrone-contrast.png`,
        founder: { "@id": `${baseUrl}/#josette-perrone` },
      },
      {
        "@type": "Person",
        "@id": `${baseUrl}/#josette-perrone`,
        name: "Josette Perrone",
        honorificSuffix: "DNP, MSN-Ed, FNP-C, RN",
        jobTitle: ["Healthcare Speaker", "Family Nurse Practitioner", "Clinical Nurse Educator", "Emergency and Trauma Registered Nurse"],
        url: baseUrl,
        image: `${baseUrl}/assets/speaker/clinical-leadership-portrait.png`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${baseUrl}/blog` },
          { "@type": "ListItem", position: 3, name: article.title, item: canonical },
        ],
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(article.title)} | Josette Perrone Clinical Blog</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="reading-time" content="${minutes} min" />
    <meta name="article:section" content="${escapeHtml(article.category)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <meta name="author" content="Josette Perrone" />
    <meta name="robots" content="${robots}" />
    <meta name="auto-blog-source" content="${escapeHtml(source)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(article.title)} | Josette Perrone Clinical Blog" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${baseUrl}/assets/brand/og-josette-perrone-contrast.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Josette Perrone healthcare speaker preview graphic" />
    <meta property="og:site_name" content="Josette Perrone" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(article.title)} | Josette Perrone Clinical Blog" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${baseUrl}/assets/brand/og-josette-perrone-contrast.png" />
    <meta name="theme-color" content="#0d7c78" />
    <meta property="article:published_time" content="${date}" />
    <meta property="article:modified_time" content="${date}" />
    <meta property="article:author" content="Josette Perrone" />
    <meta property="article:section" content="${escapeHtml(article.category)}" />
    <link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/assets/brand/favicon-32.png" sizes="32x32" type="image/png" />
    <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../styles.css?v=20260524-banner-hero" />
    <link rel="stylesheet" href="/blog/blog.css?v=20260614-blog-audit" />
    <script type="application/ld+json">${JSON.stringify(schema, null, 2).replace(/</g, "\\u003c")}</script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="/#top"><span class="brand-mark">JP</span><span><strong>Josette Perrone</strong><small>DNP, FNP-C, RN</small></span></a>
      <nav class="site-nav" aria-label="Primary"><a href="/healthcare-speaker">Healthcare Speaker</a><a href="/nursing-speaker">Nursing Speaker</a><a href="/keynotes-workshops">Topics</a><a href="/#experience">Experience</a><a href="/#about">About</a><a href="/blog">Blog</a><a href="/#booking">Booking</a></nav>
    </header>
    <main class="article-shell">
      <article class="article-page">
        <a class="back-link" href="/blog/daily-field-notes">Back to daily field notes</a>
        <p class="article-meta"><span>${escapeHtml(article.category)}</span><time datetime="${date}">${dateDisplay(date)}</time><span>${minutes} min read</span></p>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="article-dek">${escapeHtml(article.dek)}</p>
        <div class="article-tags" aria-label="Article topics">${article.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="article-note">Educational content for professional development. This article is not medical advice, legal advice, or a substitute for an organization's policies, clinical protocols, or regulatory requirements.</div>

${article.sections.map(renderSection).join("\n")}
        <section>
          <h2>${escapeHtml(article.practicalList.heading)}</h2>
          <ul>
${article.practicalList.items.map((item) => `            <li>${escapeHtml(item)}</li>`).join("\n")}
          </ul>
        </section>
        <section>
          <h2>${escapeHtml(article.reflection.heading)}</h2>
${article.reflection.paragraphs.map((paragraph) => `          <p>${escapeHtml(paragraph)}</p>`).join("\n")}
        </section>
        <section class="related-articles" aria-labelledby="related-title">
          <p class="eyebrow">Related reading</p>
          <h2 id="related-title">Cornerstone articles to start with</h2>
          <div class="related-grid">
${relatedArticles.map(renderRelatedArticle).join("\n")}
          </div>
        </section>
        <section class="article-references">
          <h2>References and further reading</h2>
          <p>Selected references for further reading.</p>
          <ul>
${article.references.map((reference) => `            <li><a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener">${escapeHtml(reference.label)}</a></li>`).join("\n")}
          </ul>
        </section>
      </article>
    </main>
    <script src="../analytics.js"></script>
  </body>
</html>
`;
}

function renderSection(section) {
  return `        <section>
          <h2>${escapeHtml(section.heading)}</h2>
${section.paragraphs.map((paragraph) => `          <p>${escapeHtml(paragraph)}</p>`).join("\n")}
        </section>`;
}

function renderRelatedArticle(article) {
  return `            <a href="/blog/${article.slug}">
              <span>${escapeHtml(article.category)}</span>
              <strong>${escapeHtml(article.title)}</strong>
            </a>`;
}

function renderDailyFeed(logEntries) {
  const latest = logEntries.slice(0, 30);
  const cards = latest
    .map(
      (entry) => `            <article class="compact-article">
              <time datetime="${entry.date}">${dateDisplay(entry.date)}</time>
              <div>
                <p>${escapeHtml(entry.category)}</p>
                <h3><a href="/blog/${entry.slug}">${escapeHtml(entry.title)}</a></h3>
                <span>${escapeHtml(entry.focus)}.</span>
              </div>
            </article>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Daily Field Notes | Josette Perrone Clinical Blog</title>
    <meta name="description" content="Noindexed daily field notes generated from Josette Perrone's clinical blog themes for professional-development review." />
    <meta name="author" content="Josette Perrone" />
    <meta name="robots" content="noindex, follow, max-image-preview:large" />
    <link rel="canonical" href="${baseUrl}/blog/daily-field-notes" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Daily Field Notes | Josette Perrone Clinical Blog" />
    <meta property="og:description" content="Noindexed daily field notes generated from Josette Perrone's clinical blog themes for professional-development review." />
    <meta property="og:url" content="${baseUrl}/blog/daily-field-notes" />
    <meta property="og:image" content="${baseUrl}/assets/brand/og-josette-perrone-contrast.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Daily Field Notes | Josette Perrone Clinical Blog" />
    <meta name="twitter:description" content="Noindexed daily field notes generated from Josette Perrone's clinical blog themes for professional-development review." />
    <meta name="twitter:image" content="${baseUrl}/assets/brand/og-josette-perrone-contrast.png" />
    <meta name="theme-color" content="#0d7c78" />
    <link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/assets/brand/favicon-32.png" sizes="32x32" type="image/png" />
    <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../styles.css?v=20260524-posthog-seo" />
    <link rel="stylesheet" href="/blog/blog.css?v=20260614-blog-audit" />
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="/#top"><span class="brand-mark">JP</span><span><strong>Josette Perrone</strong><small>DNP, FNP-C, RN</small></span></a>
      <nav class="site-nav" aria-label="Primary"><a href="/healthcare-speaker">Healthcare Speaker</a><a href="/nursing-speaker">Nursing Speaker</a><a href="/keynotes-workshops">Topics</a><a href="/#experience">Experience</a><a href="/#about">About</a><a href="/blog">Blog</a><a href="/#booking">Booking</a></nav>
    </header>
    <main>
      <section class="blog-hero section">
        <div class="blog-hero-copy">
          <a class="back-link" href="/blog">Back to cornerstone blog</a>
          <p class="eyebrow">Daily field notes</p>
          <h1>Noindexed daily clinical reflections.</h1>
          <p class="hero-lede">These daily notes are generated from the site's existing topic pillars for review and professional-development use. Cornerstone SEO articles remain curated separately.</p>
        </div>
        <aside class="blog-hero-panel" aria-label="Daily field notes summary">
          <div><strong>${latest.length}</strong><span>Recent notes</span></div>
          <div><strong>Noindex</strong><span>Review-first archive</span></div>
        </aside>
      </section>
      <section class="blog-layout section" aria-label="Daily field note archive">
        <aside class="archive-sidebar">
          <p class="eyebrow">Editorial guardrail</p>
          <div class="article-note">Daily notes stay out of the XML sitemap and use noindex until one is rewritten and promoted as a cornerstone article.</div>
          <a class="button primary" href="/#booking">Invite Josette to Speak</a>
        </aside>
        <div class="archive-content">
          <section class="latest-list" aria-labelledby="latest-title">
            <div class="archive-category-heading">
              <p class="eyebrow">Generated archive</p>
              <h2 id="latest-title">Latest field notes</h2>
            </div>
            <div class="compact-list">
${cards || "              <p>No daily field notes have been generated yet.</p>"}
            </div>
          </section>
        </div>
      </section>
    </main>
    <script src="../analytics.js"></script>
  </body>
</html>
`;
}

function renderDailyPreview(logEntries) {
  return logEntries
    .slice(0, 3)
    .map(
      (entry) => `            <article class="compact-article">
              <time datetime="${entry.date}">${dateDisplay(entry.date)}</time>
              <div>
                <p>${escapeHtml(entry.category)}</p>
                <h3><a href="/blog/${entry.slug}">${escapeHtml(entry.title)}</a></h3>
                <span>${escapeHtml(entry.focus)}.</span>
              </div>
            </article>`,
    )
    .join("\n");
}

function updateBlogIndexDailyPreview(logEntries) {
  const html = fs.readFileSync(blogIndexPath, "utf8");
  const start = "          <!-- auto-blog:daily-preview:start -->";
  const end = "          <!-- auto-blog:daily-preview:end -->";
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error("Blog index daily preview markers are missing.");
  }

  const preview = renderDailyPreview(logEntries) || "            <p>No daily field notes have been generated yet.</p>";
  const nextHtml = `${html.slice(0, startIndex + start.length)}\n${preview}\n${html.slice(endIndex)}`;
  fs.writeFileSync(blogIndexPath, nextHtml);
}

function validateArticle({ article, html, slug, existingSlugs }) {
  if (existingSlugs.has(slug)) throw new Error(`Slug already exists: ${slug}`);
  const text = stripTags(html);
  const banned = ["as an ai", "i cannot", "medical advice", "diagnose", "treat a patient by"];
  const lowered = text.toLowerCase();
  const hit = banned.find((phrase) => lowered.includes(phrase));
  if (hit && hit !== "medical advice") throw new Error(`Generated article contains banned phrase: ${hit}`);

  const wordCount = articleWordCount(article);
  if (wordCount < 650) {
    throw new Error(`Generated article is too short: ${wordCount} words. Minimum is 650.`);
  }

  if (article.sections.length < 4) throw new Error("Article must include at least four sections.");
  if (!html.includes('meta name="robots" content="noindex, follow, max-image-preview:large"')) {
    throw new Error("Generated posts must be noindex by default.");
  }

  return { wordCount, sections: article.sections.length };
}

function relatedFor({ category, articles, indexableSlugs }) {
  const indexable = articles.filter((article) => indexableSlugs.has(article.slug));
  const peers = indexable.filter((article) => article.category === category);
  const fallback = indexable.filter((article) => article.category !== category);
  return [...peers, ...fallback].slice(0, 3);
}

function articleWordCount(article) {
  const values = [
    article.dek,
    ...article.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
    article.practicalList.heading,
    ...article.practicalList.items,
    article.reflection.heading,
    ...article.reflection.paragraphs,
  ];
  return values.join(" ").split(/\s+/).filter(Boolean).length;
}

function uniqueSlug(baseSlug, existingSlugs) {
  let slug = baseSlug;
  let count = 2;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${count}`;
    count += 1;
  }
  return slug;
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleCase(value) {
  return cleanText(value)
    .split(/\s+/)
    .map((word, index) =>
      index > 0 && word.length <= 3 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`,
    )
    .join(" ")
    .replace(/\bNp\b/g, "NP")
    .replace(/\bDnp\b/g, "DNP")
    .replace(/\bRn\b/g, "RN");
}

function focusFromTitle(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/^why\s+/, "")
    .replace(/^how\s+/, "")
    .replace(/^when\s+/, "")
    .replace(/^what\s+/, "")
    .replace(/\?$/, "");
}

function cleanText(value) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function trimMeta(value, maxLength) {
  const text = cleanText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}.`;
}

function isoDate(value) {
  return value.toISOString().slice(0, 10);
}

function dateDisplay(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function monthDisplay(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
