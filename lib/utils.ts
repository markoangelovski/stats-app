import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { prisma } from "./db";
import { StatItem } from "@/actions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getUserByEmail = (email: string) =>
  prisma.user.findUnique({
    where: { email }
  });

export const withTrend = (items: StatItem[]) => {
  if (!items || items.length === 0 || !items[0].dateOfEntry) {
    // Handle the error case appropriately, e.g., return an empty array or throw an error.
    return {
      slope: 0,
      intercept: 0,
      data: []
    };
  }

  // Convert date to a numeric value (days since first date)
  const startDate = new Date(items[0].dateOfEntry);
  const dataWithX = items.map((point) => {
    const daysSinceStart =
      (new Date(point.dateOfEntry).getTime() - startDate.getTime()) /
      (1000 * 60 * 60 * 24);
    return { x: daysSinceStart, y: point.numericValue, ...point };
  });

  // Calculate means of x and y
  const mean = (arr: number[]): number =>
    arr.reduce((sum, value) => sum + value, 0) / arr.length;
  const meanX = mean(dataWithX.map((point) => point.x));
  const meanY = mean(dataWithX.map((point) => point.y));

  // Calculate slope (m) and intercept (c)
  let numerator = 0;
  let denominator = 0;
  dataWithX.forEach((point) => {
    numerator += (point.x - meanX) * (point.y - meanY);
    denominator += Math.pow(point.x - meanX, 2);
  });
  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Function to predict y (value) for any x (date in days since start)
  const predict = (x: number) => slope * x + intercept;

  // Calculate trend values for each point in the dataset
  return {
    slope: parseFloat(slope.toFixed(2)),
    intercept: parseFloat(intercept.toFixed(2)),
    data: dataWithX.map((point) => ({
      ...point,
      trend: parseFloat(predict(point.x).toFixed(2))
    }))
  };
};
