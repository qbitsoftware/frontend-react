import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface WidgetProps {
  heading?: string;
  view_all?: string;
  addr?: string;
  icon?: string;
  children?: ReactNode;
}

const WidgetWrapper = ({ heading, addr, icon, children }: WidgetProps) => {
  return (
    <div className="h-full flex-grow">
      <div className="pb-3 sm:pb-4 lg:pb-6 px-2 sm:px-4 flex justify-start items-center gap-2">
        <a
          href={`/${addr}`}
          className="flex items-center justify-center gap-2 sm:gap-3 rounded-sm hover:bg-gradient-to-r hover:from-[#f4f4f3] hover:to-[#f5f5f5] transition-all duration-300 p-1"
        >
          <img
            src={`/icons/${icon}.svg`}
            alt={`${icon} icon`}
            className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex-shrink-0"
          />
          <h3 className="font-bold text-foreground/80 text-base lg:text-2xl truncate"> {heading}</h3>
          <ChevronRight className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        </a>
      </div>
      {children}
    </div>
  );
};

export default WidgetWrapper;
