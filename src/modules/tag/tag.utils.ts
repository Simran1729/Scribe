import slugify from "slugify";

export const normalizeTag = (tag : string) : string => {
    return tag
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
}

export const slugifyTag = (tag : string ) : string => {
    return slugify(tag, {
        lower : true,
        strict : true,
        trim : true
    })
}

