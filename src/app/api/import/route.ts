import { NextResponse } from "next/server";
import yts from "yt-search";

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    // Standard watch URL: youtube.com/watch?v=ID
    if (u.pathname === "/watch") return u.searchParams.get("v");
    // Short URL: youtu.be/ID
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    // Embed URL: youtube.com/embed/ID
    if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
    // Shorts: youtube.com/shorts/ID
    if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
  } catch {
    // Not a valid URL
  }
  return null;
}

function extractPlaylistId(url: string): string | null {
  try {
    const u = new URL(url);
    return u.searchParams.get("list");
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  try {
    // Try as single video first
    const videoId = extractYouTubeId(url);
    const playlistId = extractPlaylistId(url);

    if (playlistId) {
      // Import entire playlist
      const result = await yts({ listId: playlistId });
      const videos = result.videos || [];
      if (videos.length === 0) {
        return NextResponse.json({ error: "Playlist trống hoặc không tìm thấy" }, { status: 404 });
      }
      const songs = videos.slice(0, 50).map((v: any) => ({
        id: v.videoId,
        title: v.title,
        artist: v.author?.name || "Unknown",
        cover: v.image || v.thumbnail || "",
        thumbnail: v.thumbnail || v.image || "",
        duration: v.timestamp || "",
      }));
      return NextResponse.json({ songs, type: "playlist" });
    }

    if (videoId) {
      // Import single video by ID
      const result = await yts({ videoId });
      if (!result || !result.videoId) {
        return NextResponse.json({ error: "Không tìm thấy video" }, { status: 404 });
      }
      const song = {
        id: result.videoId,
        title: result.title,
        artist: result.author?.name || "Unknown",
        cover: result.image || result.thumbnail || "",
        thumbnail: result.thumbnail || result.image || "",
        duration: result.timestamp || "",
      };
      return NextResponse.json({ songs: [song], type: "video" });
    }

    return NextResponse.json({ error: "URL YouTube không hợp lệ. Dán link video hoặc playlist." }, { status: 400 });
  } catch (error) {
    console.error("Import API Error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy dữ liệu từ YouTube" }, { status: 500 });
  }
}
