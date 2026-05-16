import { generateHTML } from "@tiptap/html";
import { generateText, JSONContent } from "@tiptap/core";
import { tiptapExtensions } from "./extensions";


export const jsontoHtml = (json : JSONContent ) : string => {
    return generateHTML(json, tiptapExtensions)
}

export const jsonToText = (json : JSONContent ) : string => {
    return generateText(json, tiptapExtensions)
}