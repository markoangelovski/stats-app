import { prisma } from "@/lib/db";
import { StatItemSchema } from "@/schemas";
import { NextResponse } from "next/server";
import * as z from "zod";

const respond = <D>(
  hasErrors: boolean,
  message: string,
  data: D,
  status: number
) => {
  return NextResponse.json(
    {
      hasErrors,
      message,
      data
    },
    { status }
  );
};

const IdSchema = z.string().cuid().min(25);
const StatItemsPayloadSchema = z.array(StatItemSchema);

export async function GET(request: Request) {
  const user = IdSchema.safeParse(
    new URL(request.url).searchParams.get("userId")
  );

  if (user.success === false) return respond(true, "Unauthorized!", [], 401);

  try {
    const stats = await prisma.stat.findMany({
      where: {
        user_id: user.data
      }
    });

    return respond(false, "Stats fetched successfully!", stats, 200);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return respond(true, "Error fetching stats:", error, 500);
  }
}

export async function POST(request: Request) {
  const user = IdSchema.safeParse(
    new URL(request.url).searchParams.get("userId")
  );
  const stat = IdSchema.safeParse(
    new URL(request.url).searchParams.get("statId")
  );

  if (user.success === false) return respond(true, "Unauthorized!", [], 401);
  if (stat.success === false)
    return respond(true, "Stat ID missing or incorrect!", [], 422);

  try {
    const body = await request.json();

    if (!body || !Array.isArray(body))
      return respond(true, "Incorrect submission!", [], 422);

    const validatedPayload = StatItemsPayloadSchema.safeParse(
      body.map((item) => ({ ...item, dateOfEntry: new Date(item.dateOfEntry) }))
    );

    if (validatedPayload.success === false)
      return respond(true, "Invalid payload!", validatedPayload.error, 400);

    const items = await prisma.statItem.createMany({
      data: validatedPayload.data.map((item) => ({
        stat_id: stat.data,
        user_id: user.data,
        ...item
      }))
    });

    return respond(false, `Stat items created successfully!`, items, 201);
  } catch (error) {
    console.error("Error creating stat items:", error);
    return respond(true, "Error creating stat items!", error, 500);
  }
}
