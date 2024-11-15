declare const FFmpegWASM: any;
declare const FFmpegUtil: { fetchFile: (file: Blob) => Promise<Uint8Array> };

export async function convertTsToMp4(file: Blob, progressCallback: (progress: number, time: number ) => void = () => {}): Promise<Blob> {
    const { FFmpeg } = FFmpegWASM;
    const { fetchFile } = FFmpegUtil;
    const ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ message }: { message: string }) => console.log(message));
    ffmpeg.on("progress", ({ progress, time }: { progress: number; time: number }) => {
        progressCallback(progress, time);
        console.log(`Progress: ${(progress * 100).toFixed(2)}%, Time: ${(time / 1000000).toFixed(2)}s`);
    });
    await ffmpeg.load({coreURL: "/assets/core/package/dist/umd/ffmpeg-core.js"});
    const name = "video.ts";
    await ffmpeg.writeFile(name, await fetchFile(file));
    console.log('Starting conversion from .ts to .mp4...');
    await ffmpeg.exec(['-i', name, 'output.mp4']);
    console.log('Conversion complete');
    const data = await ffmpeg.readFile('output.mp4');
    return new Blob([data.buffer], { type: 'video/mp4' });
}