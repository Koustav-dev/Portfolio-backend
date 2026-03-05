import { PrismaClient, ProjectCategory, SkillCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin ──────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.admin.upsert({
    where: { email: "hello@eraf.dev" },
    update: {},
    create: {
      email: "hello@eraf.dev",
      passwordHash,
      name: "Koustav Paul",
    },
  });
  console.log("✓ Admin created");

  // ── Projects ───────────────────────────────────────────────────
  const projects = [
    {
      title: "Aura Motion Portfolio",
      slug: "aura-motion-portfolio",
      description: "A visually immersive personal portfolio with physics-based animations, custom cursor, and smooth section transitions.",
      longDescription: "Built with React, TypeScript, Framer Motion, and Three.js. Features a custom WebGL background, magnetic cursor, staggered reveal animations, and a fully responsive dark/light theme system.",
      techStack: ["React", "TypeScript", "Framer Motion", "Three.js", "Tailwind CSS", "Vite"],
      category: ProjectCategory.WEB,
      featured: true,
      order: 1,
      liveUrl: "https://aura-motion.vercel.app",
      githubUrl: "https://github.com/Koustav-dev/aura-motion",
    },
    {
      title: "Dev Dashboard",
      slug: "dev-dashboard",
      description: "A real-time developer productivity dashboard with GitHub stats, task management, and Pomodoro timer.",
      longDescription: "Full-stack application using Next.js App Router, tRPC, PostgreSQL, and Prisma. Features real-time updates via Server-Sent Events, OAuth authentication, and a mobile-first UI.",
      techStack: ["Next.js", "TypeScript", "tRPC", "PostgreSQL", "Prisma", "NextAuth"],
      category: ProjectCategory.WEB,
      featured: true,
      order: 2,
      liveUrl: "https://devdash.vercel.app",
      githubUrl: "https://github.com/Koustav-dev/dev-dashboard",
    },
    {
      title: "AI Writing Assistant",
      slug: "ai-writing-assistant",
      description: "An AI-powered writing tool with real-time suggestions, tone analysis, and document export features.",
      longDescription: "Integrates OpenAI GPT-4 API with a custom streaming interface. Built with React, Node.js, and Socket.io for live token streaming. Includes a rich text editor with slash commands.",
      techStack: ["React", "Node.js", "OpenAI API", "Socket.io", "TipTap", "MongoDB"],
      category: ProjectCategory.AI,
      featured: true,
      order: 3,
      liveUrl: "https://aiwriter.vercel.app",
      githubUrl: "https://github.com/Koustav-dev/ai-writer",
    },
    {
      title: "E-Commerce Platform",
      slug: "ecommerce-platform",
      description: "A full-featured e-commerce platform with cart, checkout, payment integration, and admin panel.",
      longDescription: "Built with Next.js, Stripe, Sanity CMS, and Tailwind. Features optimistic UI updates, server-side rendering for SEO, image optimization, and a complete order management system.",
      techStack: ["Next.js", "Stripe", "Sanity CMS", "Tailwind CSS", "Prisma", "PostgreSQL"],
      category: ProjectCategory.WEB,
      featured: false,
      order: 4,
      liveUrl: "https://shop.vercel.app",
      githubUrl: "https://github.com/Koustav-dev/ecommerce",
    },
    {
      title: "Motion UI Kit",
      slug: "motion-ui-kit",
      description: "A reusable component library with 30+ animated React components built on Framer Motion.",
      longDescription: "Open-source component library featuring physics-based animations, gesture interactions, and accessible motion preferences. Published on npm with full TypeScript support and Storybook docs.",
      techStack: ["React", "TypeScript", "Framer Motion", "Storybook", "Rollup", "npm"],
      category: ProjectCategory.DESIGN,
      featured: false,
      order: 5,
      liveUrl: "https://motion-kit.vercel.app",
      githubUrl: "https://github.com/Koustav-dev/motion-kit",
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }
  console.log("✓ Projects seeded");

  // ── Experience ─────────────────────────────────────────────────
  const experiences = [
    {
      company: "Freelance",
      role: "Full-Stack Developer & UI Engineer",
      description: "Designing and building high-performance web applications for clients across SaaS, e-commerce, and creative industries. Specializing in React ecosystems, motion design, and Node.js backends.",
      startDate: new Date("2023-01-01"),
      endDate: null,
      techUsed: ["React", "TypeScript", "Node.js", "Framer Motion", "PostgreSQL"],
      order: 1,
    },
    {
      company: "Tech Startup (Remote)",
      role: "Frontend Developer",
      description: "Led frontend architecture for a B2B SaaS platform serving 10k+ users. Built a design system from scratch, reduced bundle size by 40%, and implemented real-time collaboration features.",
      startDate: new Date("2022-03-01"),
      endDate: new Date("2022-12-31"),
      techUsed: ["React", "TypeScript", "Zustand", "TailwindCSS", "Vite"],
      order: 2,
    },
    {
      company: "Digital Agency",
      role: "Web Developer Intern",
      description: "Developed client-facing websites and landing pages. Collaborated with designers to implement pixel-perfect UIs and micro-interactions using GSAP and CSS animations.",
      startDate: new Date("2021-06-01"),
      endDate: new Date("2022-02-28"),
      techUsed: ["HTML/CSS", "JavaScript", "GSAP", "WordPress", "PHP"],
      order: 3,
    },
  ];

  for (const [i, exp] of experiences.entries()) {
    await prisma.experience.upsert({
      where: { id: `seed-exp-${i}` },
      update: exp,
      create: { id: `seed-exp-${i}`, ...exp },
    });
  }
  console.log("✓ Experience seeded");

  // ── Skills ─────────────────────────────────────────────────────
  const skills = [
    // Frontend
    { name: "React",          category: SkillCategory.FRONTEND, proficiency: 95, icon: "react" },
    { name: "TypeScript",     category: SkillCategory.FRONTEND, proficiency: 90, icon: "typescript" },
    { name: "Next.js",        category: SkillCategory.FRONTEND, proficiency: 88, icon: "nextjs" },
    { name: "Tailwind CSS",   category: SkillCategory.FRONTEND, proficiency: 92, icon: "tailwind" },
    { name: "Framer Motion",  category: SkillCategory.FRONTEND, proficiency: 85, icon: "framer" },
    // Backend
    { name: "Node.js",        category: SkillCategory.BACKEND,  proficiency: 82, icon: "nodejs" },
    { name: "Express.js",     category: SkillCategory.BACKEND,  proficiency: 80, icon: "express" },
    { name: "PostgreSQL",     category: SkillCategory.BACKEND,  proficiency: 75, icon: "postgresql" },
    { name: "Prisma",         category: SkillCategory.BACKEND,  proficiency: 78, icon: "prisma" },
    // Design
    { name: "UI/UX Design",   category: SkillCategory.DESIGN,   proficiency: 88, icon: "figma" },
    { name: "Motion Design",  category: SkillCategory.DESIGN,   proficiency: 85, icon: "ae" },
    // Tools
    { name: "Git & GitHub",   category: SkillCategory.TOOLS,    proficiency: 90, icon: "git" },
    { name: "Docker",         category: SkillCategory.TOOLS,    proficiency: 70, icon: "docker" },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { id: `seed-skill-${skill.name}` },
      update: skill,
      create: { id: `seed-skill-${skill.name}`, ...skill },
    });
  }
  console.log("✓ Skills seeded");

  // ── Site Config ────────────────────────────────────────────────
  const configs = [
    {
      key: "hero",
      value: {
        headline: "I craft digital",
        headlineAccent: "experiences",
        subline: "Full-Stack Developer & UI Engineer crafting aura-driven web experiences.",
        cta: "See my work",
        ctaSecondary: "Let's Talk",
      },
    },
    {
      key: "about",
      value: {
        bio: "I'm Koustav Paul — a full-stack developer and UI engineer who obsesses over the intersection of clean code and beautiful motion. I build fast, accessible, and visually compelling web experiences.",
        bio2: "When I'm not pushing pixels or writing TypeScript, I'm exploring generative art, contributing to open source, and chasing the perfect animation curve.",
        location: "India",
        available: true,
      },
    },
    {
      key: "social",
      value: {
        github:    "https://github.com/Koustav-dev",
        linkedin:  "https://linkedin.com/in/koustavpaul",
        twitter:   "https://twitter.com/koustavpaul",
        instagram: "https://instagram.com/koustavpaul",
        email:     "hello@eraf.dev",
      },
    },
    {
      key: "resume",
      value: {
        url: "/resume-koustav-paul.pdf",
        updatedAt: new Date().toISOString(),
      },
    },
  ];

  for (const config of configs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }
  console.log("✓ Site config seeded");

  console.log("\n🎉 Seeding complete!");
  console.log("📧 Admin email:    hello@eraf.dev");
  console.log("🔑 Admin password: admin123  (change immediately!)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
