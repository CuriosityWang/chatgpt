import { ComponentPropsWithoutRef } from "react"
import { IconType } from "react-icons"

type ButtonProps = {
    icon?: IconType
    variant?: "default" | "outline" | "text"
} & ComponentPropsWithoutRef<"button">

export default function Button({
    children,
    className = "",
    icon: Icon,
    variant = "default",
    ...props
}: ButtonProps) {
    // 将基础类和传入的类分开处理
    const baseClasses = `transition-colors items-center min-w-[38px] min-h-[38px] rounded px-3 py-1.5`;
    const displayClass = className.includes('hidden') ? '' : 'inline-flex';
    const variantClasses = variant === "default"
        ? "text-black dark:text-gray-300 bg-gray-50 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-900"
        : variant === "outline"
        ? "border border-gray-300 dark:border-gray-600 text-black dark:text-gray-300 bg-gray-50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        : "text-black dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700";

    return (
        <button
            className={`${baseClasses} ${displayClass} ${variantClasses} ${className}`}
            {...props}
        >
            {Icon && <Icon className={`text-lg ${children ? "mr-1" : ""}`} />}
            {children}
        </button>
    )
}
