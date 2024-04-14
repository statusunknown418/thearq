/**
 * The planetscale spinner, I just liked it tbh
 * @param sm - default - 16px
 * @param md - 24px
 * @param lg - 32px
 * @returns
 */
export const Loader = ({
  sm = true,
  md,
  lg,
  color = "currentColor",
}: {
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  color?: string;
}) => {
  return (
    <svg
      id="spinner"
      viewBox="0 0 16 16"
      width={sm ? 16 : md ? 24 : lg ? 32 : 16}
      height={sm ? 16 : md ? 24 : lg ? 32 : 16}
      fill="none"
      strokeLinecap="round"
      stroke={color}
      strokeWidth="2px"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="spinner-line"
        cx="8"
        cy="8"
        r="7"
        strokeDasharray="1 0.8"
        strokeDashoffset="1"
        pathLength="1"
      />

      <circle cx="8" cy="8" r="7" strokeOpacity="0.1" strokeDasharray="0.8 1" pathLength="1" />

      <circle
        cx="8"
        cy="8"
        r="7"
        strokeOpacity="0.3"
        strokeDasharray="0.2 1"
        pathLength="1"
        transform="rotate(-72 8 8)"
      />
    </svg>
  );
};
