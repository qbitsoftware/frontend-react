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
      {(heading || addr || icon) && (
        <div className="pb-0 sm:pb-0.5 lg:pb-0.5 px-2 sm:px-4 flex justify-start items-center gap-2">
          <a
            href={`/${addr}`}
            className="flex items-center justify-center gap-2 sm:gap-3 rounded-sm p-1"
          >
            {icon && (
              <img
                src={`/icons/${icon}.png`}
                alt={`${icon} icon`}
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex-shrink-0"
              />
            )}
            {heading && (
              <h3 className="font-bold text-foreground/80 text-base lg:text-[22px] truncate">{heading}</h3>
            )}
            <ChevronRight className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          </a>
        </div>
      )}
      {children}
    </div>
  );
};

export default WidgetWrapper;
