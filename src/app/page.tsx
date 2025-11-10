import SpaceBackground from '@/components/SpaceBackground';
import Navbar from '@/components/Navbar';
import NiyatVideoShayari from '@/components/NiyatVideoShayari';
import MehfilGallery from '@/components/mehfil';
import Gallery from '@/components/gallery';
import Ticket from '@/components/Ticket';

export default function Home() {
  return (
    <main>
      <Navbar />
      <SpaceBackground />
      <NiyatVideoShayari />
      <MehfilGallery />
      <Gallery />
      <Ticket />
    </main>
  );
}