import React from 'react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { InteractiveHero } from "@/components/ui/interactive-hero-backgrounds"; // Adjust import path as needed

// The ThemeProvider wrapper component
function ThemeProvider({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

const InteractiveHeroDemo = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <InteractiveHero
            brandName="21st"
            heroTitle="Interactive Hero Backgrounds"
            heroDescription="Engage users with dynamic, physics-based animations that respond to their every move. Built with React, Three.js, and shadcn/ui."
            emailPlaceholder="Enter your email"
            // You can customize the ballpit animation properties here
            ballpitConfig={{
                count: 150,
                gravity: 0.5,
                friction: 0.99,
                minSize: 0.4,
                maxSize: 0.9,
                lightIntensity: 4,
            }}
        />
    </ThemeProvider>
  );
};

export default InteractiveHeroDemo;
