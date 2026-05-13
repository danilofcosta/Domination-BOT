declare module "@mateoaranda/jikanjs" {
  interface JikanAPI {
    search: (
      type: string,
      query: string,
      limit?: number,
      parameters?: Record<string, any>,
    ) => Promise<any>;
    loadCharacter: (id: number, request?: string) => Promise<any>;
    loadAnime: (id: number, request?: string, parameters?: any) => Promise<any>;
    loadManga: (id: number, request?: string, page?: number) => Promise<any>;
    loadPerson: (id: number, request?: string) => Promise<any>;
    raw: (
      urlParts: string[],
      queryParameters?: Record<string, any>,
      mal?: boolean,
    ) => Promise<any>;
    settings: {
      setBaseURL: (url: string) => void;
    };
  }

  declare const jikan: JikanAPI;
  export default jikan;
}
