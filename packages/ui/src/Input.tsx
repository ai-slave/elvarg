import React, { ReactEventHandler, ReactNode } from "react";
import cx from "./utils/cx";

interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  leftElement?: ReactNode;
  bottomElement?: ReactNode;
  rightElement?: ReactNode;
  variant?: string;
  color?: string;
  outline?: "mineshaft" | "down-bad" | "umbra";
  placeholder?: string;
  handleChange: ReactEventHandler;
}

const variants: Record<string, Record<string, string>> = {
  xl: {
    box: "flex flex-col w-fit p-3 rounded-xl space-y-2",
    font: "h-10 text-2xl text-white ml-2 font-mono",
    textPosition: "text-right",
    alignment: "flex justify-between items-center",
  },
  small: {
    box: "flex flex-col w-fit rounded-md px-2 py-1 content-center",
    font: "h-auto text-white",
    textPosition: "text-left text-sm",
    alignment: "flex justify-between items-center",
  },
  medium: {
    box: "flex flex-col w-fit rounded-md p-2 content-center",
    font: "h-auto text-white",
    textPosition: "text-left text-sm",
    alignment: "flex justify-between items-center",
  },
};

const bgColors: Record<string, string> = {
  "cod-gray": "bg-cod-gray",
  umbra: "bg-umbra",
};

const Input = (props: InputProps) => {
  const {
    leftElement,
    rightElement,
    bottomElement,
    color = "umbra",
    variant = "xl",
    outline = "umbra",
    placeholder = "",
    handleChange,
    ...rest
  } = props;

  return (
    <div
      className={cx(
        variants[variant].box,
        bgColors[color],
        `${outline ? `border border-${outline}` : "border-0"}`
      )}
    >
      <div className="flex justify-between">
        {leftElement}
        <input
          className={cx(
            variants[variant].input,
            variants[variant].textPosition,
            variants[variant].font,
            bgColors[color],
            "text-white text-right focus:outline-none"
          )}
          placeholder={placeholder}
          {...rest}
        />
        {rightElement}
      </div>
      {bottomElement}
    </div>
  );
};

Input.displayName = "Input";

export default Input;
