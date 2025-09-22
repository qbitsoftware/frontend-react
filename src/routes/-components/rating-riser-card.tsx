import { User } from "@/types/users";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";

interface RatingRiserCardProps {
  riser: User;
  delay?: number;
}

const RatingRiserCard = ({ riser, delay = 0.1 }: RatingRiserCardProps) => {

  return (
    <motion.div
      key={riser.id}
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.2 }}
      className="group relative bg-white border border-blue-200 rounded-lg p-2 sm:p-3 hover:border-[#4C97F1]/40 hover:shadow-lg hover:shadow-[#4C97F1]/10 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex items-center gap-1 text-green-600 px-1 py-0.5">
        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-extrabold">+{riser.rating_last_change}</span>
      </div>

      <div className="relative">
        <div className="mb-1 sm:mb-2">
          <h4 className="font-bold text-gray-700 text-xs sm:text-sm leading-tight truncate group-hover:text-[#4C97F1] transition-colors duration-200 mb-0">
            {riser.first_name} {riser.last_name}
          </h4>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 truncate font-medium">
              {riser.club.name ? riser.club.name : "--"}
            </p>

            <div className="flex items-center gap-1 sm:gap-1.5 ml-2">
              <div className="bg-gray-100 text-gray-700 px-1.5 sm:px-2 py-0.5 rounded text-xs font-bold min-w-[20px] sm:min-w-[24px] text-center border border-gray-200 shadow-sm">
                {riser.rate_order + riser.rating_last_change}
              </div>

              <ArrowRight className={`w-3 h-3 flex-shrink-0 ${
                riser.sex === 'N' ? 'text-pink-400' : 'text-[#4C97F1]'
              }`} />

              <div className={`text-white px-1.5 sm:px-2 py-0.5 rounded text-xs font-bold min-w-[20px] sm:min-w-[24px] text-center shadow-md ${
                riser.sex === 'N'
                  ? 'bg-gradient-to-r from-pink-300 to-pink-400'
                  : 'bg-gradient-to-r from-[#4C97F1] to-[#3B82F6]'
              }`}>
                {riser.rate_order}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RatingRiserCard;
