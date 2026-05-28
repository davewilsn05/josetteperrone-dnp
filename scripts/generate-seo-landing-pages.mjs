import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseUrl = "https://josetteperrone.com";
const today = "2026-05-28";
const articles = JSON.parse(fs.readFileSync(path.join(root, "blog", "articles.json"), "utf8"));

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const byCategory = articles.reduce((map, article) => {
  if (!map.has(article.category)) map.set(article.category, []);
  map.get(article.category).push(article);
  return map;
}, new Map());

const categoryTargets = {
  "Healthcare Worker Safety": "/topics/healthcare-communication-safety",
  "Burnout and Resilience": "/topics/nurse-burnout-resilience",
  "Emergency and Trauma Nursing": "/topics/emergency-trauma-nursing",
  "Nursing Education": "/topics/nursing-education",
  "Clinical Communication": "/topics/healthcare-communication-safety",
  "Patient Advocacy": "/keynotes-workshops",
  "Advanced Practice Nursing": "/speaker-summary",
  "Mentorship and Career Growth": "/nursing-speaker",
};

const articleLinks = (categories, limit = 8) =>
  categories
    .flatMap((category) => byCategory.get(category) ?? [])
    .slice(0, limit)
    .map((article) => ({
      title: article.title,
      href: `/blog/${article.slug}`,
      kicker: article.category,
      text: `${article.focus}.`,
    }));

const sharedFaq = [
  {
    q: "How do you book Josette Perrone to speak?",
    a: "Use the booking inquiry form with the event type, audience, date, location, desired topic, and goals for the session.",
  },
  {
    q: "Does Josette offer virtual sessions?",
    a: "Josette can be considered for in-person, virtual, and hybrid events, including conferences, academic programs, staff development sessions, and leadership programs.",
  },
];

