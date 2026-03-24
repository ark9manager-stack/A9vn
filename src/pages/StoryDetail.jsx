import { useParams, Link } from "react-router-dom";
import { storyArcs } from "@/data/stories";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function StoryDetail() {
  const { id } = useParams();
  const arc = storyArcs.find((a) => a.id === id);
  const [activeChapter, setActiveChapter] = useState(0);

  if (!arc)
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Story not found.
      </div>
    );

  const chapter = arc.chapters[activeChapter];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/guide-story"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Guide & Story
      </Link>

      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
        {arc.title}
      </h1>
      <p className="text-muted-foreground mb-8">{arc.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Chapter list */}
        <div className="space-y-2">
          {arc.chapters.map((ch, i) => (
            <button
              key={ch.id}
              onClick={() => setActiveChapter(i)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all border ${i === activeChapter ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border"}`}
            >
              {ch.title}
            </button>
          ))}
        </div>

        {/* Story content - visual novel style */}
        <div className="ark-card p-6 md:p-8">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
            {chapter.title}
          </h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {chapter.characters.map((c) => (
              <span
                key={c}
                className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium"
              >
                {c}
              </span>
            ))}
          </div>
          {/* Cinematic text box */}
          <div className="bg-secondary/50 border border-border rounded-lg p-6 relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <p className="text-foreground leading-relaxed text-sm md:text-base whitespace-pre-line">
              {chapter.content}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setActiveChapter(Math.max(0, activeChapter - 1))}
              disabled={activeChapter === 0}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() =>
                setActiveChapter(
                  Math.min(arc.chapters.length - 1, activeChapter + 1),
                )
              }
              disabled={activeChapter === arc.chapters.length - 1}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
