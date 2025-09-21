import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, X, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import waveImage from '@/assets/presentation-wave.jpg';
import walkoutImage from '@/assets/presentation-walkout.jpg';
import queueImage from '@/assets/presentation-queue.jpg';
import clinicianImage from '@/assets/presentation-clinician.jpg';
import interfaceImage from '@/assets/presentation-interface.jpg';
import gpInboxImage from '@/assets/presentation-gp-inbox.jpg';
import networkImage from '@/assets/presentation-network.jpg';
import homepageImage from '@/assets/presentation-homepage.jpg';
import homePageImage from '@/assets/presentation-home-page.jpg';

interface Slide {
  id: number;
  title?: string;
  content?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textOverlay?: {
    text: string;
    position: 'center' | 'bottom-left' | 'top-right';
    style?: React.CSSProperties;
  };
}

const slides: Slide[] = [
  {
    id: 1,
    title: "The Wave",
    content: "MedicAI - Rising Above Complexity",
    backgroundImage: waveImage,
    textOverlay: {
      text: "",
      position: 'center',
      style: {
        fontSize: '3rem',
        fontWeight: '500',
        letterSpacing: '0.1em',
        textShadow: '2px 2px 20px rgba(0,0,0,0.8)',
      }
    }
  },
  {
    id: 2,
    title: "The Exodus",
    content: "Healthcare Burnout Crisis",
    backgroundImage: walkoutImage,
    textOverlay: {
      text: "they're leaving.",
      position: 'center',
      style: {
        fontSize: '3.5rem',
        fontWeight: '400',
        letterSpacing: '0.05em',
        textShadow: '2px 2px 20px rgba(0,0,0,0.9)',
        textTransform: 'lowercase',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }
    }
  },
  {
    id: 3,
    title: "The Bottleneck",
    content: "Healthcare System Strain", 
    backgroundImage: queueImage,
    textOverlay: {
      text: "the line is growing.",
      position: 'center',
      style: {
        fontSize: '3.5rem',
        fontWeight: '400',
        letterSpacing: '0.05em',
        textShadow: '2px 2px 20px rgba(0,0,0,0.9)',
        textTransform: 'lowercase',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }
    }
  },
  {
    id: 4,
    title: "The Solution",
    content: "MedicAI Response",
    backgroundImage: clinicianImage,
  },
  {
    id: 5,
    title: "The Reality",
    content: "Documentation Burden", 
    backgroundImage: gpInboxImage,
    textOverlay: {
      text: "70% of GPs and specialists report documentation as a significant pain point\n\n88.9% of GPs believe reducing documentation burden would help them better manage the rising patient-to-doctor ratio\n\nClinicians aren't resisting change — they're asking for help.",
      position: 'center',
      style: {
        fontSize: '1.8rem',
        fontWeight: '400',
        letterSpacing: '0.02em',
        textShadow: '2px 2px 20px rgba(0,0,0,0.8)',
        textTransform: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.6',
        whiteSpace: 'pre-line'
      }
    }
  },
  {
    id: 6,
    title: "The Platform",
    content: "MedicAI Interface",
    backgroundImage: interfaceImage,
  },
  {
    id: 7,
    title: "The Network",
    content: "Healthcare Digital Ecosystem",
    backgroundImage: networkImage,
    textOverlay: {
      text: "100 million+ referrals, medical and care certificates issued annually.\n60,000GPs+specialists in Australia.\nWe're embedding into the platforms they already use — so every patient sees:\n\n\"Book here for your needs — powered by MedicAi.\"",
      position: 'center',
      style: {
        fontSize: '1.6rem',
        fontWeight: '400',
        letterSpacing: '0.02em',
        textShadow: '2px 2px 20px rgba(0,0,0,0.8)',
        textTransform: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.5',
        whiteSpace: 'pre-line'
      }
    }
  },
  {
    id: 8,
    title: "",
    content: "",
    textOverlay: {
      text: "Welcome to MedicAi\nWelcome to the new front door of care.\n\nFor patients, it's simple.\nFor doctors, it's secure.\nFor care, it's finally connected.",
      position: 'center',
      style: {
        fontSize: '1.8rem',
        fontWeight: '400',
        letterSpacing: '0.02em',
        textShadow: 'none',
        textTransform: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.5',
        whiteSpace: 'pre-line'
      }
    }
  },
  {
    id: 9,
    backgroundColor: 'linear-gradient(135deg, #8E1E5A 0%, #A41759 100%)',
    backgroundImage: '/lovable-uploads/750743ad-ff2a-4a8c-acd9-5c7e27827b89.png',
    textOverlay: {
      text: "Why I think I can do well in this space.\n\nI am the domain expert. Medicine. Business. Vibe Coding\n\nThis wasn't built by a startup. It was built by a GP.\n\nI built MedicAi because I was drowning in paperwork, admin, and missed time with patients.\n\nI didn't want to become more efficient — I wanted to feel like a doctor again.\n\nSo I created a platform that combines medical precision, AI speed, and human oversight — because care needs all three.\n\nI'm still practising. I built this because I needed it too.",
      position: 'bottom-left',
      style: {
        fontSize: '1.5rem',
        fontWeight: '400',
        letterSpacing: '0.02em',
        color: 'white',
        textShadow: '2px 2px 20px rgba(0,0,0,0.3)',
        textTransform: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.6',
        whiteSpace: 'pre-line'
      }
    }
  },
  {
    id: 10,
    title: "Thank You",
    content: "Thank you. MedicAI",
    backgroundColor: '#000000',
    textOverlay: {
      text: "Thank you.\n\nMedicAI",
      position: 'center',
      style: {
        fontSize: '4rem',
        fontWeight: '300',
        letterSpacing: '0.1em',
        color: 'white',
        textAlign: 'center',
        lineHeight: '1.2'
      }
    }
  },
  {
    id: 11,
    title: "Healthcare Strain",
    content: "The Reality",
    backgroundColor: '#1a1a1a',
    textOverlay: {
      text: "The strain on Australian healthcare is rising.\nEvery day, 6 GPs leave for good.\n\nPatient expectations are growing — pro digital-first, on-demand, coordinated care.\nClinics are expected to do more, with fewer hands and tighter margins.\n\nThe system may be breaking.\nMedicAI helps clinics rise above it.",
      position: 'center',
      style: {
        fontSize: '2rem',
        fontWeight: '400',
        letterSpacing: '0.02em',
        color: 'white',
        textAlign: 'center',
        lineHeight: '1.6',
        whiteSpace: 'pre-line'
      }
    }
  },
];

