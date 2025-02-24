"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useParams } from "next/navigation";
import { FullscreenLoader } from "@/components/fullscreen-loader";
import { getUsers, getDocuments } from "./actions";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";
import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins";

type User = { id: string; name: string; avatar: string };

export function Room({ children }: { children: ReactNode }) {
  const params = useParams();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      const list = await getUsers();
      setUsers(list);
    } catch {
      toast.error("Failed to fetch users");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <LiveblocksProvider
      throttle={16}
      authEndpoint={async () => {
        try {
          const endpoint = "/api/liveblocks-auth";
          const room = params.documentId as string;

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // ✅ Added headers
            body: JSON.stringify({ room }),
          });

          if (!response.ok) {
            throw new Error("Failed to authenticate with Liveblocks");
          }

          return await response.json();
        } catch {
          toast.error("Liveblocks authentication failed.");
          return { error: "Authentication failed" }; // Prevents breaking Liveblocks
        }
      }}
      resolveUsers={({ userIds }) =>
        userIds.map((userId) => users.find((user) => user.id === userId) ?? undefined)
      }
      resolveMentionSuggestions={({ text }) => {
        let filteredUsers = users;

        if (text) {
          filteredUsers = users.filter((user) =>
            user.name.toLowerCase().includes(text.toLowerCase())
          );
        }

        return filteredUsers.map((user) => user.id);
      }}
      resolveRoomsInfo={async ({ roomIds }) => {
        try {
          const documents = await getDocuments(roomIds as Id<"documents">[]);
          return documents.map((document) => ({
            id: document.id,
            name: document.name,
          }));
        } catch {
          return [];
        }
      }}
    >
      <RoomProvider id={params.documentId as string} initialStorage={{ leftMargin: LEFT_MARGIN_DEFAULT, rightMargin: RIGHT_MARGIN_DEFAULT }}>
        <ClientSideSuspense fallback={<FullscreenLoader label="Room Loading..." />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}