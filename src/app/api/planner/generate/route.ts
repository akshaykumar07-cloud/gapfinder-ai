import { NextRequest, NextResponse } from "next/server";
import { generatePersonalizedStudyPlan } from "@/lib/algorithms/scheduler";
import { initialDemoProfile, initialDemoSubjects, initialDemoTopics } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const result = generatePersonalizedStudyPlan({
      profile: body.profile || initialDemoProfile,
      subjects: body.subjects || initialDemoSubjects,
      topics: body.topics || initialDemoTopics,
      startDateStr: body.startDateStr || new Date().toISOString().split("T")[0],
      daysCount: body.daysCount || 7,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Plan generation failed" }, { status: 500 });
  }
}
