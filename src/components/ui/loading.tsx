export interface LoadingProps {
  width?: string | number;
  thickness?: number;
  className?: string; // Tailwind classes like "text-red-500"
}

const Loading = ({ width = 80, thickness = 12, className }: LoadingProps) => {
  return (
    <div
      className={`loading-spinner !text-primary/40 ${className ?? ""}`} // apply Tailwind text color here
      style={{
        width: width,
        aspectRatio: "1",
        borderRadius: "50%",
        background: `radial-gradient(farthest-side, currentColor 94%, #0000) top/${thickness}px ${thickness}px no-repeat, conic-gradient(transparent 10%, currentColor)`,
        WebkitMask: `radial-gradient(farthest-side, #0000 calc(100% - ${thickness}px), #fff 0)`,
        animation: "l13 1s infinite linear",
        color: "inherit", // inherit color from Tailwind class
      }}
    ></div>
  );
};

export default Loading;
