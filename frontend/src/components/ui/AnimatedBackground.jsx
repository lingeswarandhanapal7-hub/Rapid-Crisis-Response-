import MountainVistaParallax from './mountain-vista-bg';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden bg-[#b2f2fc] pointer-events-none">
      <MountainVistaParallax />
    </div>
  )
}
