export type TState = "init" | "inprogress" | "connected" | "error";

const SVG = ({ state }: { state: TState }) => {
  const fillColor =
    state === "connected"
      ? "green"
      : state === "inprogress"
      ? "orange"
      : state === "error"
      ? "red"
      : "white";

  return (
    <svg
      width="39"
      height="40"
      viewBox="0 0 39 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M30.8024 6.62953H23.1921L14.2351 16.3155V24.3859L30.8024 6.62953Z"
        fill="url(#paint0_linear_18_354)"
      />
      <path
        d="M14.235 33.3705H7.80176V6.62953H14.235V33.3705Z"
        fill={fillColor}
      />
      <path
        d="M31.3823 33.3705L20.8109 17.3386L16.5056 21.9499L23.912 33.3705H31.3823Z"
        fill="url(#paint1_linear_18_354)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_18_354"
          x1="14.2351"
          y1="15.5077"
          x2="30.8024"
          y2="15.5077"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="0.6" stopColor={fillColor} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_18_354"
          x1="15.3212"
          y1="20.6432"
          x2="28.9469"
          y2="29.2284"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="0.6" stopColor={fillColor} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SVG;
