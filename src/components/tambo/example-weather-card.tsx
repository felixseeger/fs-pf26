/**
 * Example Tambo Component: WeatherCard
 * 
 * This is an example component showing how to register components with Tambo.
 * Follow this pattern when creating your own Tambo components.
 * 
 * To use this component:
 * 1. Import it and its schema in src/lib/tambo.ts
 * 2. Add it to the components array
 */

import { z } from "zod";

/**
 * Zod schema defining the props for WeatherCard
 * Use z.describe() to provide hints for better AI generation
 */
export const WeatherCardPropsSchema = z
  .object({
    city: z.string().describe("City name to display, e.g., 'San Francisco'"),
    temperature: z
      .number()
      .describe("Temperature in Celsius as a whole number"),
    condition: z
      .string()
      .describe("Weather condition like 'Sunny', 'Cloudy', 'Rainy'"),
    humidity: z
      .number()
      .optional()
      .describe("Humidity percentage (0-100). Optional field."),
  })
  .describe("Displays current weather information for a city");

/**
 * TypeScript type inferred from the schema
 */
export type WeatherCardProps = z.infer<typeof WeatherCardPropsSchema>;

/**
 * WeatherCard Component
 * 
 * Displays weather information for a city. This component can be generated
 * by Tambo when users ask about weather conditions.
 */
export function WeatherCard({
  city,
  temperature,
  condition,
  humidity,
}: WeatherCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
        Weather in {city}
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-white">
            {temperature}°C
          </span>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">{condition}</p>
        {humidity !== undefined && (
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Humidity: {humidity}%
          </p>
        )}
      </div>
    </div>
  );
}
