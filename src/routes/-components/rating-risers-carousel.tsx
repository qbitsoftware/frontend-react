import { motion } from "framer-motion";
import RatingRiserCard from "./rating-riser-card";

interface RatingRiser {
  id: number;
  playerName: string;
  clubName: string;
  oldPosition: number;
  newPosition: number;
  positionChange: number;
  sex: string;
}

const mockRatingRisers: RatingRiser[] = [
  {
    id: 1,
    playerName: "Maria Kivirand",
    clubName: "SK Kalev",
    oldPosition: 15,
    newPosition: 8,
    positionChange: 7,
    sex: "N"
  },
  {
    id: 2,
    playerName: "Markus Oliver Annuk",
    clubName: "Viimsi Lauatenniseklubi",
    oldPosition: 23,
    newPosition: 12,
    positionChange: 11,
    sex: "M"
  },
  {
    id: 3,
    playerName: "Liis Tamm",
    clubName: "Narva SK",
    oldPosition: 31,
    newPosition: 18,
    positionChange: 13,
    sex: "N"
  },
  {
    id: 4,
    playerName: "Harri Mähar",
    clubName: "Viimsi Lauatenniseklubi",
    oldPosition: 42,
    newPosition: 25,
    positionChange: 17,
    sex: "M"
  },
  {
    id: 5,
    playerName: "Kristina Saar",
    clubName: "TTK Serve",
    oldPosition: 38,
    newPosition: 22,
    positionChange: 16,
    sex: "N"
  },
  {
    id: 5,
    playerName: "Hannes Mets",
    clubName: "Kohila SK",
    oldPosition: 38,
    newPosition: 22,
    positionChange: 16,
    sex: "M"
  }
];

const RatingRisersCarousel = () => {
  const duplicatedRisers = [...mockRatingRisers, ...mockRatingRisers];

  return (
    <div className="relative">
      <div className="relative h-[70px] sm:h-[75px] lg:h-[80px] overflow-hidden">
        <motion.div
          className="flex gap-3 sm:gap-4"
          animate={{
            x: [0, -100 * mockRatingRisers.length]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: mockRatingRisers.length * 4, 
              ease: "linear"
            }
          }}
          style={{
            width: `${duplicatedRisers.length * 300}px` 
          }}
        >
          {duplicatedRisers.map((riser, index) => (
            <div
              key={`${riser.id}-${index}`}
              className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]"
            >
              <RatingRiserCard riser={riser} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RatingRisersCarousel;
