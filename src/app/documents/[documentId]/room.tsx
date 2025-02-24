"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useParams } from "next/navigation";

export function Room({ children }: { children: ReactNode }) {
const params = useParams();

  return (
    <LiveblocksProvider publicApiKey={"pk_dev_hOkDYNzAU85uZUXqpApDeMqX19ebfI-3balxkusXnw5lbzn4HgqH4WVqvx5QzC6h"}>
      <RoomProvider id={params.documentId as string}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}