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
      median: 0,
      avgMode: 0,
      modes: [],
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

  // Calculate median
  let median = 0;
  const sortedData = items.map((item) => item.numericValue).sort();
  const middleIndex1 = Math.floor(sortedData.length / 2) - 1;
  const middleIndex2 = Math.floor(sortedData.length / 2);
  if (sortedData.length % 2 === 0) {
    median = (sortedData[middleIndex1] + sortedData[middleIndex2]) / 2;
  } else {
    median = sortedData[middleIndex1];
  }

  // Calculate mode
  const modes = [],
    frequency: { [key: number]: number } = {};
  let maxFreq = 0;
  sortedData.forEach((item) => {
    frequency[item] = (frequency[item] || 0) + 1;
    maxFreq = Math.max(maxFreq, frequency[item]);
  });
  for (const value in frequency) {
    if (frequency[value] === maxFreq) {
      modes.push(Number(value));
    }
  }

  const totalPositives = modes.reduce(
    (acc, val) => (val > 0 ? acc + 1 : acc),
    0
  );
  const sum = modes.reduce((sum, val) => sum + val, 0);

  // Calculate trend values for each point in the dataset
  return {
    slope: parseFloat(slope.toFixed(2)),
    intercept: parseFloat(intercept.toFixed(2)),
    median: parseFloat(median?.toFixed(2)),
    avgMode: parseFloat((sum / totalPositives).toFixed(2)),
    modes: modes.sort(),
    data: dataWithX.map((point) => ({
      ...point,
      trend: parseFloat(predict(point.x).toFixed(2))
    }))
  };
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
