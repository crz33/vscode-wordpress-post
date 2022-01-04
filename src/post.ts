import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import MarkdownIt = require("markdown-it");
import * as matter from "gray-matter";
import * as cheerio from "cheerio";
import { Context } from "./context";

const REG_WWWIMG = new RegExp("^(http|https):.+");

/**
 * Post to wordpress from current document.
 */
export const post = async (context: Context) => {
  // start
  context.debug(`[00S] post start`);

  // current document
  context.debug(`[01S] get document`);
  const doc = getCurrentDocument();
  context.debug(`[01E] got document`);

  // document path
  context.debug(`[02S] detect document path`);
  const docPath = doc.fileName;
  const docParsedPath = path.parse(docPath);
  context.debug(`[02E] detected document path: ${docPath}`);

  // check document file extension
  context.debug(`[03S] check file extension`);
  if (docParsedPath.ext !== ".md") {
    const msg = `Not a Markdow file: ${docParsedPath.base}`;
    context.debug(`[03Z] ${msg}`);
    throw new Error(msg);
  }
  context.debug(`[03E] check file extension : ok`);

  // post data
  const postData: { [key: string]: any } = {};

  // text -> frontmatter(markdown.data) and markdown(markdown.content)
  context.debug(`[05S] parse document`);
  const markdown = matter(doc.getText());
  context.debug(`[05E] parsed document`);

  // frontmatter -> post data attributes
  context.debug(`[05S] parse frontmatter`);
  const slugKeys = context.getSlugKeys();
  for (const key in markdown.data) {
    if (slugKeys.indexOf(key) > -1) {
      // slug -> id by http request
      const slugs: string[] = markdown.data[key];
      const items = await Promise.all(
        slugs.map((slug) => getWpItem(context, key, { slug: slug }))
      );
      postData[key] = items.map((item) => item["id"]);
    } else {
      postData[key] = markdown.data[key];
    }
    context.debug(`[05I] frontmatter ${key} : ${postData[key]}`);
  }
  context.debug(`[05E] parse frontmatter`);

  // document slug
  context.debug(`[04S] detect document slug`);
  if (!postData["slug"]) {
    postData["slug"] = docParsedPath.name;
  }
  context.debug(`[04E] detected document slug : ${postData["slug"]}`);

  // markdown -> post data content
  context.debug(`[06S] convert to html`);
  postData["content"] = MarkdownIt().render(markdown.content);
  context.debug(`[06E] converted to html`);

  // upload attached image file, change src
  context.debug(`[07S] process attached images`);
  const ch = cheerio.load(postData["content"]);
  const imgs = ch("img");
  for (let i = 0; i < imgs.length; i++) {
    // src attr
    let srcAttr = ch(imgs[i]).attr("src");
    if (!srcAttr) {
      context.debug(`[07I] skip image tag`);
      continue;
    }

    // replace src attr
    if (srcAttr.match(REG_WWWIMG)) {
      // www link -> as is
      // srcAttr = srcAttr
      context.debug(`[07I] www src: ${srcAttr}`);
    } else {
      // local(relative link) -> upload and replace src attr
      // upload
      context.debug(`[07I] local src: ${srcAttr}`);
      const attachedImgPath = path.join(docParsedPath.dir, srcAttr);
      context.debug(`[07I] local path: ${attachedImgPath}`);
      const imgSlug = context.getAttachedImageSlug(
        path.parse(attachedImgPath).name,
        postData["slug"]
      );
      context.debug(`[07I] image slug: ${imgSlug}`);
      const imgItem = await uploadImage(context, imgSlug, attachedImgPath);

      // replace src
      srcAttr = context.replaceAttachedImageUrl(imgItem["source_url"]);

      context.debug(`[07I] final image src: ${srcAttr}`);
    }
    const newImgTag = ch.html(ch(imgs[i]).attr("src", srcAttr));
    if (context.useLinkableImage()) {
      context.debug(`[07I] use a tag`);
      ch(imgs[i]).replaceWith(`<a href="${srcAttr}">${newImgTag}</a>`);
    } else {
      context.debug(`[07I] not use a tag`);
      ch(imgs[i]).replaceWith(`${newImgTag}`);
    }
  }
  context.debug(`[07E] processed attached images`);

  // restore html
  context.debug(`[08S] update html`);
  postData["content"] = ch.html(ch("body > *"), { decodeEntities: false });
  context.debug(`[08E] updated html`);

  // featured image upload
  if (!postData["featured_media"]) {
    context.debug(`[09S] upload featured image`);
    const imgPath = findLocalFeaturedImage(context, docParsedPath);
    if (imgPath === "") {
      const defaultId = context.getDefaultFeaturedImageId();
      if (defaultId >= 0) {
        postData["featured_media"] = context.getDefaultFeaturedImageId();
        context.debug(`[09E] has no image id: ${postData["featured_media"]}`);
      } else {
        context.debug(`[09E] has no image id (not set)`);
      }
    } else {
      const imgSlug = context.getFeaturedImageSlug(postData["slug"]);
      context.debug(`[09I] upload featured image : ${imgPath} as ${imgSlug}`);
      const imgItem = await uploadImage(context, imgSlug, imgPath);
      postData["featured_media"] = imgItem["id"];
      context.debug(`[09E] uploaded image id: ${postData["featured_media"]}`);
    }
  }

  // post
  context.debug(`[10S] post document`);
  const postItem = await getWpItem(
    context,
    "posts",
    { slug: postData["slug"], status: "publish,future,draft,pending,private" },
    false
  );
  let postUrl = context.getUrl("posts");
  if (postItem) {
    postUrl = `${postUrl}/${postItem["id"]}/`;
    context.debug(`[10I] update post id : ${postItem["id"]}`);
  } else {
    context.debug(`[10I] new post`);
  }
  const res = await axios({
    url: postUrl,
    method: `POST`,
    data: postData,
    auth: context.getAuth(),
  });
  const msg = `Finished posting to WordPress. id = ${res.data["id"]}`;
  context.debug(`[10E] ${msg}`);
  vscode.window.showInformationMessage(msg);

  // end
  context.debug(`[00E] post end`);
};

