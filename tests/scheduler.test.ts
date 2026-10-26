import { describe, it, expect } from "vitest";
import { generatePersonalizedStudyPlan } from "../src/lib/algorithms/scheduler";
import { initialDemoProfile, initialDemoSubjects, initialDemoTopics } from "../src/lib/demo-data";

describe("Study Scheduler Algorithm", () => {
  it("never schedules more study minutes on a day than dailyStudyHours permits", () => {
    const customProfile = {
      ...initialDemoProfile,
      dailyStudyHours: 1.5, // 90 minutes max per day
      sessionDurationMinutes: 45,
    };

    const result = generatePersonalizedStudyPlan({
      profile: customProfile,
      subjects: initialDemoSubjects,
      topics: initialDemoTopics,
      startDateStr: "2026-10-26",
      daysCount: 7,
    });

    // Group tasks by scheduled date
    const tasksByDate = new Map<string, number>();
    result.plan.tasks.forEach((task) => {
      const current = tasksByDate.get(task.scheduledDate) || 0;
      tasksByDate.set(task.scheduledDate, current + task.durationMinutes);
    });

    // Check each day strictly obeys the cap
    const maxAllowedMinutes = Math.round(customProfile.dailyStudyHours * 60);
    for (const [date, totalMin] of tasksByDate.entries()) {
      expect(totalMin).toBeLessThanOrEqual(maxAllowedMinutes);
    }
  });

  it("prioritizes weak topics with high priority over strong topics", () => {
    const result = generatePersonalizedStudyPlan({
      profile: initialDemoProfile,
      subjects: initialDemoSubjects,
      topics: initialDemoTopics,
      startDateStr: "2026-10-26",
      daysCount: 7,
    });

    expect(result.plan.tasks.length).toBeGreaterThan(0);
    const firstTask = result.plan.tasks[0];
    expect(firstTask.priority).toBe("high");
    expect(firstTask.reasonWhyRecommended).toContain("Critical knowledge gap");
  });
});
