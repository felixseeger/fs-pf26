/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 * 
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 * 
 * IMPORTANT: If you have components in different directories (e.g., both ui/ and tambo/),
 * make sure all import paths are consistent. Run 'npx tambo migrate' to consolidate.
 * 
 * Read more about Tambo at https://docs.tambo.co
 * 
 * Guide: /guides/enable-generative-ui/register-components
 */

import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";

/**
 * Components Array - A collection of Tambo components to register
 * 
 * Components represent UI elements that can be generated or controlled by AI.
 * Register your custom components here to make them available to the AI.
 * 
 * To add a component:
 * 1. Define a Zod schema for the component's props (use z.describe() for better AI guidance)
 * 2. Import your component
 * 3. Add a TamboComponent object with: name, description, component, propsSchema
 * 
 * Example:
 * 
 * ```typescript
 * import { z } from "zod";
 * import { WeatherCard } from "@/components/ui/WeatherCard";
 * 
 * const WeatherCardPropsSchema = z
 *   .object({
 *     city: z.string().describe("City name to display, e.g., 'San Francisco'"),
 *     temperature: z.number().describe("Temperature in Celsius as a whole number"),
 *     condition: z.string().describe("Weather condition like 'Sunny', 'Cloudy', 'Rainy'"),
 *   })
 *   .describe("Displays current weather information for a city");
 * 
 * export const components: TamboComponent[] = [
 *   {
 *     name: "WeatherCard",
 *     description: "Displays current weather for a city. Use when the user asks about weather, temperature, or conditions.",
 *     component: WeatherCard,
 *     propsSchema: WeatherCardPropsSchema,
 *   },
 * ];
 * ```
 */
// Import your custom components that utilize the Tambo SDK
// Example (uncomment to enable):
// import { WeatherCard, WeatherCardPropsSchema } from "@/components/tambo/WeatherCard";

export const components: TamboComponent[] = [
  // Example component registration (uncomment to enable):
  // {
  //   name: "WeatherCard",
  //   description: "Displays current weather for a city or user's location. Use when the user asks about weather, temperature, conditions, or local weather.",
  //   component: WeatherCard,
  //   propsSchema: WeatherCardPropsSchema,
  // },
];
