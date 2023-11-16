import Link from "next/link";
import {
  AiFillLinkedin,
  AiOutlineGithub,
  AiOutlineInstagram,
  AiOutlineMail,
  AiOutlineInbox,
} from "react-icons/ai";
import { FaThreads } from "react-icons/fa6";

const SocialLinkItems = [
  {
    title: "GitHub",
    icon: <AiOutlineGithub />,
    href: "https://github.com/kaushikrishabh",
  },
  {
    title: "Threads",
    icon: <FaThreads />,
    href: "https://instagram.com/0xkaushikk",
  },
  {
    title: "LinkedIn",
    icon: <AiFillLinkedin />,
    href: "https://linkedin.com/in/rishabh-kaushik-4206531b8/",
  },
  // {
  //   title: "Blog",
  //   icon: <AiOutlineInbox />,
  //   href: "https://rishabhkaushik.dev",
  // },
];

const SocialLinks = () => {
  return (
    <ul className="flex flex-row gap-4 text-2xl my-6 items-center justify-center w-full lg:w-fit">
      {SocialLinkItems.map((item) => (
        <li
          key={item.title}
          className="rounded-full border-2 shadow-md p-3 w-fit h-fit hover:bg-gradient-to-br hover:from-primary-500 hover:to-secondary-500 hover:text-white group relative"
        >
          <Link href={item.href}>{item.icon}</Link>
          <span className="absolute z-20 top-14 scale-0 transition-all rounded border text-xs p-1.5 group-hover:scale-100 text-black dark:text-white">
            {item.title}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default SocialLinks;