interface PresentationModeProps {
  isPresenting: boolean;
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ isPresenting, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isPresenting) return;
    
    switch (event.key) {
      case ' ':
      case 'ArrowRight':
        event.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        prevSlide();
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  }, [isPresenting, nextSlide, prevSlide, onClose]);

  useEffect(() => {
    if (isPresenting) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isPresenting, handleKeyPress]);

  if (!isPresenting) return null;

  const slide = slides[currentSlide];

  const getTextPosition = (position: string) => {
    switch (position) {
      case 'center':
        return 'absolute inset-0 flex items-center justify-center';
      case 'bottom-left':
        return 'absolute bottom-20 left-20';
      case 'top-right':
        return 'absolute top-20 right-20';
      default:
        return 'absolute inset-0 flex items-center justify-center';
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Controls Bar */}
      <div className="absolute top-4 right-4 flex gap-2 z-60">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
          {currentSlide + 1} / {slides.length}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 relative overflow-hidden">
        {slide.backgroundColor && (
          <div
            className="absolute inset-0"
            style={{ background: slide.backgroundColor }}
          />
        )}
        
        {slide.backgroundImage && slide.backgroundColor ? (
          /* Special handling for slide 9 - image on right with fading edges */
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/3 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${slide.backgroundImage})`,
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)'
            }}
          />
        ) : slide.backgroundImage && !slide.backgroundColor ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.backgroundImage})` }}
          />
        ) : !slide.backgroundColor && !slide.backgroundImage ? (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary" />
        ) : null}

        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />

        {/* MedicAI Branding - Always visible for slides 1, 2, 3, and 4 */}
        {(currentSlide === 0 || currentSlide === 1 || currentSlide === 2 || currentSlide === 3) && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-12 z-40">
          <h1 
            className="text-white text-8xl font-bold tracking-wider mb-8 text-center"
            style={{ 
              textShadow: '3px 3px 30px rgba(0,0,0,0.9)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            MedicAI
          </h1>
          
          {/* Text overlay for first slide - positioned below MedicAI */}
          {currentSlide === 0 && slide.textOverlay && (
            <div 
              className="text-white max-w-4xl mx-auto text-center px-8 mt-8"
              style={{
                fontSize: '2.5rem',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textShadow: '2px 2px 20px rgba(0,0,0,0.8)',
              }}
            >
              {slide.textOverlay.text}
            </div>
          )}

          {/* Text overlay for fourth slide - positioned below MedicAI */}
          {currentSlide === 3 && (
            <div 
              className="text-white max-w-4xl mx-auto text-center px-8 mt-16"
              style={{
                fontSize: '1.6rem',
                fontWeight: '400',
                letterSpacing: '0.05em',
                textShadow: '2px 2px 20px rgba(0,0,0,0.8)',
                textTransform: 'lowercase',
                lineHeight: '1.4'
              }}
            >
              we feel the weight too.
              <div className="mt-8">
                so we built what you need.<br />
                they're still waiting.<br />
                we're just waiting for you.
              </div>
            </div>
          )}

          {/* Text overlay for fifth slide - removed */}
        </div>
        )}

        {/* Text Overlay for other slides */}
        {slide.textOverlay && currentSlide !== 0 && (
          <div className={getTextPosition(slide.textOverlay.position)}>
            <div 
              className="text-white max-w-4xl mx-auto text-center px-8"
              style={slide.textOverlay.style}
            >
              {slide.textOverlay.text}
            </div>
          </div>
        )}

        {/* Subtitle for first slide */}
        {currentSlide === 0 && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-40">
            <p 
              className="text-white text-2xl tracking-wide text-center"
              style={{ 
                textShadow: '2px 2px 20px rgba(0,0,0,0.8)',
                fontWeight: '300',
                letterSpacing: '0.05em'
              }}
            >
              The wave is coming. Be ready.
            </p>
            <p 
              className="text-white text-lg tracking-wide text-center mt-4 opacity-80"
              style={{ 
                textShadow: '2px 2px 20px rgba(0,0,0,0.8)',
                fontWeight: '300',
                letterSpacing: '0.02em'
              }}
            >
              (12,000 GP shortage projected by 2030)
            </p>
          </div>
        )}

        {/* Subtitle for second slide */}
        {currentSlide === 1 && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-40">
            <p 
              className="text-white text-2xl tracking-wide text-center"
              style={{ 
                textShadow: '2px 2px 20px rgba(0,0,0,0.8)',
                fontWeight: '300',
                letterSpacing: '0.05em',
                textTransform: 'lowercase'
              }}
            >
              every day, 6 gps leave for good.
            </p>
          </div>
        )}

        {/* Subtitle for third slide */}
        {currentSlide === 2 && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-40">
            <p 
              className="text-white text-2xl tracking-wide text-center"
              style={{ 
                textShadow: '2px 2px 20px rgba(0,0,0,0.8)',
                fontWeight: '300',
                letterSpacing: '0.05em',
                textTransform: 'lowercase'
              }}
            >
              care delayed is care denied.
            </p>
          </div>
        )}


        {/* Mist gradient effect for first slide */}
        {currentSlide === 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 via-white/5 to-transparent" />
        )}

        {/* Orange backlight effect for second slide */}
        {currentSlide === 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-orange-900/20 via-orange-800/10 to-transparent" />
        )}

        {/* Golden ambient light effect for third slide */}
        {currentSlide === 2 && (
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-yellow-900/20 via-yellow-800/10 to-transparent" />
        )}

        {/* Warm backlight effect for fourth slide */}
        {currentSlide === 3 && (
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-amber-900/20 via-amber-700/10 to-transparent" />
        )}

        {/* Warm glowing effect for fifth slide */}
        {currentSlide === 4 && (
          <>
            <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-orange-200/30 via-amber-100/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-amber-50/10 to-transparent animate-pulse" />
          </>
        )}

        {/* Special handling for slides 2 and 3 - different layouts */}
        {currentSlide === 1 ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              {/* Position this text lower than where MedicAI sits */}
              <div className="mt-20">
                <p 
                  className="text-2xl opacity-90 mb-4"
                  style={{ 
                    textTransform: 'lowercase',
                    fontWeight: '300',
                    letterSpacing: '0.05em'
                  }}
                >
                  every hour, more walk away.
                </p>
              </div>
            </div>
          </div>
        ) : currentSlide === 2 ? (
          // Slide 3 now clean - no text overlay
          null
        ) : currentSlide === 3 ? (
          // Slide 4 uses MedicAI branding from above, no additional content needed here
          null
        ) : currentSlide === 4 ? (
          // Slide 5 - Safety First focus only
          null
        ) : currentSlide === 5 ? (
          // Slide 6 - Product interface with feature annotations positioned outside the laptop
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Left side annotations */}
            <div className="absolute left-8 top-1/4 text-white z-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium tracking-wide bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  Australian Healthcare compliant
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium tracking-wide bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  Signed off by a doctor
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium tracking-wide bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  Created by AI
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium tracking-wide bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  Less than average cost
                </span>
              </div>
            </div>
            
            {/* Right side annotations */}
            <div className="absolute right-8 top-1/4 text-white z-50">
              <div className="flex items-center gap-3 mb-4 flex-row-reverse">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium tracking-wide bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  Safety first focus
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4 flex-row-reverse">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium tracking-wide bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  Smart form pre-fill
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4 flex-row-reverse">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium tracking-wide bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  Referral in 30 seconds
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4 flex-row-reverse">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium tracking-wide bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  Specialist pre-created
                </span>
              </div>
            </div>

            {/* Bottom annotations */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white z-50">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium tracking-wide bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    Integrated into website
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium tracking-wide bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    Nil software system to learn
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Default content for other slides */
          !slide.backgroundImage && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <h2 className="text-6xl font-bold mb-8">{slide.title}</h2>
                <p className="text-2xl opacity-80">{slide.content}</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Navigation Hint */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-sm">
        Press Space or → for next slide • Esc to exit
      </div>
    </div>
  );
};