const pages = [
  {
    slug: "healthcare-speaker",
    title: "Healthcare Speaker on Burnout, Resilience, Communication, and Team Safety | Josette Perrone",
    description:
      "Book Josette Perrone, DNP, MSN-Ed, FNP-C, RN as a healthcare speaker for keynotes and workshops on burnout, resilience, communication, team safety, and sustainable leadership.",
    eyebrow: "Healthcare speaker",
    h1: "A healthcare speaker for teams carrying real clinical pressure.",
    lede:
      "Josette Perrone brings emergency, trauma, family practice, nursing education, and doctoral experience to healthcare audiences that need practical conversations about burnout, resilience, communication, safety, and sustainable leadership.",
    image: "/assets/speaker/panel-stage-magenta-blazer.png",
    proof: ["Healthcare conferences", "Hospitals and health systems", "Leadership retreats", "Professional development", "Virtual and hybrid sessions"],
    sections: [
      ["What Josette helps healthcare teams work through", "Her sessions turn familiar pressure points into practical language: burnout that is not reduced to personal weakness, communication that protects safety, leadership that supports human beings, and resilience that does not ask clinicians to simply endure more."],
      ["Why her clinical background matters", "Josette speaks from the full climb of nursing practice: emergency and trauma nursing, nursing education, family nurse practitioner preparation, and Doctor of Nursing Practice work on burnout mitigation. That range helps her connect with staff, students, educators, and leaders."],
      ["Strong-fit events", "Healthcare conferences, staff development days, leadership retreats, Nurses Week programs, academic events, workforce resilience programs, and professional development sessions are strong fits."],
    ],
    cards: [
      ["Burnout and resilience", "Practical framing for teams that need support without blame."],
      ["Clinical communication", "Clearer language for high-pressure settings, escalation, handoffs, and difficult conversations."],
      ["Team safety", "Psychological safety, healthcare worker safety, and the small behaviors that shape culture."],
      ["Sustainable leadership", "Leadership habits that protect attention, dignity, and retention."],
    ],
    faqs: [
      { q: "What does a healthcare speaker do?", a: "A healthcare speaker helps clinical teams, leaders, students, and educators think more clearly about workplace challenges such as burnout, communication, safety, resilience, and culture." },
      { q: "Who should book Josette as a healthcare speaker?", a: "Conferences, hospitals, health systems, nursing schools, professional development teams, and leadership programs are strong fits." },
      ...sharedFaq,
    ],
    related: articleLinks(["Burnout and Resilience", "Clinical Communication", "Healthcare Worker Safety"], 9),
  },
  {
    slug: "nursing-speaker",
    title: "Nursing Speaker for Conferences, Nursing Schools, and Nurses Week | Josette Perrone",
    description:
      "Book Josette Perrone as a nursing speaker for conferences, nursing schools, Nurses Week events, nurse residency programs, and professional development sessions.",
    eyebrow: "Nursing speaker",
    h1: "A nursing speaker who understands the bedside, the classroom, and the leadership table.",
    lede:
      "Josette speaks to nurses, nursing students, educators, and leaders about the human and clinical realities of the profession: burnout, boundaries, communication, safety, advocacy, mentorship, and growth.",
    image: "/assets/speaker/nurse-educator-workshop.png",
    proof: ["Nursing conferences", "Nursing schools", "Nurses Week", "Residency programs", "Preceptor development"],
    sections: [
      ["Why nursing audiences connect with Josette", "Her message is grounded in lived nursing experience rather than generic motivation. She understands high-acuity care, novice nurse development, nursing education, advanced practice, and the emotional weight nurses often carry quietly."],
      ["Session outcomes", "Audiences leave with usable language, reflection prompts, communication tools, and a more practical way to think about resilience, safety, mentorship, and professional identity."],
      ["Strong-fit audiences", "Bedside nurses, novice nurses, charge nurses, students, educators, preceptors, nurse residency cohorts, and healthcare leaders can all connect with her topics."],
    ],
    cards: [
      ["Novice nurse support", "Boundaries, confidence, voice, and safe growth."],
      ["Nurse educator perspective", "Student-centered teaching, clinical judgment, and practical mentorship."],
      ["Emergency nursing lessons", "Priority-setting, communication, and regulation in high-acuity spaces."],
      ["Career sustainability", "Growth without losing the human being inside the role."],
    ],
    faqs: [
      { q: "Is Josette a good fit for Nurses Week?", a: "Yes. Her topics on burnout, resilience, communication, team safety, and sustainable nursing work are strong fits for Nurses Week programs." },
      { q: "Does Josette speak to nursing students?", a: "Yes. Her nursing education and clinical educator background make her a strong fit for nursing student, novice nurse, residency, and academic audiences." },
      ...sharedFaq,
    ],
    related: articleLinks(["Nursing Education", "Mentorship and Career Growth", "Emergency and Trauma Nursing"], 9),
  },
  {
    slug: "nurses-week-speaker",
    title: "Nurses Week Speaker on Burnout, Resilience, and Sustainable Nursing | Josette Perrone",
    description:
      "Book Josette Perrone for Nurses Week keynotes and workshops on nurse burnout, resilience, communication, advocacy, safety, and sustainable clinical work.",
    eyebrow: "Nurses Week speaker",
    h1: "A Nurses Week speaker for honest, practical conversations about the work nurses carry.",
    lede:
      "Nurses Week should be more than appreciation language. Josette helps nursing teams name the pressure, protect the human beings doing the work, and leave with practical ways to communicate, recover, advocate, and keep growing.",
    image: "/assets/speaker/clinical-team-corridor.png",
    proof: ["Nurses Week programs", "Staff development", "Hospital events", "Nursing school events", "Virtual sessions"],
    sections: [
      ["A practical Nurses Week message", "Josette's Nurses Week sessions can honor nurses without pretending the work is easy. Her talks create room for resilience, boundaries, communication, psychological safety, and sustainable growth."],
      ["Suggested session themes", "Leading without losing yourself, burnout is not a personal failure, communication under pressure, patient advocacy and professional courage, and what experienced nurses can give the next generation."],
      ["Audience fit", "Clinical nurses, novice nurses, charge nurses, educators, preceptors, nurse leaders, and interdisciplinary healthcare teams are strong fits."],
    ],
    cards: [
      ["Recognition with substance", "A message that respects nurses while giving them something useful."],
      ["Burnout without blame", "Language that moves beyond personal weakness."],
      ["Recovery and resilience", "Practical habits that support attention and regulation."],
      ["Mentorship and voice", "Helping nurses speak, teach, and lead with more clarity."],
    ],
    faqs: [
      { q: "What makes a good Nurses Week speaker?", a: "A strong Nurses Week speaker should honor nurses while giving them practical language and tools they can carry back into real clinical environments." },
      { q: "What topics work well for Nurses Week?", a: "Burnout, resilience, communication, psychological safety, advocacy, mentorship, and sustainable leadership are strong Nurses Week topics." },
      ...sharedFaq,
    ],
    related: articleLinks(["Burnout and Resilience", "Mentorship and Career Growth", "Patient Advocacy"], 9),
  },
  {
    slug: "keynotes-workshops",
    title: "Healthcare Keynotes and Workshops | Josette Perrone",
    description:
      "Explore Josette Perrone's healthcare keynote and workshop formats for burnout, resilience, communication, team safety, nursing education, and leadership events.",
    eyebrow: "Keynotes and workshops",
    h1: "Healthcare talks designed to leave the room with language they can use.",
    lede:
      "Josette's sessions are built for practical transfer. Whether the room is a keynote audience, a nursing cohort, a leadership retreat, or a professional development workshop, the goal is useful language, stronger reflection, and better next actions.",
    image: "/assets/speaker/conference-lobby-conversation.png",
    proof: ["Keynotes", "Breakouts", "Workshops", "Panels", "Virtual sessions"],
    sections: [
      ["Keynotes", "Best for conferences, Nurses Week programs, association events, leadership retreats, and large staff gatherings that need a focused, memorable message."],
      ["Workshops", "Best for teams that need more interaction, reflection, discussion prompts, case examples, and practical application."],
      ["Custom sessions", "Topics can be shaped around the audience's experience, clinical setting, event goals, and desired takeaways."],
    ],
    cards: [
      ["Leading Without Losing Yourself", "Resilience, boundaries, confidence, and humanity in demanding work."],
      ["Communication Under Pressure", "Clearer language for difficult clinical and team moments."],
      ["Teaching and Clinical Judgment", "Student-centered education, simulation, and safe practice behaviors."],
      ["Patient Advocacy", "Compassionate leadership, dignity, and speaking up with professionalism."],
    ],
    faqs: [
      { q: "What formats does Josette offer?", a: "Josette can be considered for keynotes, breakout sessions, workshops, panels, virtual sessions, and custom professional development programs." },
      { q: "Can a session be customized?", a: "Yes. Booking inquiries should include the audience, event goals, topic priorities, format, date, and what the planner wants attendees to leave with." },
      ...sharedFaq,
    ],
    related: articleLinks(["Clinical Communication", "Nursing Education", "Patient Advocacy"], 9),
  },
  {
    slug: "speaker-summary",
    title: "Speaker Summary for Josette Perrone, DNP, MSN-Ed, FNP-C, RN",
    description:
      "A plain-language speaker summary for Josette Perrone, healthcare speaker, nurse practitioner, nurse educator, and emergency/trauma clinician.",
    eyebrow: "Speaker summary",
    h1: "Josette Perrone speaker summary.",
    lede:
      "Josette Perrone, DNP, MSN-Ed, FNP-C, RN is a healthcare and nursing speaker focused on burnout, resilience, communication, safety, education, advocacy, advanced practice, and sustainable leadership.",
    image: "/assets/speaker/clinical-leadership-portrait.png",
    proof: ["DNP", "MSN-Ed", "FNP-C", "Emergency/trauma RN", "Healthcare speaker"],
    sections: [
      ["Who she is", "Josette is a family nurse practitioner, nurse educator, emergency/trauma registered nurse, and Doctor of Nursing Practice. Her background gives her a clinical, educational, and communication-centered view of healthcare work."],
      ["What she speaks about", "Her speaking topics include nurse burnout, resilience, workplace communication, team safety, nursing education, patient advocacy, advanced practice nursing, mentorship, and sustainable leadership."],
      ["Who books her", "Healthcare conferences, hospitals, nursing schools, leadership retreats, nurse residency programs, professional development teams, and Nurses Week planners are strong fits."],
    ],
    cards: [
      ["Clinical", "Emergency, trauma, family practice, and advanced practice perspective."],
      ["Educational", "Nursing education, student support, mentorship, and clinical judgment."],
      ["Human", "Burnout, recovery, boundaries, and sustainable care."],
      ["Practical", "Communication tools and language teams can use."],
    ],
    faqs: [
      { q: "Who is Josette Perrone?", a: "Josette Perrone, DNP, MSN-Ed, FNP-C, RN is a healthcare speaker, family nurse practitioner, nurse educator, and emergency/trauma registered nurse." },
      { q: "What is Josette Perrone known for speaking about?", a: "She speaks about burnout, resilience, workplace communication, team safety, nursing education, patient advocacy, advanced practice nursing, and sustainable leadership." },
      ...sharedFaq,
    ],
    related: articleLinks(["Burnout and Resilience", "Clinical Communication", "Nursing Education"], 9),
  },
  {
    slug: "topics/nurse-burnout-resilience",
    title: "Nurse Burnout and Resilience Speaker | Josette Perrone",
    description:
      "Book Josette Perrone for talks and workshops on nurse burnout, resilience, moral distress, recovery, and sustainable clinical work.",
    eyebrow: "Topic: burnout and resilience",
    h1: "Nurse burnout conversations need more precision and more humanity.",
    lede:
      "Josette helps healthcare audiences talk about burnout without reducing it to personal weakness. Her sessions connect resilience, recovery, moral distress, leadership listening, and the systems that shape whether clinicians can keep showing up well.",
    image: "/assets/speaker/clinical-team-corridor.png",
    proof: ["Burnout", "Resilience", "Moral distress", "Recovery", "Retention"],
    sections: [
      ["What this topic covers", "Burnout warning signs, the difference between resilience and endurance, moral distress, micro-recovery, leadership listening, team support, and why sustainable care requires more than individual toughness."],
      ["Who benefits", "Nurses, charge nurses, nurse leaders, educators, students, professional development teams, and interdisciplinary healthcare groups."],
      ["Session outcome", "Audiences leave with language that is less blaming, more useful, and easier to bring into team conversations."],
    ],
    cards: [
      ["Burnout is not personal failure", "Move from blame to better questions."],
      ["Resilience is not endurance", "Separate coping from unsupported overload."],
      ["Recovery is a practice", "Use practical transitions after high-intensity work."],
      ["Leaders set conditions", "Listening and follow-through shape trust."],
    ],
    faqs: [
      { q: "What is nurse burnout?", a: "Nurse burnout is a work-related state of emotional exhaustion, cynicism or detachment, and reduced sense of efficacy that can be shaped by workload, stress, support, and organizational conditions." },
      { q: "How can leaders support nurse resilience?", a: "Leaders can support resilience by listening early, reducing unnecessary friction, protecting psychological safety, normalizing recovery practices, and acting on repeated signals from staff." },
      ...sharedFaq,
    ],
    related: articleLinks(["Burnout and Resilience"], 9),
  },
  {
    slug: "topics/healthcare-communication-safety",
    title: "Healthcare Communication and Team Safety Speaker | Josette Perrone",
    description:
      "Book Josette Perrone for healthcare talks on clinical communication, team safety, psychological safety, handoffs, escalation, and communication under pressure.",
    eyebrow: "Topic: communication and safety",
    h1: "Clinical communication is a safety skill.",
    lede:
      "Josette's communication and safety talks focus on the language, habits, and team conditions that help clinicians speak up, hand off clearly, debrief without blame, and protect both patients and staff.",
    image: "/assets/speaker/nurse-educator-workshop.png",
    proof: ["Clinical communication", "Team safety", "Handoffs", "Escalation", "Psychological safety"],
    sections: [
      ["What this topic covers", "Closed-loop communication, handoffs, safety huddles, debriefing, tone during escalation, speaking up without sounding combative, and the small moments that shape safety culture."],
      ["Why it matters", "Communication is not a soft skill in healthcare. It affects attention, trust, escalation, clarity, and patient safety."],
      ["Strong-fit teams", "Emergency departments, nursing units, nursing schools, leadership groups, novice nurse programs, and interdisciplinary teams."],
    ],
    cards: [
      ["Closed-loop communication", "Make expectations, actions, and follow-up visible."],
      ["Handoffs", "Reduce preventable gaps during transitions."],
      ["Speaking up", "Use professionalism without silence."],
      ["Debriefing", "Learn without punishment or blame."],
    ],
    faqs: [
      { q: "Why does clinical communication matter?", a: "Clinical communication affects patient safety, team trust, escalation, handoffs, and whether staff can speak up before small problems become larger risks." },
      { q: "What is psychological safety in healthcare?", a: "Psychological safety is the team condition where people can raise concerns, ask questions, report near misses, and contribute without fear of humiliation or retaliation." },
      ...sharedFaq,
    ],
    related: articleLinks(["Clinical Communication", "Healthcare Worker Safety"], 9),
  },
  {
    slug: "topics/nursing-education",
    title: "Nursing Education Speaker on Clinical Judgment and Student Confidence | Josette Perrone",
    description:
      "Book Josette Perrone for nursing education talks on clinical judgment, student confidence, simulation, precepting, mentorship, and safe learning environments.",
    eyebrow: "Topic: nursing education",
    h1: "Nursing education should build confidence without hiding the pressure.",
    lede:
      "Josette speaks to educators, students, preceptors, and academic leaders about clinical judgment, psychological safety, mentorship, simulation, student-centered teaching, and helping novice nurses find their voice.",
    image: "/assets/speaker/nurse-educator-workshop.png",
    proof: ["Nurse educators", "Students", "Preceptors", "Clinical judgment", "Mentorship"],
    sections: [
      ["What this topic covers", "Clinical judgment, student confidence, formative assessment, role play, simulation, hidden curriculum, approachable faculty, and structured reflection."],
      ["Why her educator experience matters", "Josette's nursing education work gives her a practical view of how students learn, where they hesitate, and how educators can support safe development."],
      ["Strong-fit audiences", "Nursing schools, faculty development programs, preceptor training, nurse residency programs, and student events."],
    ],
    cards: [
      ["Clinical judgment", "Help students connect theory to practice."],
      ["Safe learning", "Make room for trying, feedback, and reflection."],
      ["Mentorship", "Build the voice novice nurses need."],
      ["Assessment", "Use feedback that strengthens growth."],
    ],
    faqs: [
      { q: "What does Josette speak about for nursing education audiences?", a: "She speaks about clinical judgment, student confidence, mentorship, psychological safety, simulation, formative assessment, and helping novice nurses transition into practice." },
      { q: "Is this topic appropriate for nursing students?", a: "Yes. It can be shaped for students, novice nurses, preceptors, nurse residency programs, faculty, or academic leadership." },
      ...sharedFaq,
    ],
    related: articleLinks(["Nursing Education", "Mentorship and Career Growth"], 9),
  },
  {
    slug: "topics/emergency-trauma-nursing",
    title: "Emergency and Trauma Nursing Speaker | Josette Perrone",
    description:
      "Book Josette Perrone for emergency and trauma nursing talks on high-acuity care, communication, priorities, preparedness, and team support.",
    eyebrow: "Topic: emergency and trauma nursing",
    h1: "Emergency nursing lessons for teams that work under pressure.",
    lede:
      "Josette draws from emergency and trauma nursing to help healthcare audiences think about priorities, preparation, communication, team readiness, cognitive load, and what teams need after high-acuity moments.",
    image: "/assets/speaker/clinical-leadership-portrait.png",
    proof: ["Emergency nursing", "Trauma care", "High-acuity teams", "Communication", "Preparedness"],
    sections: [
      ["What this topic covers", "High-acuity decision-making, role clarity, first-five-minute priorities, team communication, debriefing, cognitive load, pattern recognition, and recovery after intense clinical moments."],
      ["Why it translates", "Emergency nursing shows how teams operate when time is short, stakes are high, and communication has to be both clear and human."],
      ["Strong-fit audiences", "Emergency departments, trauma teams, nursing students, novice nurses, clinical educators, and interdisciplinary healthcare groups."],
    ],
    cards: [
      ["Preparedness", "Readiness is built before the room gets loud."],
      ["Priorities", "Clinical focus starts with what matters first."],
      ["Team communication", "The room works better when roles and language are clear."],
      ["After the event", "Teams need recovery, debriefing, and learning."],
    ],
    faqs: [
      { q: "What can non-ED teams learn from emergency nursing?", a: "Emergency nursing offers lessons in priorities, communication, role clarity, preparation, teamwork, and recovery that apply across many healthcare settings." },
      { q: "Is this topic only for emergency departments?", a: "No. It can be adapted for nursing students, interdisciplinary teams, educators, leaders, and any healthcare group working under pressure." },
      ...sharedFaq,
    ],
    related: articleLinks(["Emergency and Trauma Nursing"], 9),
  },
  {
    slug: "audiences/nursing-schools",
    title: "Speaker for Nursing Schools and Nursing Students | Josette Perrone",
    description:
      "Book Josette Perrone for nursing school events, student programs, faculty development, clinical judgment sessions, and professional identity talks.",
    eyebrow: "Audience: nursing schools",
    h1: "Speaking for nursing students, faculty, and emerging clinicians.",
    lede:
      "Josette helps nursing school audiences connect clinical judgment, confidence, mentorship, communication, boundaries, and professional identity with the real pressures students and novice nurses will face.",
    image: "/assets/speaker/nurse-educator-workshop.png",
    proof: ["Nursing students", "Faculty", "Preceptors", "Clinical judgment", "Professional identity"],
    sections: [
      ["Student sessions", "Topics can support confidence, communication, boundaries, advocacy, clinical judgment, and the transition from student to clinician."],
      ["Faculty and preceptor sessions", "Topics can support student-centered teaching, practical feedback, simulation, role play, and psychologically safer learning environments."],
      ["Strong-fit events", "Pinning ceremonies, student conferences, leadership days, clinical preparation events, faculty development, and nurse residency transition programs."],
    ],
    cards: [
      ["Clinical judgment", "Help students think through real decisions."],
      ["Confidence", "Build voice without encouraging overconfidence."],
      ["Boundaries", "Prepare students for workplace realities."],
      ["Mentorship", "Connect growth with sustainable identity."],
    ],
    faqs: [
      { q: "Can Josette speak to nursing students?", a: "Yes. Her background as a clinical nurse educator and emergency/trauma nurse makes her a strong fit for student and novice nurse audiences." },
      { q: "Can Josette speak to faculty or preceptors?", a: "Yes. Sessions can be shaped around clinical judgment, feedback, student confidence, simulation, mentorship, and safe learning environments." },
      ...sharedFaq,
    ],
    related: articleLinks(["Nursing Education", "Mentorship and Career Growth"], 9),
  },
  {
    slug: "audiences/hospitals-health-systems",
    title: "Healthcare Speaker for Hospitals and Health Systems | Josette Perrone",
    description:
      "Book Josette Perrone for hospital and health system events on burnout, resilience, communication, team safety, leadership, and nursing professional development.",
    eyebrow: "Audience: hospitals and health systems",
    h1: "Speaking for hospital teams that need practical language for hard work.",
    lede:
      "Josette's sessions help hospital and health system audiences discuss burnout, safety, communication, advocacy, leadership, and recovery in a way that respects clinical reality.",
    image: "/assets/speaker/clinical-team-corridor.png",
    proof: ["Hospitals", "Health systems", "Staff development", "Leadership programs", "Nurses Week"],
    sections: [
      ["Hospital staff development", "Sessions can support nurse well-being, communication, team safety, retention, professional identity, and leadership conversations."],
      ["Leadership and culture", "Talks can help leaders ask better questions about burnout, safety, communication, and what teams are being asked to normalize."],
      ["Strong-fit events", "Nurses Week, leadership retreats, professional development days, nurse residency programs, interdisciplinary team events, and conference breakouts."],
    ],
    cards: [
      ["Burnout and retention", "Support people before they disengage."],
      ["Communication and safety", "Improve the daily behaviors that shape team trust."],
      ["Nursing growth", "Help novice and experienced nurses stay connected to purpose."],
      ["Leadership listening", "Translate staff signals into action."],
    ],
    faqs: [
      { q: "Is Josette a fit for hospital professional development?", a: "Yes. Her topics are built for healthcare teams, nursing groups, leadership programs, workforce development, and staff events." },
      { q: "Can topics be customized for a health system?", a: "Yes. Inquiry details about the audience, goals, event format, and current pressure points help shape the session." },
      ...sharedFaq,
    ],
    related: articleLinks(["Burnout and Resilience", "Healthcare Worker Safety", "Clinical Communication"], 9),
  },
];

