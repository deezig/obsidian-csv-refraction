# CSV Refraction for Obsidian <br> <sub>Native CSV viewing and editing in Obsidian with Rainbow CSV style highlighting.</sub>

I couldn't find an existing Obsidian plugin that offered both Rainbow CSV color coding and the ability to easily view and edit CSV files as either raw source text or a formatted table. So, I built this quickly over an afternoon to solve that problem.

## Features
* **Source Mode:** Edit raw CSV text with Rainbow CSV style highlighting.
* **Table Mode:** View your CSV data as a clean table with a built-in toggle to edit cell values directly.
* Automatically saves changes directly to the `.csv` file.

*Note: The plugin currently only supports strictly comma-separated values (`,`). Other delimiters like semicolons (`;`) or tabs are not supported.*

## Installation

### From the Obsidian Community Plugins
1. Open **Settings** in Obsidian.
2. Go to **Community plugins** and click **Browse**.
3. Search for **CSV Refraction**.
4. Click **Install** and then **Enable**.

### Manual Installation
1. Download the latest `main.js`, `manifest.json`, and `styles.css` from the [GitHub Releases](https://github.com/deezig/obsidian-csv-refraction/releases) page.
2. Create a folder named `csv-refraction` inside your vault's `.obsidian/plugins/` directory.
3. Place the downloaded files into that folder.
4. Reload Obsidian and enable the plugin in your settings.

## Usage
* Open any `.csv` file in your vault.
* Use the view switcher at the top/bottom of the editor to toggle between Source mode and Table mode.

## Maintenance & Development
I created this plugin primarily for my own needs and don't plan to actively maintain or develop it heavily. However, if you find it useful and have a suggestion for an easy feature or improvement, feel free to open an issue! I might work on it further in my free time.

P.S. Shoutout to all CSV lovers!
