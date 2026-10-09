export type Point = {
    lng: number;
    lat: number;
};

export type SearchResult = {
    lat: string;
    lon: string;
    display_name: string;
};

export type Destination = {
    id: number;
    point: Point | null;
    query: string;
    results: SearchResult[];
};

