import Head from "next/head";
import { Link } from "react-scroll";
import About from "./components/About";
import Contact from "./components/Contact";
import Home from "./components/Home";
import ParticlesBackground from "./components/ParticlesBackground";
// import CursorCracks from "./components/CursorCracks";

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>Personal Portfolio</title>
      </Head>

      <header className="fixed top-0 z-10 w-full p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow">
        {/* <header className="fixed top-0 z-10 w-full p-4 bg-white shadow"> */}
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
        {/* <CursorCracks /> */}
        {/* <ParticlesBackground /> */}
        <section id="appointmentletter">
          <a
            href="/AppointmentLetter.pdf"
            download
            className="flex items-center justify-center w-full h-screen bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900"
          >
            <h1 className="text-5xl font-bold text-white">
              Appointment Letter
            </h1>
          </a>
        </section>
        <section id="handbook">
          <a
            href="/EmployeeHandbook.pdf"
            download
            className="flex items-center justify-center w-full h-screen bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900"
          >
            <h1 className="text-5xl font-bold text-white">
              Appointment Letter
            </h1>
          </a>
        </section>
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
