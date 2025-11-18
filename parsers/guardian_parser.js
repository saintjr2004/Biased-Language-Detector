/**
 * This is the parser for The Guardian.
 *
 * This parser uses extracts metadata and structured
 * content from a Guardian news article.
 *
 * @author Shane Ruegg
 * @date 11/17/2025
 *
 */


/**
 * Parses the page's embedded JSON-LD metadata script. Which contains
 * the title, author, and description, which is typically not found
 * within the HTML <article> block.
 *
 * @returns {object|null} An object with metadata or null if not found.
 */
function parseMetadata() {
  const metadataScript = document.querySelector('script[type="application/ld+json"]');

  if (!metadataScript) {
    console.error("Could not find the JSON-LD metadata script.");
    return null;
  }

  try {
    // The Guardian's JSON-LD is an array. First element contains the article data.
    const metadataArray = JSON.parse(metadataScript.textContent);

    if (!Array.isArray(metadataArray) || metadataArray.length === 0) {
      console.error("JSON-LD metadata is not an array or is empty.");
      return null;
    }

    const metadata = metadataArray[0];

    // The description is not contained in the first element.
    const descriptionTag = document.querySelector('meta[name="description"]');

    return {
      title: metadata.headline || "Title not found",
      author:
        metadata.author && metadata.author[0] ? metadata.author[0].name : "Author not found",
      description: descriptionTag ? descriptionTag.content : "Description not found",
      datePublished: metadata.datePublished || "Date not found",
      dateModified: metadata.dateModified || "Date modified not found",
    };
  } catch (error) {
    console.error("Failed to parse JSON-LD metadata:", error);
    return null;
  }
}

function parseArticleContent() {
  // TODO
}

// --------------------------------------------------------------
// ------------------------Main Execution------------------------
// --------------------------------------------------------------

/**
 * Temporary formatting function for testing, and POC.
 */
function parseGuardianArticle() {
    const summaryInfo = parseMetadata();
    const articleContent = parseArticleContent();

    if (summaryInfo) {
        console.log("--- Summary Info ---");
        console.log(`Title: ${summaryInfo.title}`);
        console.log(`Author: ${summaryInfo.author}`);
        console.log(`Description: ${summaryInfo.description}`);
        console.log(`Published: ${summaryInfo.datePublished}`);
        console.log(`Modified: ${summaryInfo.dateModified}`);
        console.log("\n");
    }

    if (articleContent.length > 0) {
        console.log("--- Article Content ---");
        console.log(articleContent);
    } else {
        console.error("Failed to extract any article content.");
    }
}

parseGuardianArticle()
