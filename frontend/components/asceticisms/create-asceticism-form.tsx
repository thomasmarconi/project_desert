"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createAsceticism } from "@/lib/services/asceticismService";
import {
  Sparkles,
  Droplet,
  Utensils,
  Moon,
  Book,
  Heart,
  Dumbbell,
  Brain,
  Leaf,
  Zap,
} from "lucide-react";

const TEST_USER_ID = 1;

// Predefined categories with icons and colors
const CATEGORIES = [
  {
    value: "fasting",
    label: "Fasting",
    icon: Utensils,
    color: "text-orange-500",
  },
  { value: "prayer", label: "Prayer", icon: Heart, color: "text-rose-500" },
  {
    value: "meditation",
    label: "Meditation",
    icon: Brain,
    color: "text-purple-500",
  },
  { value: "sleep", label: "Sleep", icon: Moon, color: "text-indigo-500" },
  { value: "study", label: "Study", icon: Book, color: "text-blue-500" },
  {
    value: "exercise",
    label: "Exercise",
    icon: Dumbbell,
    color: "text-green-500",
  },
  {
    value: "abstinence",
    label: "Abstinence",
    icon: Droplet,
    color: "text-cyan-500",
  },
  { value: "nature", label: "Nature", icon: Leaf, color: "text-emerald-500" },
  {
    value: "energy",
    label: "Energy Work",
    icon: Zap,
    color: "text-yellow-500",
  },
  { value: "custom", label: "Custom", icon: Sparkles, color: "text-pink-500" },
];

const TRACKING_TYPES = [
  {
    value: "BOOLEAN",
    label: "Yes/No (Daily Completion)",
    description: "Track whether you completed the practice each day",
  },
  {
    value: "NUMERIC",
    label: "Numeric (Count/Duration)",
    description:
      "Track a number (e.g., minutes, repetitions, glasses of water)",
  },
  {
    value: "TEXT",
    label: "Text (Journal Entry)",
    description: "Write notes or reflections for each day",
  },
];

interface CreateAsceticismFormProps {
  onSuccess?: () => void;
}

export default function CreateAsceticismForm({
  onSuccess,
}: CreateAsceticismFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    customCategory: "",
    type: "BOOLEAN" as "BOOLEAN" | "NUMERIC" | "TEXT",
    icon: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a title for your practice");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    if (formData.category === "custom" && !formData.customCategory.trim()) {
      toast.error("Please enter a custom category name");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalCategory =
        formData.category === "custom"
          ? formData.customCategory
          : formData.category;

      const selectedCategoryData = CATEGORIES.find(
        (c) => c.value === formData.category
      );
      const iconName = selectedCategoryData?.icon.name || "Sparkles";

      await createAsceticism({
        title: formData.title,
        description: formData.description || undefined,
        category: finalCategory,
        type: formData.type,
        icon: iconName,
        creatorId: TEST_USER_ID, // This makes it a custom user asceticism
      });

      toast.success("Custom practice created successfully!", {
        description: "You can now find it in the Browse Practices tab",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        customCategory: "",
        type: "BOOLEAN",
        icon: "",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Failed to create asceticism:", error);
      toast.error("Failed to create practice", {
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = CATEGORIES.find(
    (c) => c.value === formData.category
  );
  const CategoryIcon = selectedCategory?.icon || Sparkles;

  return (
    <Card className="max-w-3xl mx-auto border-2 shadow-lg">
      <CardHeader className="space-y-1 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Create Custom Practice</CardTitle>
            <CardDescription className="text-base">
              Design your own ascetic practice tailored to your spiritual
              journey
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold">
              Practice Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Morning Cold Shower, 40-Day Fast, Daily Rosary"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="text-base"
              required
            />
            <p className="text-sm text-muted-foreground">
              Give your practice a clear, meaningful name
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose, rules, or guidelines for this practice..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[100px] text-base resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Optional: Add details about what this practice involves
            </p>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label htmlFor="category" className="text-base font-semibold">
              Category <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, category: cat.value })
                    }
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                      ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md scale-105"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      }
                    `}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        isSelected ? "text-primary" : cat.color
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-primary" : ""
                      }`}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Category Input */}
            {formData.category === "custom" && (
              <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="customCategory" className="text-sm font-medium">
                  Custom Category Name
                </Label>
                <Input
                  id="customCategory"
                  placeholder="Enter your custom category"
                  value={formData.customCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, customCategory: e.target.value })
                  }
                  className="text-base"
                />
              </div>
            )}
          </div>

          {/* Tracking Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Tracking Type <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-3">
              {TRACKING_TYPES.map((type) => {
                const isSelected = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, type: type.value as any })
                    }
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isSelected ? "text-primary" : ""
                            }`}
                          >
                            {type.label}
                          </span>
                          {isSelected && (
                            <Badge variant="default" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Card */}
          {formData.title && (
            <div className="space-y-2 pt-4 border-t animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Label className="text-base font-semibold">Preview</Label>
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CategoryIcon
                        className={`h-5 w-5 ${
                          selectedCategory?.color || "text-primary"
                        }`}
                      />
                      <Badge variant="secondary">
                        {formData.category === "custom"
                          ? formData.customCategory || "Custom"
                          : selectedCategory?.label || "Uncategorized"}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {
                        TRACKING_TYPES.find(
                          (t) => t.value === formData.type
                        )?.label.split(" ")[0]
                      }
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{formData.title}</CardTitle>
                  {formData.description && (
                    <CardDescription className="line-clamp-2">
                      {formData.description}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3 bg-muted/30 border-t">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              setFormData({
                title: "",
                description: "",
                category: "",
                customCategory: "",
                type: "BOOLEAN",
                icon: "",
              });
            }}
            disabled={isSubmitting}
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            className="flex-1 gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Creating...</>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Create Practice
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
