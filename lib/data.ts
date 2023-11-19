export const NAV_LINKS = [
  { title: "Home", href: "/" },
  { title: "About", href: "#about" },
  { title: "Projects", href: "#projects" },
  { title: "Contact", href: "#contact" },
] as const;
//
export const PROJECTS = [
  {
    id: 0,
    title: "Twit-X-Clone",
    description: "A Next.js project",
    tags: ["TypeScript", "Next.js"],
    image: "/twit-x-clone.png", // Replace with actual image path
    githubUrl: "https://github.com/KaushikRishabh/twit-x-clone",
    category: ["All", "Web"],
    releaseDate: "Unknown", // Replace with actual date
  },
  {
    id: 1,
    title: "YouTube Clone React",
    description: "A Next.js project",
    tags: ["TypeScript", "Next.js", "SCSS"],
    image: "/youtube-clone.png", // Replace with actual image path
    githubUrl: "https://github.com/KaushikRishabh/youtube-clone-react",
    category: ["All", "Web"],
    releaseDate: "Unknown", // Replace with actual date
  },
  {
    id: 2,
    title: "Shoply",
    description: "Ecom store + marketplace for buying and selling products",
    tags: ["TypeScript", "Next.js", "Tailwind"],
    image: "/shoply.png", // Replace with actual image path
    githubUrl: "https://github.com/KaushikRishabh/shoply",
    category: ["All", "Web"],
    releaseDate: "Unknown", // Replace with actual date
  },
  // {
  //   id: 3,
  //   title: "Calendler Clone",
  //   description: "React + Vite template",
  //   tags: ["React", "Vite"], // Assumed based on description
  //   image: "/placeholder-image.png", // Replace with actual image path
  //   githubUrl: "https://github.com/KaushikRishabh/calendler-clone",
  //   category: ["All", "Web"],
  //   releaseDate: "Unknown", // Replace with actual date
  // },
  {
    id: 4,
    title: "Promodoro",
    description: "Pomodoro Timer",
    tags: ["React", "javascript"], // Assumed based on description
    image: "/promodoro.png", // Replace with actual image path
    githubUrl: "https://github.com/KaushikRishabh/promodoro",
    category: ["All", "Web"],
    releaseDate: "Unknown", // Replace with actual date
  },
  // ... other projects ...
] as const;

export const TAB_DATA = [
  {
    title: "Skills",
    id: "skills",
    content: ["React", "JavaScript", "TypeScript", "Next.js"],
  },
  {
    title: "Education",
    id: "education",
    content: ["Bacherlor of Engineering in Computer Science, from AKTU, India"],
  },
  // {
  //   title: "Certifications",
  //   id: "certifications",
  //   content: ["Advanced React Developer Certification"],
  // },
] as const;
