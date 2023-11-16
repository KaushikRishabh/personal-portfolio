export const NAV_LINKS = [
  { title: "Home", href: "/" },
  { title: "About", href: "#about" },
  { title: "Projects", href: "#projects" },
  { title: "Contact", href: "#contact" },
] as const;

// export const PROJECTS = [
//   {
//     id: 0,
//     title: "북적북적",
//     description: "읽은 책의 후기를 남길 수 있는 서비스",
//     tags: ["React", "JavaScript"],
//     image: "/book-book.png",
//     githubUrl: "https://github.com/woongsnote/bookbook-fe",
//     category: ["All", "Web"],
//     releaseDate: "2022-09-11",
//   },
//   {
//     id: 1,
//     title: "방구석 평론가",
//     description: "영화에 관한 검색 및 후기를 남길 수 있는 커뮤니티",
//     tags: ["React", "JavaScript"],
//     image: "/movie-critic.png",
//     githubUrl: "https://github.com/woongsnote/movie-critic-fe",
//     category: ["All", "Web"],
//     releaseDate: "2022-10-22",
//   },
//   {
//     id: 2,
//     title: "Toodos",
//     description: "추천 검색어 기능 추가 및 코드 개선 과제",
//     tags: ["React", "TypeScript"],
//     image: "/toodos.png",
//     githubUrl: "https://github.com/woongsnote/pre-onboarding-10th-4-10",
//     category: ["All", "Web"],
//     releaseDate: "2023-05-23",
//   },
//   {
//     id: 3,
//     title: "기술 블로그",
//     description: "개발 관련 학습한 지식을 기록하고, 공유하는 블로그",
//     tags: ["Next.js", "TypeScript"],
//     image: "/tech-blog.png",
//     githubUrl: "https://github.com/woongsnote/woongsnote-dev",
//     category: ["All", "Web"],
//     releaseDate: "2023-04-07",
//   },
//   {
//     id: 4,
//     title: "MDX Blog Template",
//     description: "ContentLayer 블로그 구현을 위한 템플릿",
//     tags: ["Next.js", "ContentLayer"],
//     image: "/mdx-template.png",
//     githubUrl: "https://github.com/woongsnote/mdx-blog",
//     category: ["All", "Web"],
//     releaseDate: "2023-08-15",
//   },
//   {
//     id: 5,
//     title: "Mini Pick",
//     description: "블로그 포스팅에 유용한 섬네일 생성기",
//     tags: ["Next.js", "TypeScript"],
//     image: "/mini-pick.png",
//     githubUrl: "https://github.com/woongsnote/image-generator",
//     category: ["All", "Web"],
//     releaseDate: "2023-08-30",
//   },
// ] as const;
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
