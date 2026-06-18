import api from "./axiosClient";

const searchApi = {

    search: (payload) => {
        return api.post("/search", payload);
    }

};

export default searchApi;