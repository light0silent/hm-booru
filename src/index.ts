import * as Booru from "booru";
const { registerJob, sendReady, getOrigin } = window.ExtensionV1;

const BooruSites = [
    ['e621.net', 'e6'],
    ['e926.net', 'e9'],
    ['hypnohub.net', 'hh'],
    ['danbooru.donmai.us', 'db'],
    ['konachan.com', 'kc'],
    ['konachan.net', 'kn'],
    ['yande.re', 'yd'],
    ['gelbooru.com', 'gb'],
    ['rule34.xxx', 'r34'],
    ['safebooru.org', 'sb'],
    ['tbib.org', 'tb'],
    ['xbooru.com', 'xb'],
    ['rule34.paheal.net', 'pa'],
    ['derpibooru.org', 'dp'],
    ['realbooru.com', 'rb'],
];

function normalizeArgs(rest: any[]): { url: string, cookies?: string } {
    const a = rest[0];
    if (typeof a === "string") return { url: a, cookies: rest[1] };
    return a as any;
}

function determineSite(url: string) {
    for (let i = 0; i < BooruSites.length; i++)
        if (url.includes(BooruSites[i][0])) return BooruSites[i];
    return false
}

function getThumbnail(post: any): string {
    return `https://${post.booru.domain}/thumbnails/${post.data.directory}/thumbnail_${post.data.image.split('.')[0]}.jpg`
}

registerJob("FETCH", async (ctx, ...rest) => {
    const { url, cookies } = normalizeArgs(rest);
    ctx.signal.throwIfAborted?.();

    const Site = determineSite(url)
    if (!Site) throw new Error("Booru: Not a booru url");

    let id = (url.match(/id=(\d+)/) ? url.match(/id=(\d+)/)![1] : (url.match(/\d+/) ? url.match(/\d+/)![0] : false));
    if (!id) throw new Error("Booru: Failed to get post id from url: " + url);
    
    const SiteCode = Site[1];
    const _metadata = await Booru.search(SiteCode, `id:${id}`).catch(err => { throw err });
    if (!_metadata || !_metadata[0])
        throw _metadata || new Error("Booru: Failed to fetch post, either not found or connection problem..");

    const metadata: Booru.Post = _metadata[0];
    if (!metadata || !metadata.fileUrl)
        throw metadata || new Error("Booru: Failed to fetch post, either not found or connection problem..");

    const file_extension = (metadata.fileUrl || metadata.file_url)!.split('.').pop() || 'jpg';
    const origin = getOrigin(url);
    const Post: H_Manager.Post = {
        title: id,
        id,
        artist: [], // currently no known way to get artist / group from booru tags
        metadata,
        url,
        thumbnail: getThumbnail(metadata),
        meta_tags: metadata.tags,
        files: [{
            fileName: `${SiteCode}_${id}.${file_extension}`,
            url: (metadata.fileUrl || metadata.file_url)!,
        }],
        origin
    }

    return Post;
});
sendReady();
console.log("[booru] jobs registered");