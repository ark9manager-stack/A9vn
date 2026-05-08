import { ArrowLeft, Construction } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WorkInProgress = ({
  title,
  eyebrow = "PRTS / DEVELOPMENT NODE",
  message = "Khu vuc nay dang duoc xay dung. Vui long quay lai sau khi du lieu duoc dong bo va kiem tra xong.",
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-4xl items-center justify-center">
        <section className="ak-steel-card w-full p-6 sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 font-mono-tech text-xs uppercase tracking-[3px] text-primary/80">
                {eyebrow}
              </div>
              <h1 className="font-heading text-4xl font-bold uppercase tracking-[2px] text-foreground sm:text-5xl">
                {title}
              </h1>
            </div>
          </div>

          <div className="ak-steel-subcard p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div>
                <div className="font-mono-tech text-[0.68rem] uppercase tracking-[2px] text-white/45">
                  STATUS
                </div>
                <div className="font-heading text-xl font-semibold uppercase tracking-[1.5px] text-white">
                  Work in progress
                </div>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {message}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-mono-tech text-[0.68rem] uppercase tracking-[2px] text-white/35">
              ACCESS TEMPORARILY LOCKED
            </div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 border border-white/15 bg-white/[0.04] px-5 py-3 font-heading text-sm font-semibold uppercase tracking-[1.5px] text-white/80 transition hover:border-primary/45 hover:bg-primary/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              Go back
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WorkInProgress;
