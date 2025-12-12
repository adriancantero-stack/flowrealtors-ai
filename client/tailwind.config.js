/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--color-primary)",
                "primary-hover": "var(--color-primary-hover)",
                "primary-light": "var(--color-primary-light)",

                muted: "var(--text-muted)",
                secondary: "var(--text-secondary)",

                // Grays aligned with Flow UI
                gray: {
                    50: "var(--gray-50)",
                    100: "var(--gray-100)",
                    200: "var(--gray-200)",
                    300: "var(--gray-300)",
                    400: "var(--gray-400)",
                    500: "var(--gray-500)",
                    600: "var(--gray-600)",
                    700: "var(--gray-700)",
                    800: "var(--gray-800)",
                    900: "var(--gray-900)",
                },
                danger: "var(--danger)",
                success: "var(--success)",
                warning: "var(--warning)",

                // Backward compatibility if needed, or mapping generic names
                background: "#FFFFFF",
                foreground: "var(--text-primary)",
                card: "#FFFFFF",
                "card-foreground": "var(--text-primary)",
                border: "var(--border-light)",
                input: "var(--gray-100)",
                ring: "var(--color-primary)",
            },
            borderRadius: {
                lg: "var(--radius-lg)",
                md: "var(--radius-md)",
                sm: "var(--radius-sm)",
            },
            boxShadow: {
                sm: "var(--shadow-sm)",
                DEFAULT: "var(--shadow-soft)",
                lg: "var(--shadow-popup)",
            }
        },
    },
    plugins: [],
}