/**
 * upload image to wordpess
 */
const uploadImage = async (context: Context, slug: string, imgPath: string) => {
  // path
  const imgParsedPath = path.parse(imgPath);

  // find image from wordpress, if exists return this item
  const item = await getWpItem(context, "media", { slug: slug }, false);
  if (item) {
    return item;
  }

  // if not exists local image, error
  if (!fs.existsSync(imgPath)) {
    throw new Error(`Not found local image file : ${imgPath}`);
  }

  // create header
  const headers: { [name: string]: string } = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "Content-Type": context.getMediaType(imgParsedPath.ext),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "Content-Disposition": `attachment; filename=${slug}${imgParsedPath.ext}`,
  };

  // load image
  const imageBin = fs.readFileSync(imgPath);

  // post (upload image)
  const res = await axios({
    url: context.getUrl("media"),
    method: `POST`,
    headers: headers,
    data: imageBin,
    auth: context.getAuth(),
  });
  return res.data;
};

/**
 * find feature image from local path
 */
const findLocalFeaturedImage = (
  context: Context,
  docParsedPath: path.ParsedPath
) => {
  for (const ext of context.getMediaExtensions()) {
    const imgPath = path.join(docParsedPath.dir, `${docParsedPath.name}${ext}`);
    if (fs.existsSync(imgPath)) {
      return imgPath;
    }
  }
  return "";
};

/**
 * Find item by slug from http request.
 */
const getWpItem = async (
  context: Context,
  label: string,
  params: { [key: string]: string },
  isThrow = true
) => {
  const res = await axios({
    url: context.getUrl(label),
    method: `GET`,
    params: params,
    auth: context.getAuth(),
  });
  if (res.data.length === 1) {
    return res.data[0];
  } else {
    if (isThrow) {
      throw new Error(`${label}=${params["slug"]} is not found or duplicated.`);
    } else {
      return null;
    }
  }
};

const getCurrentDocument = () => {
  // editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    throw new Error("Please call from markdown file.");
  }

  // return document
  return editor.document;
};
