const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const parsePagination = (query) => {
    const pageRaw = Number(query.page || 1);
    const limitRaw = Number(query.limit || 20);

    const page = Number.isFinite(pageRaw) ? clamp(Math.floor(pageRaw), 1, 100000) : 1;
    const limit = Number.isFinite(limitRaw) ? clamp(Math.floor(limitRaw), 1, 100) : 20;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

export { parsePagination };
