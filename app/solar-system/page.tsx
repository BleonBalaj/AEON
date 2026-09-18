import type { Metadata } from 'next';
import SolarSystemClient from './page-client';

export const metadata: Metadata = {
  title: 'Solar System Observatory — AEON',
  description:
    'Explore the 3D celestial bodies of our planetary system with real NASA imagery, orbital mechanics, and planetary science data.',
};

export const dynamic = 'force-static';

export default function SolarSystemPage() {
  return <SolarSystemClient />;
}
