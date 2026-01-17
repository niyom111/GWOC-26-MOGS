import React from 'react';
import { motion as motionBase } from 'framer-motion';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

interface GalleryTeaserProps {
  onNavigate: () => void;
}

const GalleryTeaser: React.FC<GalleryTeaserProps> = ({ onNavigate }) => {
  const teaserImages = [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1945",
    "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1976",
    "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1974",
    "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1974",
  ];

  // Crossfade Logic
  const videoRef1 = React.useRef<HTMLVideoElement>(null);
  const videoRef2 = React.useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = React.useState<1 | 2>(1);
  const [isFading, setIsFading] = React.useState(false);

  const videoSrc = "/media/5009000-uhd_2160_3840_25fps.mp4";
  const CROSSFADE_DURATION = 1; // Seconds

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>, videoId: 1 | 2) => {
    if (videoId !== activeVideo || isFading) return;

    const video = e.currentTarget;
    const timeLeft = video.duration - video.currentTime;

    if (timeLeft <= CROSSFADE_DURATION) {
      setIsFading(true);
      const nextVideo = videoId === 1 ? videoRef2.current : videoRef1.current;

      if (nextVideo) {
        nextVideo.currentTime = 0;
        nextVideo.play().then(() => {
          setActiveVideo(videoId === 1 ? 2 : 1);
          setTimeout(() => {
            setIsFading(false);
            video.pause();
            video.currentTime = 0;
          }, CROSSFADE_DURATION * 1000);
        }).catch(err => console.log("Video play failed", err));
      }
    }
  };

  return (
    <section className="relative bg-black py-40 overflow-hidden">
      {/* 
          Dual Video System for Seamless Looping 
          We keep two videos. Only the 'active' one is fully visible.
          During transition, both are visible (opacity crossfade).
      */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef1}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${activeVideo === 1 ? 'opacity-100' : 'opacity-0'}`}
          src={videoSrc}
          autoPlay
          muted
          playsInline
          onTimeUpdate={(e) => handleTimeUpdate(e, 1)}
        />
        <video
          ref={videoRef2}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${activeVideo === 2 ? 'opacity-100' : 'opacity-0'}`}
          src={videoSrc}
          muted
          playsInline
          onTimeUpdate={(e) => handleTimeUpdate(e, 2)}
        />
      </div>

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/70 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 mb-20 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
        >
          <motion.span
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { duration: 0.8 } }
            }}
            className="text-[12px] uppercase tracking-[0.5em] text-zinc-400 mb-6 block"
          >
            Where Culture Distills
          </motion.span>

          <motion.h2
            variants={{
              hidden: { y: 40, opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } }
            }}
            className="text-6xl md:text-8xl font-serif text-[#F3EFE0] tracking-tighter mb-10 italic"
          >
            Coffee Meets Canvas.
          </motion.h2>

          <motion.button
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { duration: 0.8 } }
            }}
            onClick={onNavigate}
            className="px-10 py-4 border border-[#F3EFE0]/30 text-[#F3EFE0] text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#F3EFE0] hover:text-black transition-all"
          >
            Visit Gallery
          </motion.button>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="relative z-10 flex space-x-4 animate-marquee">
        <motion.div
          className="flex space-x-6 px-10"
          // Loop Distance Calculation:
          // Item Width (280px) + Gap (24px) = 304px
          // 4 Unique Items * 304px = 1216px
          animate={{ x: [0, -1216] }}
          transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
        >
          {/* Tripled array ensures we always have content filling the screen while scrolling */}
          {[...teaserImages, ...teaserImages, ...teaserImages].map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] h-[500px] overflow-hidden transition-all cursor-pointer group"
            >
              <img
                src={img}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Art Piece"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default GalleryTeaser;
