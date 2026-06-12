"use client";

import { motion, useReducedMotion } from "motion/react";

type PlantDrawing = {
  url: string;
  alt?: string;
};

type PlantGardenProps = {
  drawings?: PlantDrawing[];
};

const positions = [
  {
    left: "1%",
    bottom: "-4%",
    width: "clamp(150px, 21vw, 360px)",
    rotate: -5,
  },
  {
    left: "17%",
    bottom: "-7%",
    width: "clamp(130px, 18vw, 300px)",
    rotate: 4,
  },
  {
    left: "38%",
    bottom: "-6%",
    width: "clamp(160px, 24vw, 390px)",
    rotate: -2,
  },
  {
    right: "18%",
    bottom: "-8%",
    width: "clamp(140px, 19vw, 320px)",
    rotate: 5,
  },
  {
    right: "-2%",
    bottom: "-5%",
    width: "clamp(160px, 23vw, 380px)",
    rotate: -4,
  },
];

export default function PlantGarden({ drawings = [] }: PlantGardenProps) {
  const reduceMotion = useReducedMotion();

  if (drawings.length === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {drawings.map((drawing, index) => {
        const position = positions[index % positions.length];

        return (
          <motion.div
            key={`${drawing.url}-${index}`}
            className="absolute origin-bottom will-change-transform"
            style={{
              left: position.left,
              right: position.right,
              bottom: position.bottom,
              width: position.width,
            }}
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 180,
                    scale: 0.72,
                    rotate: position.rotate - 5,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              rotate: [
                position.rotate,
                position.rotate + 1.5,
                position.rotate - 1,
                position.rotate,
              ],
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    opacity: {
                      duration: 0.8,
                      delay: 0.4 + index * 0.14,
                    },
                    y: {
                      duration: 1.2,
                      delay: 0.25 + index * 0.14,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    scale: {
                      duration: 1.2,
                      delay: 0.25 + index * 0.14,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    rotate: {
                      duration: 7 + index,
                      delay: 1.5 + index * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }
            }
          >
            <img
              src={drawing.url}
              alt=""
              className="block h-auto w-full object-contain"
              draggable={false}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
