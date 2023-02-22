import { FC } from "react";

export const ChevronDown: FC<React.HTMLProps<HTMLOrSVGElement>> = ({
  className,
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7.41 8.58L12 13.17L16.59 8.58L18 10L12 16L6 10L7.41 8.58Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const VerifiedAddress: FC<React.HTMLProps<HTMLOrSVGElement>> = ({
  className,
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M17.8 21.2L15 18.2L16.2 17L17.8 18.6L21.4 15L22.6 16.4L17.8 21.2ZM13 10H10V17H12.1C12.2 16.2 12.6 15.4 13 14.7V10ZM16 10V12.3C16.6 12.1 17.3 12 18 12C18.3 12 18.7 12 19 12.1V10H16ZM12.1 19H2V22H13.5C12.8 21.2 12.3 20.1 12.1 19ZM21 6L11.5 1L2 6V8H21V6ZM7 17V10H4V17H7Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const Copy: FC<React.HTMLProps<HTMLOrSVGElement>> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M19 21H8V7H19M19 5H8C7.46957 5 6.96086 5.21071 6.58579 5.58579C6.21071 5.96086 6 6.46957 6 7V21C6 21.5304 6.21071 22.0391 6.58579 22.4142C6.96086 22.7893 7.46957 23 8 23H19C19.5304 23 20.0391 22.7893 20.4142 22.4142C20.7893 22.0391 21 21.5304 21 21V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5ZM16 1H4C3.46957 1 2.96086 1.21071 2.58579 1.58579C2.21071 1.96086 2 2.46957 2 3V17H4V3H16V1Z"
        fill="currentColor"
      />
    </svg>
  );
};
