# WordPress Post

This Visual Studio Code extension provides action that posts articles to WordPress.
This helps people to write WordPress articles in Markdown with Visual Studio Code.

## Features

This extension is simple.
The only Post action in the extension has the following features.

- uploads a featured image.
- convert Markdown to HTML.
    - uploads the image of the image link in the markdown.
    - modifies the URL of the image link to match the WordPress URL.
    - adds an a tag to the image link in the markdown.
- sets the attributes of the article.
    - changes category and tag slugs to IDs.
    - attributes are free if you know the WordPress API.
- reuse articles and images instead of uploading them every time..

The following is a list of articles created with this extension.

[https://masa86.net/my-sample/](https://masa86.net/my-sample/)

## Extension Settings

This extension contributes the following settings:

* `wordpress-post.siteUrl`: URL of WordPress, used create image relative url.
* `wordpress-post.apiUrl`: URL of WordPress, used create relative url.
* `wordpress-post.authUser` : User of WordPress REST API.
* `wordpress-post.authPassword` : Password of WordPress REST API.
* `wordpress-post.slugKeys` : List of slug to ID conversions.
* `wordpress-post.defaultFeaturedImageId` : The ID of the featured image when there was no image.
* `wordpress-post.slugSepalator` : Separator for file names to be added.
* `wordpress-post.prefixFeaturedImageSlug` : Prefix of featured image slug.
* `wordpress-post.suffixFeaturedImageSlug` : Suffix of featured image slug.
* `wordpress-post.typeAttachedImageSlug` : Processing rules for attached image file names.
* `wordpress-post.mediaTypes` : File extensions and media types to enable.
* `wordpress-post.useLinkableImage` : Add a tag to img tag.
* `wordpress-post.debug` : Debug of this extension.

My setting.json is:

```json
{
    "wordpress-post.debug": true,
    "wordpress-post.siteUrl": "https://masa86.net",
    "wordpress-post.apiUrl": "https://masa86.net/wp-json/wp/v2",
    "wordpress-post.authUser": "myuser",
    "wordpress-post.authPassword": "xxxx xxxx xxxx xxxx xxxx xxxx",
    "wordpress-post.useLinkableImage": true
}
```

## Release Notes

### 0.0.1

Initial release of my use case.
