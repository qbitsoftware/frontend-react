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
      <div className="pb-6 px-4 flex justify-start items-center gap-2">
        <a
          href={`/${addr}`}
          className="flex items-center justify-center gap-3 rounded-sm hover:bg-gradient-to-r hover:from-[#f4f4f3] hover:to-[#f5f5f5] transition-all duration-300"
        >
          <img
            src={`/icons/${icon}.svg`}
            alt={`${icon} icon`}
            className="w-8 h-8"
          />
          <h3 className="font-bold text-foreground/80"> {heading}</h3>
          <ChevronRight className="mt-1" />
        </a>
      </div>
      {children}
    </div>
  );
};

export default WidgetWrapper;
