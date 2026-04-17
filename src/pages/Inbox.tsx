import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ConversationList } from "@/components/inbox/ConversationList";
import { ChatWindow } from "@/components/inbox/ChatWindow";
import { CustomerPanel } from "@/components/inbox/CustomerPanel";
import { useInboxStore } from "@/store/inboxStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Info } from "lucide-react";

type MobileView = "list" | "chat";

export default function Inbox() {
  const selectedId = useInboxStore((s) => s.selectedId);
  const setSelectedId = useInboxStore((s) => s.setSelectedId);
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Measure container for virtualized list
  const leftRef = useRef<HTMLDivElement | null>(null);
  const [leftHeight, setLeftHeight] = useState(600);
  useLayoutEffect(() => {
    if (!leftRef.current) return;
    const ro = new ResizeObserver(([entry]) => setLeftHeight(entry.contentRect.height));
    ro.observe(leftRef.current);
    return () => ro.disconnect();
  }, []);

  // Mobile: when a chat is selected, swap to chat view
  useEffect(() => {
    if (isMobile && selectedId) setMobileView("chat");
  }, [isMobile, selectedId]);

  if (isMobile) {
    return (
      <div className="h-[calc(100vh-3.5rem)] bg-background">
        {mobileView === "list" ? (
          <div ref={leftRef} className="h-full border-r border-border bg-card/40">
            <ConversationList height={leftHeight} onSelected={() => setMobileView("chat")} />
          </div>
        ) : (
          <div className="relative h-full">
            <ChatWindow
              onBack={() => {
                setMobileView("list");
                setSelectedId(null);
              }}
            />
            {selectedId && (
              <button
                onClick={() => setDetailsOpen(true)}
                className="absolute right-3 top-3 rounded-lg bg-secondary/80 p-2 text-foreground shadow-sm backdrop-blur"
                aria-label="Customer details"
              >
                <Info className="h-4 w-4" />
              </button>
            )}
            <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
              <SheetContent side="right" className="w-[320px] p-0">
                <CustomerPanel />
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="grid bg-background"
      style={{
        height: "calc(100vh - 3.5rem)",
        gridTemplateColumns: "300px minmax(0, 1fr) 320px",
      }}
    >
      <aside ref={leftRef} className="border-r border-border bg-card/40 overflow-hidden">
        <ConversationList height={leftHeight} />
      </aside>
      <section className="min-w-0 overflow-hidden">
        <ChatWindow />
      </section>
      <aside className="border-l border-border bg-card/40 overflow-hidden">
        <CustomerPanel />
      </aside>
    </div>
  );
}
