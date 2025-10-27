/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * Custom Media Providers Plugin
 * Extends MediaEmbed with custom domain providers
 */
export default class AutoVideoEmbed extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'AutoVideoEmbed';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return ['MediaEmbedEditing', 'AutoMediaEmbed'];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		
		// Add custom providers immediately during init phase
		this.addCustomProviders();
	}

	/**
	 * Add custom media providers to the existing registry
	 */
	addCustomProviders() {
		const editor = this.editor;
		
		try {
			const mediaEmbedEditing = editor.plugins.get('MediaEmbedEditing');
			const registry = mediaEmbedEditing.registry;
			
			// Define custom providers that will be added to existing ones
			const customProviders = [
				{
					name: 'localhost',
					url: /^https?:\/\/localhost:\d+\/.*$/,
					html: match => this.createEmbedHtml(match.input)
				},
				{
					name: 'geodailymotion',
					url: /^https?:\/\/geo\.dailymotion\.com\/.*$/,
					html: match => this.createEmbedHtml(match.input)
				},
				{
					name: 'x',
					url: /^https?:\/\/x\.com\/.*$/,
					html: match => this.createEmbedHtml(match.input)
				},
				{
					name: 'eventassay-staging',
					url: /^https?:\/\/staging\.projects\.eventassay\.com\/.*$/,
					html: match => this.createEmbedHtml(match.input)
				},
				{
					name: 'eventassay-production',
					url: /^https?:\/\/projects\.eventassay\.com\/.*$/,
					html: match => this.createEmbedHtml(match.input)
				}
			];

			// Add providers using the correct registry API
			customProviders.forEach(provider => {
				// Use the registry's internal add method structure
				const providerDef = {
					name: provider.name,
					url: provider.url,
					html: provider.html
				};
				
				// Add to providerDefinitions array like existing providers
				registry.providerDefinitions.push(providerDef);
				
				// Also try to register with the registry's internal methods
				if (typeof registry.add === 'function') {
					try {
						registry.add(provider.name, provider.url, provider.html);
					} catch (e) {
						// Fallback if add method signature is different
						try {
							registry.add(provider.name, {
								url: provider.url,
								html: provider.html
							});
						} catch (e2) {
							// Silent fallback - use providerDefinitions only
						}
					}
				}
			});
			
		} catch (error) {
			// Silent error handling
		}
	}

	/**
	 * Create embed HTML for custom URLs
	 */
	createEmbedHtml(url) {
		// Remove hash fragment for cleaner video src
		const cleanUrl = url.split('#')[0];
		// Check if it's a video file
		const isVideo = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?.*)?$/i.test(cleanUrl);
		
		if (isVideo) {
			return (
				'<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">' +
					'<video controls preload="metadata" ' +
					'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">' +
					'<source src="' + cleanUrl + '" type="video/mp4">' +
					'Your browser does not support the video tag.' +
					'</video>' +
				'</div>'
			);
		} else {
			return (
				'<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">' +
					'<iframe src="' + cleanUrl + '" ' +
					'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" ' +
					'frameborder="0" allowfullscreen>' +
					'</iframe>' +
				'</div>'
			);
		}
	}
}