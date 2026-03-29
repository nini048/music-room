import { NextResponse } from "next/server";
import yts from "yt-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  try {
    const r = await yts(q);
    const videos = r.videos.slice(0, 30);
    
    // Process results to match internal Song structure
    const results = videos.map((v: any) => ({
      id: v.videoId,
      title: v.title,
      artist: v.author.name,
      cover: v.image || v.thumbnail, // Standard cover image
      thumbnail: v.thumbnail, // Small thumbnail
      duration: v.timestamp // Human readable duration like "4:32"
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch from YouTube Search" }, { status: 500 });
  }
}
