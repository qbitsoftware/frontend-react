import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    // <div className="flex justify-center items-center min-h-screen  ">
    //   <motion.div
    //     className="w-12 h-12 border-4 border-gray-300  border-t-gray-900  rounded-full animate-spin"
    //     initial={{ opacity: 0, scale: 0.8 }}
    //     animate={{ opacity: 1, scale: 1 }}
    //     transition={{ duration: 0.5, ease: "easeOut" }}
    //   />
    // </div>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="flex justify-center items-center h-[80vh] animate-spin">
        <Loader2 />
      </div>
    </div>
  );
};

export default LoadingScreen;
