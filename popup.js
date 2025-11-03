/**
 * This is the logic for printing text from the parsers.
 *
 * @author Jude Rorie
 * @date 10/30/2025
 *
 */
 
const status = document.getElementById('status');
const output = document.getElementById('output');

/**
 * Main logic executed once Chrome identifies the active tab.
 * Queries the current active tab, verifies it's a BBC News article,
 * injects script to extract HTML, loads custom parser, extracts paragraphs.
 *
 * @callback chrome.tabs.query
 * @param {object[]} tabs - Array of active tabs returned by Chrome
 */
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
	const tab = tabs[0];
	if (!tab || !tab.url) {
		status.textContent = 'No active tab detected.'; // Update UI message
		return; // Stop execution if no tab or missing URL
	}

	const url = tab.url; // Store page URL

	// Validate that the tab is a BBC News article URL using regex
	if (!/bbc\.(co\.uk|com)\/news\//i.test(url)) {
		status.textContent = 'This is not a BBC News article.'; // User feedback
		return; // Stop if page is not a BBC news article
	}

	status.textContent = 'Parsing article...'; // Notify user of parsing

	try {
		/**
		 * Inject content script to retrieve the page's HTML source by executing
		 * document.documentElement.outerHTML inside the tab.
		 */
		const [{ result: html }] = await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			func: () => document.documentElement.outerHTML
		});

		// Create hidden iframe to safely parse HTML without polluting popup DOM
		const iframe = document.createElement('iframe');
		iframe.style.display = 'none';
		document.body.appendChild(iframe);

		const doc = iframe.contentDocument;

		// Write the scraped HTML into the new iframe context
		doc.open();
		doc.write(html);
		doc.close();

		// Create <script> tag
		const script = doc.createElement('script');
		script.src = chrome.runtime.getURL('parsers/bbc_parser.js');

		// --- script.onload ---
		/**
		 * Executes when parser script has loaded inside iframe.
		 * Attempts custom parsing functions, falls back to raw scraping.
		 */
		script.onload = () => {
			try {
				// Try multiple known parser entry points for compatibility
				const parserFunc =
					doc.defaultView.parseArticleContent ||
					doc.defaultView.parseBBCArticle ||
					doc.defaultView.parseMetadata;

				let paragraphs = [];

				// If parser function exists, call it
				if (parserFunc) {
					const result = parserFunc(doc);

					// If returned text is array, use directly
					if (Array.isArray(result?.text)) {
						paragraphs = result.text;
					}
					// If returned text is string, split into paragraphs by blank lines
					else if (typeof result?.text === 'string') {
						paragraphs = result.text
							.split(/\n+/) // Split on newlines
							.map(p => p.trim()) // Trim whitespace
							.filter(Boolean); // Remove empty lines
					}
				}

				if (paragraphs.length === 0) {
					console.warn('[BBC Parser] Falling back to raw paragraph scraping.');

					// Try to detect primary article container elements
					const article = doc.querySelector(
						'main article, main [data-component="article-body"], article, [data-component="text-block"]'
					);

					// If found, collect all <p> text inside
					if (article) {
						paragraphs = Array.from(article.querySelectorAll('p'))
							.map(p => p.innerText.trim())
							.filter(Boolean);
					}
				}

				// Display results to user
				status.textContent = ''
				output.textContent =
					paragraphs.length > 0
						? paragraphs.join('\n\n')
						: '(No article text found)';

			} catch (err) {
				console.error('[BBC Parser] Runtime error:', err);
				status.textContent = 'Error parsing article.'; // Error UI message
			}
		};

		// Append parser script to iframe once body exists
		if (doc.body) {
			doc.body.appendChild(script);
		} else {
			doc.addEventListener(
				'DOMContentLoaded',
				() => {
					doc.body.appendChild(script);
				},
				{ once: true }
			);
		}

	} catch (e) {
		// Catch any script execution failures
		console.error('[BBC Parser] Execution error:', e);
		status.textContent = 'Execution error.';
	}
});
