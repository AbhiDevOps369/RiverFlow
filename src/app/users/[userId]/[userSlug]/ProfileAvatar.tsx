"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/Auth";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_HOST_URL;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const BUCKET = "question-attachment";

function buildUrl(avatarId: string | undefined, name: string) {
    if (avatarId) {
        return `${ENDPOINT}/storage/buckets/${BUCKET}/files/${avatarId}/view?project=${PROJECT}`;
    }
    return `${ENDPOINT}/avatars/initials?name=${encodeURIComponent(name)}&width=200&height=200&project=${PROJECT}`;
}

export default function ProfileAvatar({
    avatarId: avatarIdProp,
    name: nameProp,
    userId,
}: {
    avatarId?: string;
    name: string;
    userId?: string;
}) {
    const { user } = useAuthStore();
    const [errored, setErrored] = useState(false);

    // If viewing your own profile, prefer fresh data from auth store
    const isOwn = userId && user?.$id === userId;
    const avatarId = isOwn ? (user?.prefs?.avatarId ?? avatarIdProp) : avatarIdProp;
    const name = isOwn ? (user?.name ?? nameProp) : nameProp;

    const src = !errored && avatarId ? buildUrl(avatarId, name) : buildUrl(undefined, name);

    return (
        <img
            src={src}
            alt={name}
            width={160}
            height={160}
            onError={() => {
                console.warn("[ProfileAvatar] Failed to load:", src);
                setErrored(true);
            }}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
    );
}
