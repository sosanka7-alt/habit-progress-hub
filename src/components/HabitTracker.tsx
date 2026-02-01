import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface HabitData {
  [habitIndex: number]: {
    [weekIndex: number]: boolean;
  };
}

const HabitTracker = () => {
  const [weeks, setWeeks] = useState(4);
  const [habits, setHabits] = useState(3);
  const [habitNames, setHabitNames] = useState<string[]>(["Exercise", "Read", "Meditate"]);
  const [checkedState, setCheckedState] = useState<HabitData>({});

  const handleWeeksChange = (value: number) => {
    setWeeks(Math.max(1, Math.min(12, value)));
  };

  const handleHabitsChange = (value: number) => {
    const newValue = Math.max(1, Math.min(10, value));
    setHabits(newValue);
    if (newValue > habitNames.length) {
      setHabitNames([...habitNames, ...Array(newValue - habitNames.length).fill("").map((_, i) => `Habit ${habitNames.length + i + 1}`)]);
    }
  };

  const handleHabitNameChange = (index: number, name: string) => {
    const newNames = [...habitNames];
    newNames[index] = name;
    setHabitNames(newNames);
  };

  const handleCheckChange = (habitIndex: number, weekIndex: number, checked: boolean) => {
    setCheckedState((prev) => ({
      ...prev,
      [habitIndex]: {
        ...prev[habitIndex],
        [weekIndex]: checked,
      },
    }));
  };

  const isChecked = (habitIndex: number, weekIndex: number): boolean => {
    return checkedState[habitIndex]?.[weekIndex] || false;
  };

  const { completed, remaining, percentage } = useMemo(() => {
    let completedCount = 0;
    const total = habits * weeks;

    for (let h = 0; h < habits; h++) {
      for (let w = 0; w < weeks; w++) {
        if (isChecked(h, w)) {
          completedCount++;
        }
      }
    }

    return {
      completed: completedCount,
      remaining: total - completedCount,
      percentage: total > 0 ? Math.round((completedCount / total) * 100) : 0,
    };
  }, [checkedState, habits, weeks]);

  const pieData = [
    { name: "Completed", value: completed, color: "hsl(var(--chart-completed))" },
    { name: "Remaining", value: remaining, color: "hsl(var(--chart-remaining))" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Habit Tracker
          </h1>
          <p className="text-muted-foreground">
            Track your habits, build consistency
          </p>
        </div>

        {/* Configuration */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weeks" className="text-sm font-medium">
                  Number of Weeks
                </Label>
                <Input
                  id="weeks"
                  type="number"
                  min={1}
                  max={12}
                  value={weeks}
                  onChange={(e) => handleWeeksChange(parseInt(e.target.value) || 1)}
                  className="bg-input-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="habits" className="text-sm font-medium">
                  Number of Habits
                </Label>
                <Input
                  id="habits"
                  type="number"
                  min={1}
                  max={10}
                  value={habits}
                  onChange={(e) => handleHabitsChange(parseInt(e.target.value) || 1)}
                  className="bg-input-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Habit Table */}
        <Card className="border-border/50 shadow-card overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Track Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-4 text-left font-semibold text-foreground min-w-[150px]">
                      Habit
                    </th>
                    {Array.from({ length: weeks }, (_, i) => (
                      <th
                        key={i}
                        className="p-4 text-center font-semibold text-foreground min-w-[80px]"
                      >
                        Week {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: habits }, (_, habitIndex) => (
                    <tr
                      key={habitIndex}
                      className="border-t border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <Input
                          value={habitNames[habitIndex] || `Habit ${habitIndex + 1}`}
                          onChange={(e) => handleHabitNameChange(habitIndex, e.target.value)}
                          className="border-0 bg-transparent p-0 h-auto font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
                          placeholder={`Habit ${habitIndex + 1}`}
                        />
                      </td>
                      {Array.from({ length: weeks }, (_, weekIndex) => (
                        <td key={weekIndex} className="p-4 text-center">
                          <Checkbox
                            checked={isChecked(habitIndex, weekIndex)}
                            onCheckedChange={(checked) =>
                              handleCheckChange(habitIndex, weekIndex, checked as boolean)
                            }
                            className="h-6 w-6 rounded-md border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Progress Chart */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <div className="text-6xl font-bold text-primary">{percentage}%</div>
                  <p className="text-muted-foreground mt-1">Overall Completion</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10">
                    <div className="text-2xl font-bold text-primary">{completed}</div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-muted-foreground">{remaining}</div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HabitTracker;
