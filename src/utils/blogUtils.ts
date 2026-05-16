import slugify from "slugify"

export const slugifyBlogTitle = (title : string) => {
    return slugify(title, {
        trim : true,
        lower : true,
        strict : true
    })
}