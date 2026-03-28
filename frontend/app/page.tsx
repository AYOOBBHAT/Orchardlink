import Image from 'next/image';
import { HomeHeroContent } from './home-hero-content';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=3840&q=85';

export default function Home() {
  return (
    <section className="relative isolate min-h-screen w-full overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <HomeHeroContent />
    </section>
  );
}
