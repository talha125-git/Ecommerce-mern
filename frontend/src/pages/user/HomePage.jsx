import HeroSlider from "@/components/home/HeroSlider";
import AboutUs from "@/components/home/AboutUs";
import ProductList from "@/components/home/ProductList";

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-8">
        {/* 1. Hero Slider Banner */}
        <HeroSlider />

        {/* 2. Products List with Hot Products & New Arrivals */}
        <ProductList />

        {/* 3. About Us Section */}
        <AboutUs />
      </div>
    </div>
  );
}
