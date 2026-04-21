import React from "react";

export function Input(
    props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
) {
    const { label, className = "", ...rest } = props;
    return (
        <label className="block space-y-1">
            {label && <div className="text-xs text-white/70">{label}</div>}
            <input
                {...rest}
                className={
                    "w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 outline-none " +
                    "focus:border-white/30 focus:bg-white/10 transition " + className
                }
            />
        </label>
    );
}