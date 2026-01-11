import Navbar from "./Navbar";
import Footer from "./Footer";

const HomeLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default HomeLayout;
