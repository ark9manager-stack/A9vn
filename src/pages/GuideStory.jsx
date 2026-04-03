import React from "react";
import { BookOpen, Scroll } from "lucide-react";

const GuideStory = () => {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
          Guide & Story
        </h1>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-8 rounded-xl border border-border bg-card/60">
            <BookOpen className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-foreground text-xl font-semibold mb-2">
              Guides
            </h2>
            <p className="text-muted-foreground text-sm">
              Beginner and advanced gameplay guides coming soon.
            </p>
          </div>
          <div className="p-8 rounded-xl border border-border bg-card/60">
            <Scroll className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-foreground text-xl font-semibold mb-2">
              Story Timeline
            </h2>
            <p className="text-muted-foreground text-sm">
              The full Arknights story and lore timeline — coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideStory;
