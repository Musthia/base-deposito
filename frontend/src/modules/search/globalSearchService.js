import searchApi from "../../api/searchApi";

export function useSearchService() {

    const search = async ({ schema, query }) => {

        const res = await searchApi.search({
            schema,
            query
        });

        return res.data; // resultados desde backend
    };

    return {
        search
    };
}