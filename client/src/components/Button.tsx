import React from "react";

export function Button(
    { children, className = "", ...rest }:
        React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }
) {
    return (
        <button
            {...rest}
            className={
                "rounded-2xl px-4 py-2 font-semibold border border-white/15 bg-white/10 hover:bg-white/15 " +
                "active:translate-y-[1px] transition " + className
            }
        >
            {children}
        </button>
    );
}