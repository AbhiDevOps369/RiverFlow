"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/Auth";
import { account, avatars, storage } from "@/models/client/config";
import { ID, Permission, Role } from "appwrite";
import { questionAttachmentBucket } from "@/models/name";
import slugify from "@/utils/slugify";
import { useRouter } from "next/navigation";

const EditProfilePage = () => {
    const { user, verfiySession } = useAuthStore();
    const router = useRouter();

    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError("");
        setSuccess("");
        try {
                        // If a new profile image is selected, upload it first
            let avatarId: string | undefined;
            if (file) {
                try {
                    const uploadRes = await storage.createFile(
                        questionAttachmentBucket,
                        ID.unique(),
                        file,
                        [Permission.read(Role.any())] // Make the file publicly readable
                    );
                    avatarId = uploadRes.$id;
                } catch (uploadErr: any) {
                    setError(uploadErr?.message || "Image upload failed");
                    setLoading(false);
                    return;
                }
            }
            // Update name
            await account.updateName(name.trim());
            
            // Fetch current user again to get the most up-to-date prefs before updating
            const currentUser = await account.get<UserPrefs>();
            
            // Update prefs with avatar if uploaded
            if (avatarId) {
                await account.updatePrefs({
                    ...currentUser.prefs,
                    avatarId
                });
            }
            
            // Small delay to ensure Appwrite propagation
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            // Refresh the store with latest user data
            await verfiySession();
            
            // Verify if it was actually saved
            const verifyUser = await account.get<UserPrefs>();
            if (avatarId && verifyUser.prefs.avatarId !== avatarId) {
                console.error("Prefs update verification failed");
                // Try one more time if it failed
                await account.updatePrefs({ ...verifyUser.prefs, avatarId });
            }
            setSuccess("Profile updated successfully!");
            // Redirect to new slug after a short delay
            setTimeout(() => {
                router.push(`/users/${user?.$id}/${slugify(name.trim())}`);
            }, 1200);
        } catch (err: any) {
            setError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-gray-400">Please log in to edit your profile.</p>
            </div>
        );
    }

    const avatarUrl = file 
        ? URL.createObjectURL(file) 
        : user.prefs?.avatarId 
            ? storage.getFileView(questionAttachmentBucket, user.prefs.avatarId).href 
            : avatars.getInitials(name || user.name, 120, 120).href;

    return (
        <div className="w-full">
            <h2 className="mb-6 text-2xl font-bold">Edit Profile</h2>

            {/* Avatar preview */}
            <div className="mb-8 flex flex-col items-center gap-3">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-purple-500/60 shadow-lg shadow-purple-900/30 transition-all duration-300">
                    <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-end justify-center bg-black/20 pb-1">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Preview</span>
                    </div>
                </div>
                <p className="text-sm text-gray-400">
                    Your avatar will be visible to everyone across RiverFlow.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                {/* Display Name */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={2}
                        maxLength={128}
                        placeholder="Enter your display name"
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Profile Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                    />
                </div>

                {/* Feedback */}
                {success && (
                    <p className="rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-400 border border-green-500/20">
                        ✅ {success}
                    </p>
                )}
                {error && (
                    <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400 border border-red-500/20">
                        ❌ {error}
                    </p>
                )}

                {/* Save button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-900/30 transition-all duration-200 hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-700/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
};

export default EditProfilePage;
