"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "~/lib/stores/auth-store";
import { api } from "~/trpc/react";

export function CreatePost() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState("");

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setName("");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!user) return;
        createPost.mutate({ name, createdById: user.id });
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="text"
        placeholder="Title"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createPost.isLoading}
      >
        {createPost.isLoading ? "Submitting..." : "Submit"}
      </button>

      <p>From client comp</p>
      {JSON.stringify(user, null, 2)}
    </form>
  );
}
