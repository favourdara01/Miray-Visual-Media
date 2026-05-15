import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Team from "../components/Team";
import Services from "../components/Services";
import GalleryPreview from "../components/Gallery";
import Booking from "../components/Booking";
import Footer from "../components/Footer";
import Contact from "../components/Contact";
import Pricing from "../components/Pricing";

const Home = () => {
  return (
    <div className="text-black bg-white dark:bg-black dark:text-white">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Team />
      <GalleryPreview />
      <Pricing />
      <Booking />
      <Contact/>
      <Footer />
    </div>
  );
};

export default Home;