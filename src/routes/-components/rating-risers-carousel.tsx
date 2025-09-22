import { motion } from "framer-motion";
import RatingRiserCard from "./rating-riser-card";
import { useGetTopWeekRankings } from "@/queries/users";
import { Skeleton } from "@/components/ui/skeleton";

const RatingRisersCarousel = () => {
  const { data, isLoading } = useGetTopWeekRankings();
  const ratingRisers = data?.data || [];

  // Sort risers in alternating M, N, M, N pattern
  const sortedRisers = (() => {
    const males = ratingRisers.filter(riser => riser.sex === 'M');
    const females = ratingRisers.filter(riser => riser.sex === 'N');
    const result = [];

    const maxLength = Math.max(males.length, females.length);
    for (let i = 0; i < maxLength; i++) {
      if (males[i]) result.push(males[i]);
      if (females[i]) result.push(females[i]);
    }

    return result;
  })();

  const duplicatedRisers = [...sortedRisers, ...sortedRisers];

  if (isLoading) {
    return (
      <div className="relative">
        <div className="relative h-[70px] sm:h-[75px] lg:h-[80px] overflow-hidden">
          <div className="flex gap-3 sm:gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 relative">
                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="relative">
                    <div className="mb-1 sm:mb-2">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-20" />
                        <div className="flex items-center gap-1 sm:gap-1.5 ml-2">
                          <Skeleton className="h-6 w-8 rounded" />
                          <Skeleton className="h-3 w-3 rounded" />
                          <Skeleton className="h-6 w-8 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!sortedRisers.length) {
    return (
      <div className="relative">
        <div className="relative h-[70px] sm:h-[75px] lg:h-[80px] overflow-hidden flex items-center justify-center">
          <div className="text-sm text-gray-500">No rating risers available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative h-[70px] sm:h-[75px] lg:h-[80px] overflow-hidden">
        <motion.div
          className="flex gap-3 sm:gap-4"
          animate={{
            x: [0, -150 * sortedRisers.length]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: sortedRisers.length * 4,
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
