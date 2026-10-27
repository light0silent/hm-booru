export { };

declare global {
    interface Window {
        ExtensionV1: {
            registerJob(id: string, h: (ctx: JobParameter, ...a: any[]) => any): void;
            jobProgress(ticket: string, p: ProgressInfo): void;
            sendReady(): void;
            getOrigin(url: string): string;
        }
    }

    namespace H_Manager {
        type ArtistMetadata = { id: string | number, name: string }[];

        interface PostFile {
            url: string
            fileName: string
        }

        interface PostFileDownloadMetadata {
            parsed_path: string
            files_path: string[]
        }

        /** Previously `PreCollection` */
        interface Post {
            id: string
            thumbnail: string | null
            /**domain of the collection's origin  */
            origin: string
            title: string
            artist: ArtistMetadata
            files: PostFile[]
            url: string
            download_metadata?: PostFileDownloadMetadata
            metadata: unknown
            meta_tags: string[]
        }
    }
}