export const PresentationPreview: React.FC = () => {
  const [isPresenting, setIsPresenting] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Presentation Mode</h2>
          <p className="text-muted-foreground">10-slide presentation for tomorrow's meeting</p>
        </div>
        <Button 
          onClick={() => setIsPresenting(true)}
          className="flex items-center gap-2"
          size="lg"
        >
          <Play className="h-5 w-5" />
          Start Presentation
        </Button>
      </div>

      {/* Slide Thumbnails */}
      <div className="grid grid-cols-5 gap-4">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className="relative aspect-video bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => setIsPresenting(true)}
          >
            {slide.backgroundImage ? (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.backgroundImage})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-sm font-medium">{slide.title}</h3>
                {index === 0 && (
                  <div className="text-xs mt-1 font-bold">MedicAI</div>
                )}
              </div>
            </div>
            <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
              {index + 1}
            </div>
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Play className="h-6 w-6 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Presentation Instructions */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Presentation Controls:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <kbd className="px-2 py-1 bg-background rounded">Space</kbd> or <kbd className="px-2 py-1 bg-background rounded">→</kbd> - Next slide</li>
          <li>• <kbd className="px-2 py-1 bg-background rounded">←</kbd> - Previous slide</li>
          <li>• <kbd className="px-2 py-1 bg-background rounded">Esc</kbd> - Exit presentation</li>
          <li>• Click the slide thumbnails above to start presenting</li>
        </ul>
      </div>

      <PresentationMode 
        isPresenting={isPresenting}
        onClose={() => setIsPresenting(false)}
      />
    </div>
  );
};
