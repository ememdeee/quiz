"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { useCourseStore } from "@/store/courseStore";
import type { Course, Video } from "@/lib/courseSchemas";

/* ------------------------------------------------------------------ */
/* TypeScript: declare <wistia-player> as a known HTML element          */
/* ------------------------------------------------------------------ */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wistia-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "media-id": string;
          aspect?: string;
        },
        HTMLElement
      >;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Sidebar video item                                                    */
/* ------------------------------------------------------------------ */
function VideoItem({
  video,
  index,
  isActive,
  isComplete,
  onSelect,
}: {
  video: Video;
  index: number;
  isActive: boolean;
  isComplete: boolean;
  onSelect: () => void;
}) {
  const label = String(index + 1).padStart(2, "0");

  if (isActive) {
    return (
      <div className="p-5 bg-[#DFF3EC]/70 border-l-4 border-[#0F4D3A] flex gap-4 transition-all duration-300">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#0F4D3A] text-white">
          {/* pulsing ring */}
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F4D3A] opacity-20" />
            <span className="relative flex h-8 w-8 rounded-full bg-[#0F4D3A] items-center justify-center">
              <span className="material-symbols-outlined text-base text-white">
                play_arrow
              </span>
            </span>
          </span>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-[#0F4D3A] uppercase tracking-widest">
            {label} · Now Playing
          </p>
          <h3 className="font-bold text-[#191c1d] leading-snug">
            {video.title}
          </h3>
          {video.duration && (
            <span className="text-xs text-[#4a4455] flex items-center gap-1 pt-0.5">
              <span className="material-symbols-outlined text-sm">
                schedule
              </span>
              {video.duration}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <button
        onClick={onSelect}
        className="w-full text-left p-5 hover:bg-[#DFF3EC]/40 hover:pl-6 transition-all duration-200 cursor-pointer group flex gap-4"
      >
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#DFF3EC] text-[#0F4D3A] group-hover:bg-[#0F4D3A] group-hover:text-white transition-all duration-200">
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-[#4a4455]/70 uppercase tracking-widest">
            {label}
          </p>
          <h3 className="font-semibold text-[#191c1d] group-hover:text-[#0F4D3A] transition-colors leading-snug">
            {video.title}
          </h3>
          {video.duration && (
            <span className="text-xs text-[#4a4455] flex items-center gap-1 pt-0.5">
              <span className="material-symbols-outlined text-sm">
                schedule
              </span>
              {video.duration}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-5 hover:bg-[#DFF3EC]/30 hover:pl-6 transition-all duration-200 cursor-pointer group flex gap-4"
    >
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#e1e3e4] text-[#4a4455] group-hover:bg-[#0F4D3A] group-hover:text-white transition-all duration-200">
        <span className="material-symbols-outlined text-lg">play_arrow</span>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-medium text-[#4a4455]/70 uppercase tracking-widest">
          {label}
        </p>
        <h3 className="font-semibold text-[#191c1d] group-hover:text-[#0F4D3A] transition-colors leading-snug">
          {video.title}
        </h3>
        {video.duration && (
          <span className="text-xs text-[#4a4455] flex items-center gap-1 pt-0.5">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {video.duration}
          </span>
        )}
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Wistia Player web component wrapper                                  */
/* ------------------------------------------------------------------ */
function WistiaEmbed({
  mediaId,
  onEnd,
}: {
  mediaId: string;
  onEnd: () => void;
}) {
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    if (
      !document.querySelector('script[src="https://fast.wistia.com/player.js"]')
    ) {
      const playerJs = document.createElement("script");
      playerJs.src = "https://fast.wistia.com/player.js";
      playerJs.async = true;
      document.head.appendChild(playerJs);
    }

    if (
      !document.querySelector(
        `script[src="https://fast.wistia.com/embed/${mediaId}.js"]`,
      )
    ) {
      const embedJs = document.createElement("script");
      embedJs.src = `https://fast.wistia.com/embed/${mediaId}.js`;
      embedJs.type = "module";
      embedJs.async = true;
      document.head.appendChild(embedJs);
    }
  }, [mediaId]);

  useEffect(() => {
    const handler = () => onEndRef.current();

    let player = document.querySelector<HTMLElement>(
      `wistia-player[media-id="${mediaId}"]`,
    );

    if (player) {
      player.addEventListener("end", handler);
      return () => player!.removeEventListener("end", handler);
    }

    const interval = setInterval(() => {
      player = document.querySelector<HTMLElement>(
        `wistia-player[media-id="${mediaId}"]`,
      );
      if (player) {
        clearInterval(interval);
        player.addEventListener("end", handler);
      }
    }, 300);

    return () => {
      clearInterval(interval);
      player?.removeEventListener("end", handler);
    };
  }, [mediaId]);

  return (
    <>
      <style>{`
        wistia-player[media-id='${mediaId}']:not(:defined) {
          background: center / contain no-repeat
            url('https://fast.wistia.com/embed/medias/${mediaId}/swatch');
          display: block;
          filter: blur(5px);
          padding-top: 56.25%;
        }
      `}</style>
      {/* @ts-expect-error — custom element, typed in global JSX above */}
      <wistia-player media-id={mediaId} aspect="1.7777777777777777" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Main CoursePlayer                                                     */
/* ------------------------------------------------------------------ */
export default function CoursePlayer({
  course,
  token,
}: {
  course: Course;
  token: string;
}) {
  const {
    activeVideoId,
    setActiveVideo,
    markVideoComplete,
    isVideoComplete,
    getProgress,
    getLastWatchedVideo,
    reconcileProgress,
  } = useCourseStore();

  const videoIds = course.videos.map((v) => v.id);

  useEffect(() => {
    reconcileProgress(course.id, videoIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id]);

  useEffect(() => {
    const last = getLastWatchedVideo(course.id);
    if (last && videoIds.includes(last)) {
      setActiveVideo(course.id, last);
      return;
    }
    const firstIncomplete = course.videos.find(
      (v) => !isVideoComplete(course.id, v.id),
    );
    setActiveVideo(course.id, firstIncomplete?.id ?? course.videos[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id]);

  const activeVideo =
    course.videos.find((v) => v.id === activeVideoId) ?? course.videos[0];

  const progress = getProgress(course.id, course.videos.length);
  const activeIndex = course.videos.findIndex((v) => v.id === activeVideo?.id);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Track previous video to drive info-panel re-animation
  const [infoKey, setInfoKey] = useState(0);
  const prevVideoId = useRef<string | undefined>(undefined);
  if (activeVideo?.id !== prevVideoId.current) {
    prevVideoId.current = activeVideo?.id;
    // bump only after first mount
    if (prevVideoId.current !== undefined) {
      // will trigger on next render via state update after this render
    }
  }

  const handleVideoSelect = useCallback(
    (courseId: string, videoId: string) => {
      setActiveVideo(courseId, videoId);
      setInfoKey((k) => k + 1);
    },
    [setActiveVideo],
  );

  const onVideoEnd = useCallback(() => {
    if (!activeVideo) return;
    markVideoComplete(course.id, activeVideo.id);
    const next = course.videos[activeIndex + 1];
    if (next) {
      setActiveVideo(course.id, next.id);
      setInfoKey((k) => k + 1);
    }
  }, [
    activeVideo,
    course.id,
    course.videos,
    activeIndex,
    markVideoComplete,
    setActiveVideo,
  ]);

  const handleMarkComplete = () => {
    if (!activeVideo) return;
    markVideoComplete(course.id, activeVideo.id);
    const next = course.videos[activeIndex + 1];
    if (next) {
      setActiveVideo(course.id, next.id);
      setInfoKey((k) => k + 1);
    }
  };

  const completed = isVideoComplete(course.id, activeVideo?.id ?? "");

  return (
    <>
      {/* ── Left: Video + info ── */}
      <section className="flex-grow bg-[#f8f9fa] overflow-y-auto">
        <div
          className={`${sidebarOpen ? "max-w-[1000px]" : "max-w-6xl"
            } mx-auto px-6 py-8 md:py-10 space-y-8 transition-all duration-300`}
        >
          <Link
            href={`/members?token=${token}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4a4455] hover:text-[#0F4D3A] hover:gap-2.5 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-base">
              arrow_back
            </span>
            Back to My Training
          </Link>

          {/* Wistia Player — key swap triggers fade via CSS */}
          <div
            key={activeVideo?.wistiaId}
            className="rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
          >
            {activeVideo && (
              <WistiaEmbed mediaId={activeVideo.wistiaId} onEnd={onVideoEnd} />
            )}
          </div>

          {/* Video info — re-animates on every video switch */}
          <div key={infoKey} className="space-y-4 animate-fade-in-up">
            <div className="flex flex-col flex-wrap md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold tracking-[0.12em] text-[#0F4D3A] uppercase mb-2 block">
                  {course.title}
                  {course.level ? ` · ${course.level}` : ""}
                </span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#191c1d]">
                  {activeVideo?.title}
                </h1>
              </div>

              {!completed ? (
                <button
                  onClick={handleMarkComplete}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0F4D3A] text-white font-semibold rounded-full transition-all duration-200 hover:bg-[#155F4A] hover:scale-105 active:scale-95 shadow-md shadow-[#0F4D3A]/20 flex-shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    check
                  </span>
                  Mark as Complete
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#DFF3EC] text-[#0F4D3A] font-semibold rounded-full flex-shrink-0 animate-scale-in">
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  Completed
                </span>
              )}
            </div>

            {course.description && (
              <p className="text-[#4a4455] text-lg leading-relaxed max-w-3xl">
                {course.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Floating re-open tab (visible when sidebar is collapsed) ── */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#0F4D3A] text-white pl-1 pr-2 py-5 rounded-l-xl shadow-lg flex flex-col items-center gap-1.5 hover:bg-[#155F4A] transition-all duration-200 group cursor-pointer"
        >
          <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform duration-200">
            chevron_left
          </span>
          <span
            className="text-[8px] font-bold uppercase tracking-widest"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Playlist
          </span>
        </button>
      )}

      {/* ── Right: Sidebar ── */}
      <aside
        className={`bg-[#f3f4f5] flex flex-col md:h-[calc(100vh-4rem)] md:sticky md:top-16 border-l border-[#0F4D3A]/10 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0
          ${sidebarOpen ? "w-full md:w-[340px] lg:w-[440px]" : "w-0 border-l-0"}`}
      >
        {/* Progress header */}
        <div className="p-6 space-y-3 relative bg-white shadow-sm flex-shrink-0 min-w-[340px] lg:min-w-[440px]">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-widest text-[#4a4455] uppercase">
              Course Progress
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-[#0F4D3A] tabular-nums">
                {progress}%
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 hidden items-center justify-center rounded-full  bg-[#0F4D3A] text-white transition-all duration-200 cursor-pointer md:flex"
                title="Hide playlist"
              >
                <span className="material-symbols-outlined text-lg">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
          <div className="w-full h-2 bg-[#e1e3e4] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0F4D3A] to-[#C9F84B] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-[#4a4455]/60 font-medium">
            {
              course.videos.filter((v) => isVideoComplete(course.id, v.id))
                .length
            }{" "}
            of {course.videos.length} sessions completed
          </p>
        </div>

        {/* Video list */}
        <div className="flex-grow overflow-y-auto divide-y divide-[#0F4D3A]/8 min-w-[380px] lg:min-w-[440px]">
          {course.videos.map((video, idx) => (
            <VideoItem
              key={video.id}
              video={video}
              index={idx}
              isActive={activeVideo?.id === video.id}
              isComplete={isVideoComplete(course.id, video.id)}
              onSelect={() => handleVideoSelect(course.id, video.id)}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
