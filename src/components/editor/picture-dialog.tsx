"use client";

import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { AlertCircleIcon, UploadIcon } from "@/components/ui/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pictureDialog } from "@/content/dashboard/settings";
import { repos } from "@/server/repos";
import { cn } from "@/lib/utils";
import { useMedia } from "./media-context";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
/** The mock keeps pictures in the browser, so they are shrunk first. */
const MAX_SIDE = 800;

function shrink(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    image.onerror = () => reject(new Error("unreadable"));
    image.src = url;
  });
}

/** "Add a picture" (board AddPicture): upload a new one, or choose from the ones already uploaded. */
export function PictureDialog({ current, onPick, onClose }: { current: string | null; onPick: (mediaId: string) => void; onClose: () => void }) {
  const media = useMedia();
  const [tab, setTab] = useState<"upload" | "mine">(current ? "mine" : "upload");
  const [selected, setSelected] = useState<string | null>(current);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const receive = async (file: File | undefined) => {
    if (!file) return;
    if (!TYPES.includes(file.type)) return setError(pictureDialog.wrongType);
    if (file.size > MAX_BYTES) return setError(pictureDialog.tooBig);
    setError(null);
    setBusy(true);
    try {
      const added = await repos.media.add({ src: await shrink(file), name: file.name });
      if (added.ok) {
        media.add(added.data);
        setSelected(added.data.id);
        setTab("mine");
      } else setError(pictureDialog.wrongType);
    } catch {
      setError(pictureDialog.wrongType);
    } finally {
      setBusy(false);
    }
  };

  const drop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    void receive(event.dataTransfer.files[0]);
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={pictureDialog.title}
      className="max-w-[480px] gap-[18px]"
      actions={
        <>
          <Button shape="box" variant="secondary" onClick={onClose}>
            {pictureDialog.cancel}
          </Button>
          {tab === "mine" ? (
            <Button shape="box" disabled={!selected} onClick={() => selected && onPick(selected)}>
              {pictureDialog.use}
            </Button>
          ) : null}
        </>
      }
    >
      <Tabs value={tab} onValueChange={(value) => setTab(value as "upload" | "mine")} className="flex flex-col gap-[18px]">
        <TabsList className="self-start">
          <TabsTrigger value="upload">{pictureDialog.upload}</TabsTrigger>
          <TabsTrigger value="mine">{pictureDialog.mine}</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="flex flex-col gap-[18px] focus-visible:outline-none">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={drop}
            className={cn("flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed p-4 text-center transition-colors duration-200", over ? "border-slate bg-soft" : "border-ctrl")}
          >
            <UploadIcon size={32} className="text-slate" />
            <span className="text-base font-semibold">{busy ? pictureDialog.uploading : pictureDialog.drop}</span>
            <span className="text-sm text-mute">{pictureDialog.or}</span>
            <Button shape="box" size="sm" variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
              {pictureDialog.choose}
            </Button>
            <input ref={input} type="file" accept={TYPES.join(",")} hidden onChange={(e) => void receive(e.target.files?.[0])} />
          </div>
          <span className="text-sm text-mute">{pictureDialog.rules}</span>
          {error ? (
            <div role="alert" className="flex items-center gap-2 text-[15px] text-danger">
              <AlertCircleIcon size={18} />
              {error}
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="mine" className="focus-visible:outline-none">
          {media.items.length === 0 ? (
            <p className="m-0 text-[15px] text-mute">{pictureDialog.empty}</p>
          ) : (
            <div className="grid grid-cols-4 gap-2.5">
              {media.items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected === item.id}
                  aria-label={pictureDialog.pictureAlt(index + 1)}
                  onClick={() => setSelected(item.id)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-[10px] border bg-soft p-0 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate",
                    selected === item.id ? "border-2 border-slate" : "border-line",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- library pictures are small data URLs or static files */}
                  <img src={item.src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Dialog>
  );
}
