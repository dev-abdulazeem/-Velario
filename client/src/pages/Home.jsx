import HeroCarousel from '../components/HeroCarousel'
import CategoryCards from '../components/CategoryCards'
import FeaturedSection from '../components/FeaturedSection'
import ProductGrid from '../components/ProductGrid'

export default function Home() {
  return (
    <div className="animate-fade-in">
      <HeroCarousel />
      <CategoryCards />
      <FeaturedSection />
      <ProductGrid title="BEST SELLERS" limit={8} />
    </div>
  )
}