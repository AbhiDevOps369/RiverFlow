"use client";
import React from "react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconMessage, IconWorldQuestion } from "@tabler/icons-react";
import { useAuthStore } from "@/store/Auth";
import slugify from "@/utils/slugify";
import { avatars, storage } from "@/models/client/config";
import { questionAttachmentBucket } from "@/models/name";

export default function Header() {
    const { user } = useAuthStore();
    
    // Add a timestamp or random key to force image refresh if needed
    const avatarKey = user?.prefs?.avatarId || "default";

    const navItems = [
        {
            name: "Home",
            link: "/",
            icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        {
            name: "Questions",
            link: "/questions",
            icon: <IconWorldQuestion className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
    ];

    if (user)
        navItems.push({
            name: "Profile",
            link: `/users/${user.$id}/${slugify(user.name)}`,
            icon: (
                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-purple-500/50 shadow-sm shadow-purple-900/20">
                    <img
                        src={`${user.prefs?.avatarId ? storage.getFileView(questionAttachmentBucket, user.prefs.avatarId).href : avatars.getInitials(user.name, 40, 40).href}&v=${avatarKey}`}
                        alt={user.name}
                        className="h-full w-full object-cover"
                    />
                </div>
            ),
        });

    return (
        <div className="relative w-full">
            <FloatingNav navItems={navItems} />
        </div>
    );
}
