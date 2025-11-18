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
  // TODO
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
