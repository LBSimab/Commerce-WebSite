"use client";

/**
 * SliderBlock Component
 *
 * Content block for About/Contact pages.
 * Shows an image slideshow using react-awesome-slider.
 * Admins upload images in the content editor.
 *
 * Props:
 * - data: { images: string[] } — array of image URLs
 */

import AwesomeSlider from "react-awesome-slider";
import "react-awesome-slider/dist/styles.css";

export default function SliderBlock({ data }) {
  const images = data.images || [];

  // Don't render if no images
  if (images.length === 0) return null;

  // If only one image, just show it without slider controls
  if (images.length === 1) {
    return (
      <section className="w-full">
        <img src={images[0]} alt="" className="w-full h-[400px] object-cover" />
      </section>
    );
  }

  return (
    <section className="w-full">
      <style jsx global>{`
        .slider-block .awssld__wrapper {
          height: 500px;
        }
        .slider-block .awssld__bullets {
          bottom: 16px;
        }
        .slider-block .awssld__bullets button {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.5);
        }
        .slider-block .awssld__bullets .awssld__bullets--active {
          background: #ffffff;
          transform: scale(1.3);
        }
        .slider-block .awssld__controls__arrow-left,
        .slider-block .awssld__controls__arrow-right {
          opacity: 0.4;
          transition: opacity 0.3s;
        }
        .slider-block .awssld__controls__arrow-left:hover,
        .slider-block .awssld__controls__arrow-right:hover {
          opacity: 1;
        }
      `}</style>

      <div className="slider-block">
        <AwesomeSlider
          media={images.map((img, i) => (
            <div key={i} style={{ height: "100%" }}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          bullets={true}
          organicArrows={true}
          infinite={true}
          transitionDelay={100}
          transitionDuration={600}
        />
      </div>
    </section>
  );
}
