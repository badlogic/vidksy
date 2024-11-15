import { AtpAgent } from "@atproto/api";

const agent = new AtpAgent({ service: "https://api.bsky.app" });

export type MediaResult = { blob: Blob; isGIF: boolean } | null;

async function resolveBlueskyUrlToAtprotoUri(url: string): Promise<string | null> {
	try {
		const urlPattern = /^https:\/\/bsky\.app\/profile\/([^/]+)\/post\/([^/]+)$/;
		const match = url.match(urlPattern);
		if (!match) {
			console.error("Invalid Bluesky URL");
			return null;
		}
		const handle = match[1];
		const postId = match[2];
		const { data } = await agent.com.atproto.identity.resolveHandle({ handle });
		const did = data.did;
		const atprotoUri = `at://${did}/app.bsky.feed.post/${postId}`;
		return atprotoUri;
	} catch (error) {
		console.error("Error resolving URL to AT Protocol URI:", error);
		return null;
	}
}

async function downloadMedia(url: string): Promise<Blob | null> {
	try {
		const response = await fetch(url);
		return await response.blob();
	} catch (error) {
		console.error("Error downloading media:", error);
		return null;
	}
}

async function handleExternalEmbed(embed: any): Promise<MediaResult> {
	const externalUri = embed.external?.uri;
	if (!externalUri) {
		console.error("No external URI found in the embed.");
		return null;
	}

	let blob: Blob | null;
	let isGIF = false;
	if (externalUri.includes(".mp4")) {
		blob = await downloadMedia(externalUri);
		isGIF = false;
	} else if (externalUri.includes(".gif")) {
		blob = await downloadMedia(externalUri);
		isGIF = true;
	} else {
		console.error("External link is not a downloadable video or GIF.");
		return null;
	}
	if (blob == null) {
		console.error("Could not download media");
		return null;
	}
	return { blob, isGIF };
}

async function handleImagesEmbed(embed: any): Promise<MediaResult> {
	const images = embed.images;
	if (!images || images.length === 0) {
		console.error("No images found in the embed.");
		return null;
	}

	for (const image of images) {
		if (image.fullsize.includes(".gif")) {
			const blob = await downloadMedia(image.fullsize);
			if (blob == null) {
				return null;
			}
			return { blob, isGIF: true };
		}
	}
	console.error("No downloadable GIF found in the images.");
	return null;
}

// Handle recordWithMedia embeds
async function handleRecordWithMediaEmbed(embed: any): Promise<MediaResult> {
	// Handle the media directly in the embed
	if (embed.media?.$type) {
		switch (embed.media.$type) {
			case "app.bsky.embed.external#view":
				return await handleExternalEmbed(embed.media);
			case "app.bsky.embed.images#view":
				return await handleImagesEmbed(embed.media);
			case "app.bsky.embed.video#view":
				return await handleVideoEmbed(embed.media);
			default:
				console.error("Unknown media embed type: " + embed.media.type);
		}
	}
	console.error("No embed media type given");
	return null;
}

async function handleVideoEmbed(embed: any): Promise<MediaResult> {
	const playlistUrl = embed.playlist;
	if (!playlistUrl) {
		console.error("No playlist URL found for the video.");
		return null;
	}

	try {
		const response = await fetch(playlistUrl);
		const m3uContent = await response.text();

		const resolutions = m3uContent
			.split("\n")
			.filter((line) => line.includes(".m3u8"))
			.map((line) => {
				const match = line.match(/RESOLUTION=(\d+)x(\d+)/);
				return {
					resolution: match ? parseInt(match[1]) * parseInt(match[2]) : 0,
					url: new URL(line, playlistUrl).href,
				};
			})
			.sort((a, b) => b.resolution - a.resolution);

		if (resolutions.length === 0) {
			console.error("No video streams found in the playlist.");
			return null;
		}

		const videoStreamUrl = resolutions[0];
		const streamResponse = await fetch(videoStreamUrl.url);
		const streamContent = await streamResponse.text();

		const segmentUrls = streamContent
			.split("\n")
			.filter((line) => line && !line.startsWith("#"))
			.map((line) => new URL(line, videoStreamUrl.url).href);

		if (segmentUrls.length === 0) {
			console.error("No video segments found.");
			return null;
		}

		const segments = await Promise.all(segmentUrls.map(async (url: string): Promise<Blob> => {
            const response = await fetch(url);
            return await response.blob();
        }));

		const concatenatedBlob = new Blob(segments, { type: "video/mp2t" });
		return { blob: concatenatedBlob, isGIF: false };
	} catch (error) {
		console.error("Error handling video embed:", error);
		return null;
	}
}

export async function fetchVideosInPost(postUrl: string, progressCallback: (progress: number, thumbUrl: string | null) => void): Promise<MediaResult> {
	try {
        progressCallback(2, null);
		const atUri = await resolveBlueskyUrlToAtprotoUri(postUrl);
		if (!atUri) return null;

		const response = await agent.api.app.bsky.feed.getPostThread({
			uri: atUri,
			depth: 0,
		});
		const post = response.data.thread.post;
        progressCallback(4, null);
		console.log("Post content:", post);

		const embed = (post as any).embed;
		if (!embed) {
			console.error("No embed found in the post.");
			return null;
		}

        if (embed.thumbnail) {
            progressCallback(5, embed.thumbnail);
        }

		switch (embed.$type) {
			case "app.bsky.embed.external#view":
				return await handleExternalEmbed(embed);
				break;
			case "app.bsky.embed.images#view":
				return await handleImagesEmbed(embed);
				break;
			case "app.bsky.embed.recordWithMedia#view":
				return await handleRecordWithMediaEmbed(embed);
				break;
			case "app.bsky.embed.video#view":
				return await handleVideoEmbed(embed);
				break;
			default:
				console.error(`Unsupported embed type: ${embed.$type}`);
                return null;
		}
	} catch (error) {
		console.error("Error fetching post content:", error);
        return null;
	}
}