const absolutePath = (slug) => `/${slug}`;

function schemaFor(page) {
  const url = `${baseUrl}${absolutePath(page.slug)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        name: page.title,
        url,
        description: page.description,
        isPartOf: { "@id": `${baseUrl}/#website` },
        about: { "@id": `${baseUrl}/#josette-perrone` },
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: page.h1,
        provider: { "@id": `${baseUrl}/#josette-perrone` },
        serviceType: "Healthcare keynote speaking and professional development workshops",
        areaServed: "United States",
        audience: page.proof.map((item) => ({ "@type": "Audience", audienceType: item })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
          { "@type": "ListItem", position: 2, name: page.eyebrow.replace(/^Topic: |^Audience: /, ""), item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };
}

function cardGrid(cards) {
  return cards
    .map(
      ([title, text], index) => `<article class="topic-card${index === 0 ? " featured" : ""}">
            <span class="topic-number">${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(text)}</p>
          </article>`,
    )
    .join("\n          ");
}

function relatedGrid(related) {
  return related
    .map(
      (item) => `<article class="topic-card">
            <span class="topic-number">${escapeHtml(item.kicker)}</span>
            <h3><a href="${escapeHtml(item.href)}">${escapeHtml(item.title)}</a></h3>
            <p>${escapeHtml(item.text)}</p>
          </article>`,
    )
    .join("\n          ");
}

function faqGrid(faqs) {
  return faqs
    .map(
      (faq) => `<article>
            <h3>${escapeHtml(faq.q)}</h3>
            <p>${escapeHtml(faq.a)}</p>
          </article>`,
    )
    .join("\n          ");
}

function sectionsMarkup(sections) {
  return sections
    .map(
      ([title, text]) => `<article class="timeline-card">
            <span>${escapeHtml(title)}</span>
            <p>${escapeHtml(text)}</p>
          </article>`,
    )
    .join("\n          ");
}

function renderPage(page) {
  const url = `${baseUrl}${absolutePath(page.slug)}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="author" content="Josette Perrone" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${baseUrl}/assets/brand/og-josette-perrone-contrast.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Josette Perrone healthcare speaker preview graphic" />
    <meta property="og:site_name" content="Josette Perrone" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <meta name="twitter:image" content="${baseUrl}/assets/brand/og-josette-perrone-contrast.png" />
    <meta name="theme-color" content="#0d7c78" />
    <link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/assets/brand/favicon-32.png" sizes="32x32" type="image/png" />
    <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css?v=20260528-speaker-seo" />
    <script type="application/ld+json">${JSON.stringify(schemaFor(page), null, 2)}</script>
  </head>
  <body>
    <header class="site-header" data-header>
      <a class="brand" href="/" aria-label="Josette Perrone home">
        <span class="brand-mark">JP</span>
        <span><strong>Josette Perrone</strong><small>DNP, FNP-C, RN</small></span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
        <span></span><span></span><span></span><span class="sr-only">Menu</span>
      </button>
      <nav class="site-nav" id="site-nav" data-nav>
        <a href="/healthcare-speaker">Healthcare Speaker</a>
        <a href="/nursing-speaker">Nursing Speaker</a>
        <a href="/keynotes-workshops">Topics</a>
        <a href="/blog/">Blog</a>
        <a href="/#booking">Booking</a>
      </nav>
    </header>
    <main>
      <section class="hero section chevron-section">
        <aside class="hero-visual parallax-frame" aria-label="${escapeHtml(page.eyebrow)}">
          <img src="${escapeHtml(page.image)}" alt="Josette Perrone healthcare speaker" data-parallax-speed="0.12" />
        </aside>
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.h1)}</h1>
          <p class="hero-lede">${escapeHtml(page.lede)}</p>
          <div class="hero-actions">
            <a class="button primary" href="/#booking">Book Josette to Speak</a>
            <a class="button secondary" href="/keynotes-workshops">View Keynotes and Workshops</a>
          </div>
        </div>
      </section>
      <div class="proof-band" aria-label="Audience fit">
        ${page.proof.map((item) => `<span>${escapeHtml(item)}</span>`).join("\n        ")}
      </div>
      <section class="section experience-section">
        <div class="section-heading">
          <p class="eyebrow">How this helps</p>
          <h2>Practical, clinically grounded, and built for real teams.</h2>
        </div>
        <div class="timeline-grid">
          ${sectionsMarkup(page.sections)}
        </div>
      </section>
      <section class="section topic-section chevron-section">
        <div class="section-heading">
          <p class="eyebrow">Session angles</p>
          <h2>Useful ways to shape the conversation.</h2>
        </div>
        <div class="topic-grid">
          ${cardGrid(page.cards)}
        </div>
      </section>
      <section class="section answer-section" aria-labelledby="faq-title">
        <div class="section-heading">
          <p class="eyebrow">Quick answers</p>
          <h2 id="faq-title">For planners comparing speakers.</h2>
        </div>
        <div class="answer-grid">
          ${faqGrid(page.faqs)}
        </div>
      </section>
      <section class="section topic-section">
        <div class="section-heading">
          <p class="eyebrow">Related reading</p>
          <h2>Clinical writing connected to this topic.</h2>
        </div>
        <div class="topic-grid">
          ${relatedGrid(page.related)}
        </div>
      </section>
      <section class="section blog-preview-section chevron-section">
        <div class="section-heading">
          <p class="eyebrow">Booking inquiries</p>
          <h2>Bring Josette to your next healthcare event.</h2>
          <p class="hero-lede">Share the event type, audience, format, date, location, desired topic, and what you want the room to leave with.</p>
          <a class="button primary" href="/#booking">Start a Booking Inquiry</a>
        </div>
        <figure class="image-tile blog-preview-image parallax-frame">
          <img src="/assets/speaker/conference-lobby-conversation.png" alt="Josette Perrone in a professional conference conversation" />
        </figure>
      </section>
    </main>
    <footer class="site-footer">
      <div>
        <strong>Josette Perrone, DNP, FNP-C, RN</strong>
        <p>Nurse Practitioner · Nurse Educator · Emergency/Trauma Clinician · Healthcare Speaker</p>
      </div>
      <a href="/#booking">Book Josette</a>
    </footer>
    <script src="/analytics.js"></script>
    <script src="/script.js"></script>
  </body>
</html>`;
}

for (const page of pages) {
  const file = path.join(root, `${page.slug}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, renderPage(page));
}

const sitemapPath = path.join(root, "sitemap.xml");
let sitemap = fs.readFileSync(sitemapPath, "utf8");
const newEntries = pages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${absolutePath(page.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page.slug.includes("/") ? "0.8" : "0.9"}</priority>
  </url>`,
  )
  .join("\n");

for (const page of pages) {
  const loc = `${baseUrl}${absolutePath(page.slug)}`;
  sitemap = sitemap.replace(new RegExp(`\\s*<url>\\s*<loc>${loc.replaceAll("/", "\\/")}<\\/loc>[\\s\\S]*?<\\/url>`, "g"), "");
}
sitemap = sitemap.replace("</urlset>", `${newEntries}\n</urlset>`);
fs.writeFileSync(sitemapPath, sitemap);

const llmsPath = path.join(root, "llms.txt");
let llms = fs.readFileSync(llmsPath, "utf8");
const added = `\n## Speaker booking and topic pages\n\n${pages
  .map((page) => `- ${baseUrl}${absolutePath(page.slug)} — ${page.h1}`)
  .join("\n")}\n\n## Canonical speaker summary\n\nJosette Perrone, DNP, MSN-Ed, FNP-C, RN is a healthcare and nursing speaker, family nurse practitioner, nurse educator, and emergency/trauma registered nurse. She speaks to healthcare conferences, hospitals, health systems, nursing schools, Nurses Week programs, leadership retreats, nurse residency programs, and professional development teams about nurse burnout, resilience, clinical communication, healthcare worker safety, nursing education, patient advocacy, advanced practice nursing, mentorship, and sustainable leadership.\n`;

llms = llms.replace(/\n## Speaker booking and topic pages[\s\S]*$/m, "");
llms = `${llms.trim()}\n${added}`;
fs.writeFileSync(llmsPath, llms);

const seoDir = path.join(root, "docs", "seo");
fs.mkdirSync(seoDir, { recursive: true });
const dashboardRows = articles.map((article) => ({
  url: `${baseUrl}/blog/${article.slug}`,
  title: article.title,
  cluster: article.category,
  primaryKeyword: article.title.toLowerCase(),
  intent: article.category.includes("Burnout")
    ? "professional development / speaker support"
    : article.category.includes("Education")
      ? "nursing education / academic speaker support"
      : article.category.includes("Safety") || article.category.includes("Communication")
        ? "team safety / communication speaker support"
        : "clinical leadership / speaker support",
  funnelStage: article.category === "Mentorship and Career Growth" ? "awareness" : "authority support",
  status: "keep and refresh",
  internalLinkTarget: `${baseUrl}${categoryTargets[article.category] ?? "/keynotes-workshops"}`,
  bookingLinkTarget: `${baseUrl}/#booking`,
  lastRefreshed: today,
  note: article.focus,
}));

const csvEscape = (value) => `"${String(value).replaceAll('"', '""')}"`;
const csvHeaders = [
  "url",
  "title",
  "cluster",
  "primaryKeyword",
  "intent",
  "funnelStage",
  "status",
  "internalLinkTarget",
  "bookingLinkTarget",
  "lastRefreshed",
  "note",
];
const csv = [
  csvHeaders.join(","),
  ...dashboardRows.map((row) => csvHeaders.map((key) => csvEscape(row[key])).join(",")),
].join("\n");
fs.writeFileSync(path.join(seoDir, "josette-content-dashboard.csv"), `${csv}\n`);

const byDashboardCluster = dashboardRows.reduce((map, row) => {
  map.set(row.cluster, (map.get(row.cluster) ?? 0) + 1);
  return map;
}, new Map());
const dashboardMd = `# Josette Perrone Content Dashboard

Generated: ${today}

This dashboard maps existing articles to SEO/AEO/GEO clusters and points each cluster back to a speaker or topic page.

## Cluster Counts

${[...byDashboardCluster.entries()].map(([cluster, count]) => `- ${cluster}: ${count}`).join("\n")}

## Landing Page Targets

${Object.entries(categoryTargets).map(([cluster, target]) => `- ${cluster}: ${baseUrl}${target}`).join("\n")}

## Workflow

- Keep one broad topic page as the canonical page for each cluster.
- Refresh individual blog posts as long-tail support pages.
- Add a visible booking CTA to high-traffic posts.
- Avoid creating new posts that target the same phrase as an existing category or topic page.

CSV source:
\`docs/seo/josette-content-dashboard.csv\`
`;
fs.writeFileSync(path.join(seoDir, "josette-content-dashboard.md"), dashboardMd);

let index = fs.readFileSync(path.join(root, "index.html"), "utf8");
index = index.replace(
  '<a href="#speaking">Speaking</a>\n        <a href="#topics">Topics</a>',
  '<a href="healthcare-speaker">Healthcare Speaker</a>\n        <a href="nursing-speaker">Nursing Speaker</a>\n        <a href="keynotes-workshops">Topics</a>',
);
index = index.replace(
  '<a class="button secondary" href="#topics">View Speaking Topics</a>',
  '<a class="button secondary" href="keynotes-workshops">View Speaking Topics</a>',
);
index = index.replace(
  "<h3>Burnout, Resilience, and Sustainable Work</h3>",
  '<h3><a href="topics/nurse-burnout-resilience">Burnout, Resilience, and Sustainable Work</a></h3>',
);
index = index.replace(
  "<h3>Teaching, Mentorship, and Clinical Judgment</h3>",
  '<h3><a href="topics/nursing-education">Teaching, Mentorship, and Clinical Judgment</a></h3>',
);
index = index.replace(
  "<h3>Communication Under Pressure</h3>",
  '<h3><a href="topics/healthcare-communication-safety">Communication Under Pressure</a></h3>',
);
fs.writeFileSync(path.join(root, "index.html"), index);

console.log(JSON.stringify({ ok: true, pages: pages.map((page) => page.slug) }, null, 2));
