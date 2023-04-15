import Head from "next/head";
import { Link } from "react-scroll";
import About from "./components/About";
import Contact from "./components/Contact";
import Home from "./components/Home";

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>Personal Portfolio</title>
      </Head>

      <header className="fixed top-0 z-10 w-full p-4 bg-white shadow">
        <nav className="flex items-center justify-end space-x-4">
          <Link
            to="home"
            smooth={true}
            duration={500}
            className="cursor-pointer"
          >
            Home
          </Link>
          <Link
            to="about"
            smooth={true}
            duration={500}
            className="cursor-pointer"
          >
            About
          </Link>
          <Link
            to="contact"
            smooth={true}
            duration={500}
            className="cursor-pointer"
          >
            Contact
          </Link>
        </nav>
      </header>

      <main>
        <section id="home">
          <Home />
        </section>
        <section id="about">
          <About />
        </section>
        <section id="contact">
          <Contact />
        </section>
      </main>
    </div>
  );
}
