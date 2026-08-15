const Loader = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex justify-center items-center h-64 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
      </div>
    </div>
  );
};

export default Loader;
